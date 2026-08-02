import { Hono } from "hono";
import { cors } from "hono/cors";
import { nanoid } from "nanoid";
import { roomManager } from "./rooms/manager.ts";
import { onOpen, onMessage, onClose } from "./ws/handler.ts";
import type { WsData } from "./rooms/types.ts";

const app = new Hono();

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(
  "*",
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.FRONTEND_URL || "https://draww.vercel.app",
    ],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// ─── Health ───────────────────────────────────────────────────────────────────
app.get("/", (c) => c.json({ status: "ok", service: "draww-server" }));
app.get("/health", (c) => c.json({ status: "healthy", ...roomManager.getStats() }));

// ─── REST: Create room ────────────────────────────────────────────────────────
app.post("/api/rooms", (c) => {
  const roomId = nanoid(10);
  roomManager.getOrCreate(roomId); // pre-warm the Y.Doc
  return c.json({ roomId });
});

// ─── REST: Check if room exists ───────────────────────────────────────────────
app.get("/api/rooms/:id", (c) => {
  const id = c.req.param("id");
  const exists = roomManager.exists(id);
  return c.json({ id, exists });
});

// ─── Bun.serve with WebSocket ─────────────────────────────────────────────────
const port = parseInt(process.env.PORT || "8787");

Bun.serve<WsData>({
  port,
  fetch(req, server) {
    const url = new URL(req.url);

    // WebSocket upgrade: /ws/:roomId?clientId=xxx
    if (url.pathname.startsWith("/ws/")) {
      const roomId = url.pathname.split("/ws/")[1];
      if (!roomId) return new Response("Missing roomId", { status: 400 });

      const clientId = url.searchParams.get("clientId") || nanoid(8);

      const upgraded = server.upgrade(req, {
        data: { roomId, clientId } satisfies WsData,
      });

      if (upgraded) return undefined;
      return new Response("WebSocket upgrade failed", { status: 400 });
    }

    // All other routes → Hono
    return app.fetch(req);
  },

  websocket: {
    open(ws) {
      onOpen(ws);
    },
    message(ws, msg) {
      onMessage(ws, msg);
    },
    close(ws) {
      onClose(ws);
    },
    perMessageDeflate: true,
    maxPayloadLength: 100 * 1024 * 1024, // 100MB
  },
});

console.log(`🚀 draww server running on http://localhost:${port}`);
console.log(`   WebSocket: ws://localhost:${port}/ws/:roomId`);
