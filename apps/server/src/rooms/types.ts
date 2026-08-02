import type { ServerWebSocket } from "bun";

export interface RoomClient {
  clientId: string;
  ws: ServerWebSocket<WsData>;
  displayName: string;
  color: string;
  isHost: boolean;
  joinedAt: number;
}

export interface PendingJoin {
  clientId: string;
  ws: ServerWebSocket<WsData>;
  displayName: string;
  color: string;
  requestedAt: number;
}

export interface WsData {
  roomId: string;
  clientId: string;
}
