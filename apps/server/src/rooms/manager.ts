import * as Y from "yjs";
import type { RoomClient, PendingJoin } from "./types.ts";

export interface Room {
  id: string;
  doc: Y.Doc;
  hostToken: string | null;
  hostClientId: string | null;
  clients: Map<string, RoomClient>; // clientId → RoomClient
  pendingJoins: Map<string, PendingJoin>; // clientId → PendingJoin
  createdAt: number;
  lastActivity: number;
}

class RoomManager {
  private rooms = new Map<string, Room>();

  /** Get or create a room */
  getOrCreate(roomId: string): Room {
    if (!this.rooms.has(roomId)) {
      const doc = new Y.Doc();
      this.rooms.set(roomId, {
        id: roomId,
        doc,
        hostToken: null,
        hostClientId: null,
        clients: new Map(),
        pendingJoins: new Map(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
      });
    }
    return this.rooms.get(roomId)!;
  }

  get(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  exists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  /** Remove client from room, handle host promotion */
  removeClient(roomId: string, clientId: string): { wasHost: boolean; newHost: string | null } {
    const room = this.rooms.get(roomId);
    if (!room) return { wasHost: false, newHost: null };

    const client = room.clients.get(clientId);
    const wasHost = room.hostClientId === clientId;
    room.clients.delete(clientId);
    room.pendingJoins.delete(clientId);
    room.lastActivity = Date.now();

    let newHost: string | null = null;

    if (wasHost && room.clients.size > 0) {
      // Promote the next connected client
      const nextClientId = room.clients.keys().next().value;
      if (nextClientId) {
        room.hostClientId = nextClientId;
        room.hostToken = null; // token-less promotion
        newHost = nextClientId;
      }
    }

    // GC empty rooms
    if (room.clients.size === 0) {
      // Keep room alive for 5 minutes for reconnection
      setTimeout(() => {
        const r = this.rooms.get(roomId);
        if (r && r.clients.size === 0) {
          r.doc.destroy();
          this.rooms.delete(roomId);
          console.log(`[Room] Destroyed empty room: ${roomId}`);
        }
      }, 5 * 60 * 1000);
    }

    return { wasHost, newHost };
  }

  getStats() {
    return {
      rooms: this.rooms.size,
      totalClients: Array.from(this.rooms.values()).reduce(
        (acc, r) => acc + r.clients.size,
        0
      ),
    };
  }
}

export const roomManager = new RoomManager();
