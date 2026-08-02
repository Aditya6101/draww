# draww ✏️

A real-time collaborative whiteboard — no login, no database, just draw together.

Inspired by Excalidraw's sketchy aesthetic and Figma's multiplayer feel.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 + TypeScript + Tailwind CSS 4 + shadcn/ui |
| Canvas | HTML5 Canvas 2D + Rough.js (sketchy) + perfect-freehand |
| Collaboration | Yjs (CRDT) + y-websocket + y-indexeddb |
| UI State | Zustand |
| Backend | Bun + Hono |
| Sync Protocol | y-protocols (binary WebSocket) |
| Persistence | Browser IndexedDB (no server DB) |
| Deploy | Vercel (frontend) + Render (backend) |

## Features

- 🎨 Sketchy hand-drawn shapes (rect, ellipse, diamond, arrow, freehand pen, text)
- 👥 Real-time multiplayer — share a link, see each other's cursors live
- 🔒 Host allow/deny join requests
- 💾 Auto-saves to IndexedDB — board survives browser refresh
- 📦 Export as PNG or JSON
- 🌙 Dark / light mode
- ⌨️ Keyboard shortcuts (V, R, E, D, A, P, T, H, X, Ctrl+Z/Y)
- 🔗 Shareable invite links

## Getting Started

### Prerequisites
- [pnpm](https://pnpm.io) ≥ 9
- [Bun](https://bun.sh) ≥ 1.0
- Node.js ≥ 18

### Install

```bash
pnpm install
```

### Development

```bash
# Run both frontend and backend
pnpm dev

# Or individually:
pnpm --filter web dev        # Next.js on :3000
pnpm --filter @draww/server dev  # Bun server on :8787
```

### Environment Variables

**Frontend** (`apps/web/.env.local`):
```
NEXT_PUBLIC_WS_URL=ws://localhost:8787
```

**Backend** (`apps/server/.env`):
```
PORT=8787
FRONTEND_URL=http://localhost:3000
```

## How It Works

### No Database Architecture

Instead of a traditional database, draww uses:

- **Yjs CRDT** — every canvas element is stored in a `Y.Map`. Changes from multiple users merge automatically (conflict-free by math)
- **y-indexeddb** — each browser maintains a local replica of the board in IndexedDB. Boards survive page refreshes and server restarts
- **In-memory rooms** — the Bun server holds `Y.Doc` instances in RAM while a room is active. When everyone leaves, it's garbage collected after 5 minutes

### Join Flow (No Auth)

1. Creator opens `/board/[roomId]` → becomes host (token in localStorage)
2. Creator shares `/board/[roomId]?invite=true` link
3. Joiner enters their name → sends `join-request` via WebSocket
4. Host sees Allow/Deny toast → responds with `join-response`
5. Approved joiners get the full Yjs doc synced instantly

### CRDT Conflict Resolution

All shapes are `Y.Map` entries keyed by `nanoid`. When two users simultaneously edit the same shape (e.g., move it), Yjs uses Last-Write-Wins (LWW) at the property level — the latest timestamp wins, deterministically on all clients.

## Deployment

### Vercel (Frontend)

```bash
vercel --cwd apps/web
```

Set env var: `NEXT_PUBLIC_WS_URL=wss://your-render-url.onrender.com`

### Render (Backend)

Connect your GitHub repo, Render will auto-detect `render.yaml` and deploy the Bun server.

Set env var: `FRONTEND_URL=https://your-vercel-url.vercel.app`

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `V` | Select tool |
| `R` | Rectangle |
| `E` | Ellipse |
| `D` | Diamond |
| `A` | Arrow |
| `P` | Pen |
| `T` | Text |
| `H` | Pan |
| `X` | Eraser |
| `Ctrl+Z` | Undo |
| `Ctrl+Y` / `Ctrl+Shift+Z` | Redo |
| `Del` / `Backspace` | Delete selected |
| `Ctrl+A` | Select all |
| `Ctrl+Scroll` | Zoom |

## Project Structure

```
draww/
├── apps/
│   ├── web/          # Next.js frontend (Vercel)
│   └── server/       # Bun + Hono backend (Render)
├── packages/
│   └── shared/       # Shared TypeScript types
├── render.yaml       # Render deployment config
└── vercel.json       # Vercel deployment config
```
