import type { Awareness } from 'y-protocols/awareness'

export interface CursorState {
  clientId: string
  displayName: string
  color: string
  cursor: { x: number; y: number } | null
  selectedIds: string[]
}

export function setLocalCursor(
  awareness: Awareness,
  state: Partial<CursorState>
): void {
  awareness.setLocalStateField('cursor', state.cursor ?? null)
  if (state.displayName) awareness.setLocalStateField('displayName', state.displayName)
  if (state.color) awareness.setLocalStateField('color', state.color)
  if (state.selectedIds) awareness.setLocalStateField('selectedIds', state.selectedIds)
}

export function getRemoteCursors(awareness: Awareness, localClientId: number): CursorState[] {
  const states: CursorState[] = []
  awareness.getStates().forEach((state, clientId) => {
    if (clientId !== localClientId && state.cursor !== undefined) {
      states.push({
        clientId: String(clientId),
        displayName: state.displayName || 'Anonymous',
        color: state.color || '#6366f1',
        cursor: state.cursor,
        selectedIds: state.selectedIds || [],
      })
    }
  })
  return states
}
