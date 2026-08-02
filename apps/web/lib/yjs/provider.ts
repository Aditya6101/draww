import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import type { DrawElement } from '@/lib/canvas/types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787'

export interface CollabState {
  doc: Y.Doc
  provider: WebsocketProvider
  persistence: IndexeddbPersistence
  shapes: Y.Map<DrawElement>
  awareness: WebsocketProvider['awareness']
  destroy: () => void
}

export function createCollabRoom(roomId: string, clientId: string): CollabState {
  const doc = new Y.Doc({ guid: roomId })
  
  // Local persistence via IndexedDB
  const persistence = new IndexeddbPersistence(`draww-${roomId}`, doc)
  
  // Remote sync via WebSocket
  const provider = new WebsocketProvider(
    `${WS_URL}/ws`,
    roomId,
    doc,
    {
      params: { clientId },
      connect: true,
    }
  )
  
  // Yjs shared map for all shapes
  const shapes = doc.getMap<DrawElement>('shapes')
  
  return {
    doc,
    provider,
    persistence,
    shapes,
    awareness: provider.awareness,
    destroy() {
      provider.disconnect()
      persistence.destroy()
      doc.destroy()
    },
  }
}
