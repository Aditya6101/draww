// ─── WebSocket Message Types ──────────────────────────────────────────────────

export const MSG = {
  HOST_IDENTIFY: "host-identify",
  JOIN_REQUEST: "join-request",
  JOIN_RESPONSE: "join-response",
  JOIN_APPROVED: "join-approved",
  JOIN_DENIED: "join-denied",
  ROOM_INFO: "room-info",
  PEER_JOINED: "peer-joined",
  PEER_LEFT: "peer-left",
  AWARENESS_UPDATE: "awareness-update",
  ERROR: "error",
} as const;

// ─── Tools ────────────────────────────────────────────────────────────────────

export const TOOLS = {
  SELECT: "select",
  RECT: "rect",
  ELLIPSE: "ellipse",
  DIAMOND: "diamond",
  ARROW: "arrow",
  PEN: "pen",
  TEXT: "text",
  PAN: "pan",
  ERASER: "eraser",
} as const;

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_STROKE_COLOR = "#1a1a2e";
export const DEFAULT_FILL_COLOR = "transparent";
export const DEFAULT_STROKE_WIDTH = 2;
export const DEFAULT_ROUGHNESS = 1.5;
export const DEFAULT_FONT_SIZE = 20;
export const DEFAULT_FONT_FAMILY = "Caveat, cursive";
export const DEFAULT_OPACITY = 1;

// ─── Palette ──────────────────────────────────────────────────────────────────

export const STROKE_COLORS = [
  "#1a1a2e", // near-black
  "#e63946", // red
  "#f4a261", // orange
  "#2a9d8f", // teal
  "#457b9d", // blue
  "#6d6875", // purple
  "#95d5b2", // mint
];

export const FILL_COLORS = [
  "transparent",
  "#ffeaa7", // yellow
  "#fd79a8", // pink
  "#74b9ff", // light blue
  "#a29bfe", // lavender
  "#55efc4", // mint
  "#fab1a0", // salmon
];

// ─── User Colors (auto-assigned to collaborators) ─────────────────────────────

export const USER_COLORS = [
  "#e63946",
  "#457b9d",
  "#2a9d8f",
  "#f4a261",
  "#6d6875",
  "#95d5b2",
  "#ffd166",
  "#06d6a0",
  "#118ab2",
];

// ─── Limits ───────────────────────────────────────────────────────────────────

export const MAX_ZOOM = 10;
export const MIN_ZOOM = 0.1;
export const DEFAULT_ZOOM = 1;
export const GRID_SIZE = 20;

// ─── Yjs Doc Keys ─────────────────────────────────────────────────────────────

export const YJS_SHAPES_KEY = "shapes";
export const YJS_STROKES_KEY = "strokes";
