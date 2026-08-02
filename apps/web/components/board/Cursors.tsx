'use client'
import type { CursorState } from '@/lib/yjs/awareness'

interface CursorsProps {
  cursors: CursorState[]
  zoom: number
  panX: number
  panY: number
}

export function Cursors({ cursors, zoom, panX, panY }: CursorsProps) {
  return (
    <>
      {cursors.map((c) => {
        if (!c.cursor) return null
        const sx = c.cursor.x * zoom + panX
        const sy = c.cursor.y * zoom + panY
        return (
          <div
            key={c.clientId}
            className="remote-cursor"
            style={{ transform: `translate(${sx}px, ${sy}px)`, position: 'absolute', top: 0, left: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M0 0L0 14L4 10L7 16L9 15L6 9L11 9Z" fill={c.color} stroke="white" strokeWidth="1"/>
            </svg>
            <div
              className="remote-cursor-label"
              style={{ background: c.color, color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', marginTop: '4px', whiteSpace: 'nowrap', width: 'fit-content' }}
            >
              {c.displayName}
            </div>
          </div>
        )
      })}
    </>
  )
}
