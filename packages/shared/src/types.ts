// ─── Draw Elements ────────────────────────────────────────────────────────────

export type ToolType =
  | "select"
  | "rect"
  | "ellipse"
  | "diamond"
  | "arrow"
  | "pen"
  | "text"
  | "pan"
  | "eraser";

export type FillStyle = "none" | "hachure" | "solid" | "zigzag" | "cross-hatch" | "dots";

export interface DrawElement {
  id: string;
  type: "rect" | "ellipse" | "diamond" | "arrow" | "pen" | "text" | "image";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  strokeColor: string;
  fillColor: string;
  fillStyle: FillStyle;
  strokeWidth: number;
  roughness: number; // 0 = clean, 1 = slight, 2 = very sketchy
  opacity: number;
  // For pen strokes
  points?: number[][];
  // For text
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  // For arrows
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  // Metadata
  createdBy: string; // clientId
  updatedAt: number; // timestamp for LWW
  locked?: boolean;
}

// ─── Awareness / Presence ─────────────────────────────────────────────────────

export interface UserPresence {
  clientId: string;
  displayName: string;
  color: string;
  cursor: { x: number; y: number } | null;
  selectedIds: string[];
}

// ─── WebSocket Messages ───────────────────────────────────────────────────────

export type WsMessageType =
  | "host-identify"
  | "join-request"
  | "join-response"
  | "join-approved"
  | "join-denied"
  | "room-info"
  | "peer-joined"
  | "peer-left"
  | "awareness-update"
  | "error";

export interface WsMessage {
  type: WsMessageType;
  [key: string]: unknown;
}

// Client → Server
export interface HostIdentifyMsg extends WsMessage {
  type: "host-identify";
  hostToken: string;
  displayName: string;
  color: string;
}

export interface JoinRequestMsg extends WsMessage {
  type: "join-request";
  displayName: string;
  color: string;
}

export interface JoinResponseMsg extends WsMessage {
  type: "join-response";
  joinerId: string;
  allow: boolean;
}

export interface AwarenessUpdateMsg extends WsMessage {
  type: "awareness-update";
  state: UserPresence;
}

// Server → Client
export interface JoinRequestNotifyMsg extends WsMessage {
  type: "join-request";
  joinerId: string;
  displayName: string;
  color: string;
}

export interface JoinApprovedMsg extends WsMessage {
  type: "join-approved";
  clientId: string;
  hostToken?: string; // only sent if client becomes host
}

export interface JoinDeniedMsg extends WsMessage {
  type: "join-denied";
  reason?: string;
}

export interface RoomInfoMsg extends WsMessage {
  type: "room-info";
  clientId: string;
  peerCount: number;
  isHost: boolean;
  peers: Array<{ clientId: string; displayName: string; color: string }>;
}

export interface PeerJoinedMsg extends WsMessage {
  type: "peer-joined";
  clientId: string;
  displayName: string;
  color: string;
}

export interface PeerLeftMsg extends WsMessage {
  type: "peer-left";
  clientId: string;
  displayName: string;
}

// ─── Room Info ────────────────────────────────────────────────────────────────

export interface RoomInfo {
  id: string;
  peerCount: number;
  active: boolean;
}

// ─── Utility Types ────────────────────────────────────────────────────────────

export type Point = { x: number; y: number };

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}
