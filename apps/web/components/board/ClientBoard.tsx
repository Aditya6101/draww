'use client'

import dynamic from 'next/dynamic'

const BoardRoom = dynamic(
  () => import('./BoardRoom').then(mod => mod.BoardRoom),
  { ssr: false, loading: () => <div className="h-screen w-screen bg-background flex items-center justify-center font-sketch text-2xl text-muted-foreground animate-pulse">Loading board...</div> }
)

export function ClientBoard({ roomId, isInvite }: { roomId: string, isInvite: boolean }) {
  return <BoardRoom roomId={roomId} isInvite={isInvite} />
}
