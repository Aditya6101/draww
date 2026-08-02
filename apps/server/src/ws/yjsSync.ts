import * as Y from "yjs";
import * as syncProtocol from "y-protocols/sync";
import * as awarenessProtocol from "y-protocols/awareness";
import * as encoding from "lib0/encoding";
import * as decoding from "lib0/decoding";
import type { ServerWebSocket } from "bun";
import { roomManager } from "../rooms/manager.ts";
import type { WsData } from "../rooms/types.ts";

// Message types from y-protocols
const messageSync = 0;
const messageAwareness = 1;

/**
 * Broadcast a Yjs binary message to all clients in a room EXCEPT the sender.
 */
function broadcast(
  roomId: string,
  message: Uint8Array,
  excludeClientId: string
) {
  const room = roomManager.get(roomId);
  if (!room) return;

  for (const [clientId, client] of room.clients) {
    if (clientId !== excludeClientId && client.ws.readyState === 1) {
      client.ws.send(message);
    }
  }
}

/**
 * Send the current Yjs document state to a newly connected client.
 */
export function sendDocState(ws: ServerWebSocket<WsData>, roomId: string) {
  const room = roomManager.get(roomId);
  if (!room) return;

  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  syncProtocol.writeSyncStep1(encoder, room.doc);
  ws.send(encoding.toUint8Array(encoder));

  // Send awareness states
  const awarenessStates = room.doc.awareness?.getStates();
  if (awarenessStates && awarenessStates.size > 0) {
    const awarenessEncoder = encoding.createEncoder();
    encoding.writeVarUint(awarenessEncoder, messageAwareness);
    awarenessProtocol.encodeAwarenessUpdate(
      room.doc.awareness!,
      Array.from(awarenessStates.keys()),
      awarenessEncoder
    );
    ws.send(encoding.toUint8Array(awarenessEncoder));
  }
}

/**
 * Handle an incoming binary Yjs message from a client.
 */
export function handleYjsBinary(
  ws: ServerWebSocket<WsData>,
  data: Buffer | ArrayBuffer | Uint8Array,
  roomId: string,
  clientId: string
) {
  const room = roomManager.get(roomId);
  if (!room) return;

  const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBuffer);
  const decoder = decoding.createDecoder(uint8);
  const encoder = encoding.createEncoder();
  const messageType = decoding.readVarUint(decoder);

  switch (messageType) {
    case messageSync: {
      encoding.writeVarUint(encoder, messageSync);
      const syncMessageType = syncProtocol.readSyncMessage(
        decoder,
        encoder,
        room.doc,
        ws
      );

      // If we have something to reply, send it back
      if (encoding.length(encoder) > 1) {
        ws.send(encoding.toUint8Array(encoder));
      }

      // Broadcast sync step 2 / update to all other clients
      if (syncMessageType === syncProtocol.messageYjsSyncStep2 || syncMessageType === syncProtocol.messageYjsUpdate) {
        broadcast(roomId, uint8, clientId);
      }
      break;
    }

    case messageAwareness: {
      // Forward awareness update to all other clients
      broadcast(roomId, uint8, clientId);
      break;
    }
  }
}
