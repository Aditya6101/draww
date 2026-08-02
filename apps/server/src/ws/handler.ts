import type { ServerWebSocket } from "bun";
import { roomManager } from "../rooms/manager.ts";
import type { WsData } from "../rooms/types.ts";
import { handleYjsBinary, sendDocState } from "./yjsSync.ts";
import { MSG } from "@draww/shared";

function send(ws: ServerWebSocket<WsData>, msg: object) {
  ws.send(JSON.stringify(msg));
}

function broadcastJSON(
  roomId: string,
  msg: object,
  excludeClientId?: string
) {
  const room = roomManager.get(roomId);
  if (!room) return;
  const text = JSON.stringify(msg);
  for (const [cid, client] of room.clients) {
    if (cid !== excludeClientId && client.ws.readyState === 1) {
      client.ws.send(text);
    }
  }
}

/** Called when a new WS connection opens for a room. */
export function onOpen(ws: ServerWebSocket<WsData>) {
  const { roomId, clientId } = ws.data;
  const room = roomManager.getOrCreate(roomId);

  // If room has no clients yet, this client becomes the host candidate
  const isFirstClient = room.clients.size === 0;

  if (isFirstClient) {
    // First joiner immediately becomes host — they'll confirm with host-identify
    room.hostClientId = clientId;
    room.clients.set(clientId, {
      clientId,
      ws,
      displayName: "Anonymous",
      color: "#e63946",
      isHost: true,
      joinedAt: Date.now(),
    });

    // Send room-info immediately so the creator knows they're host
    send(ws, {
      type: MSG.ROOM_INFO,
      clientId,
      peerCount: 0,
      isHost: true,
      peers: [],
    });

    // Sync the (empty) Yjs doc
    sendDocState(ws, roomId);
  } else {
    // New joiner — put them in pending until they send join-request
    room.pendingJoins.set(clientId, {
      clientId,
      ws,
      displayName: "Anonymous",
      color: "#457b9d",
      requestedAt: Date.now(),
    });

    // Ask them for their display name / join info
    send(ws, { type: "need-identity", clientId });
  }

  console.log(`[WS] Client ${clientId} connected to room ${roomId} (${isFirstClient ? "host" : "pending"})`);
}

/** Called for every WebSocket message. Dispatches binary (Yjs) or JSON (control). */
export function onMessage(
  ws: ServerWebSocket<WsData>,
  message: string | Buffer | ArrayBuffer | Uint8Array
) {
  const { roomId, clientId } = ws.data;

  // Binary = Yjs sync protocol
  if (typeof message !== "string") {
    handleYjsBinary(ws, message as Buffer, roomId, clientId);
    return;
  }

  // JSON = control messages
  let msg: any;
  try {
    msg = JSON.parse(message);
  } catch {
    return;
  }

  const room = roomManager.get(roomId);
  if (!room) return;

  switch (msg.type) {
    case MSG.HOST_IDENTIFY: {
      // Creator sends their hostToken so they can be identified as host
      const client = room.clients.get(clientId);
      if (!client) break;
      room.hostToken = msg.hostToken;
      client.displayName = msg.displayName || "Creator";
      client.color = msg.color || "#e63946";
      client.isHost = true;
      console.log(`[WS] Host identified in room ${roomId}: ${client.displayName}`);
      break;
    }

    case MSG.JOIN_REQUEST: {
      // Joiner announces themselves
      const pending = room.pendingJoins.get(clientId);
      if (!pending) break;

      pending.displayName = msg.displayName || "Anonymous";
      pending.color = msg.color || "#457b9d";

      // Notify the host
      if (room.hostClientId) {
        const hostClient = room.clients.get(room.hostClientId);
        if (hostClient && hostClient.ws.readyState === 1) {
          send(hostClient.ws, {
            type: MSG.JOIN_REQUEST,
            joinerId: clientId,
            displayName: pending.displayName,
            color: pending.color,
          });
          break;
        }
      }

      // No host present — auto-approve (first come first serve)
      approveJoin(ws, roomId, clientId);
      break;
    }

    case MSG.JOIN_RESPONSE: {
      // Host responds to a join request
      const requestingClient = room.clients.get(clientId);
      if (!requestingClient?.isHost) break;

      const { joinerId, allow } = msg;
      const pending = room.pendingJoins.get(joinerId);
      if (!pending) break;

      if (allow) {
        approveJoin(pending.ws, roomId, joinerId, pending.displayName, pending.color);
      } else {
        send(pending.ws, { type: MSG.JOIN_DENIED, reason: "The host declined your request." });
        pending.ws.close();
        room.pendingJoins.delete(joinerId);
      }
      break;
    }

    case MSG.AWARENESS_UPDATE: {
      // Forward awareness JSON to peers (cursor positions etc.)
      broadcastJSON(roomId, msg, clientId);
      break;
    }
  }
}

function approveJoin(
  ws: ServerWebSocket<WsData>,
  roomId: string,
  clientId: string,
  displayName?: string,
  color?: string
) {
  const room = roomManager.get(roomId);
  if (!room) return;

  const pending = room.pendingJoins.get(clientId);
  const name = displayName || pending?.displayName || "Anonymous";
  const col = color || pending?.color || "#457b9d";

  room.pendingJoins.delete(clientId);
  room.clients.set(clientId, {
    clientId,
    ws,
    displayName: name,
    color: col,
    isHost: false,
    joinedAt: Date.now(),
  });

  // Tell the joiner they're approved
  send(ws, {
    type: MSG.JOIN_APPROVED,
    clientId,
    peers: Array.from(room.clients.values())
      .filter((c) => c.clientId !== clientId)
      .map((c) => ({ clientId: c.clientId, displayName: c.displayName, color: c.color })),
    peerCount: room.clients.size - 1,
  });

  // Sync the Yjs document to the new joiner
  sendDocState(ws, roomId);

  // Tell everyone else about the new peer
  broadcastJSON(
    roomId,
    { type: MSG.PEER_JOINED, clientId, displayName: name, color: col },
    clientId
  );

  console.log(`[WS] Approved join: ${name} (${clientId}) in room ${roomId}`);
}

/** Called when a WS connection closes. */
export function onClose(ws: ServerWebSocket<WsData>) {
  const { roomId, clientId } = ws.data;
  const room = roomManager.get(roomId);
  if (!room) return;

  const client = room.clients.get(clientId);
  const displayName = client?.displayName || "Unknown";

  const { wasHost, newHost } = roomManager.removeClient(roomId, clientId);

  // Notify remaining peers
  broadcastJSON(roomId, {
    type: MSG.PEER_LEFT,
    clientId,
    displayName,
    wasHost,
    newHostId: newHost,
  });

  if (newHost) {
    const hostClient = room.clients.get(newHost);
    if (hostClient) {
      hostClient.isHost = true;
      send(hostClient.ws, { type: "promoted-to-host" });
    }
  }

  console.log(`[WS] Client disconnected: ${displayName} (${clientId}) from room ${roomId}`);
}
