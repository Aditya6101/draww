# draww

A fast, real-time collaborative whiteboard with a sketchy/hand-drawn aesthetic. No accounts, no database, no fuss—just instantly share a link and start drawing together.

## 🎨 Features
- **Real-Time Collaboration**: See other users' cursors and live drawing updates with zero conflict, powered by Yjs and WebSockets.
- **Hand-Drawn Aesthetics**: Shapes and lines are rendered using Rough.js to give a natural, sketched look.
- **No Login Required**: Jump right in. Boards are persistent in your browser's local storage.
- **Invite System**: Share your board link, and optionally approve/deny join requests as the board host.
- **Exporting**: Save your work as a PNG image or a JSON file to backup and restore later.
- **Dark Mode**: Fully supported beautiful dark and light themes.

## 🛠 Tech Stack
This project is built using a modern monorepo setup with Turborepo and pnpm:

- **Frontend (`apps/web`)**
  - Next.js 16 (App Router, Turbopack)
  - React 19
  - Tailwind CSS v4
  - Zustand (State Management)
  - Rough.js (Canvas Rendering)
  - shadcn/ui

- **Backend (`apps/server`)**
  - Bun
  - Hono
  - WebSocket (native Bun ws)

- **Collaboration Engine**
  - Yjs (CRDT for conflict-free state sync)
  - y-websocket
  - y-indexeddb (Local Persistence)

## 🚀 Local Development

Make sure you have [Node.js](https://nodejs.org/) and [Bun](https://bun.sh/) installed. We use `pnpm` as the package manager.

```bash
# 1. Install dependencies
pnpm install

# 2. Start the development servers (starts both Frontend & Backend)
pnpm dev
```

- **Frontend**: http://localhost:3000
- **Backend WebSocket**: ws://localhost:8787

## 🌍 Deployment

### 1. Deploy the Backend (Render)
- Connect the repository to [Render](https://render.com) using a new **Web Service**.
- **Root Directory**: `.` (leave blank)
- **Build Command**: `bun install`
- **Start Command**: `cd apps/server && bun run src/index.ts`
- Once deployed, copy the Render URL (change `https://` to `wss://`).

### 2. Deploy the Frontend (Vercel)
- Connect the repository to [Vercel](https://vercel.com).
- Set the **Root Directory** to `apps/web`.
- Leave all Build/Output settings as their defaults.
- Add an Environment Variable:
  - `NEXT_PUBLIC_WS_URL`: `wss://your-render-app.onrender.com`
- Deploy!

*(Optional)* Head back to Render and add `FRONTEND_URL = https://your-vercel-app.vercel.app` to your backend environment variables to strict-check CORS.

## 📝 License
MIT License
