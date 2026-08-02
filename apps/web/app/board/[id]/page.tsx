import dynamic from 'next/dynamic'

const BoardRoom = dynamic(
  () => import('@/components/board/BoardRoom').then(mod => mod.BoardRoom),
  { ssr: false, loading: () => <div className="h-screen w-screen bg-background flex items-center justify-center font-sketch text-2xl text-muted-foreground animate-pulse">Loading board...</div> }
)

export default async function BoardPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ invite?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const isInvite = sp.invite === 'true'
  return <BoardRoom roomId={id} isInvite={isInvite} />
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Board ${id} — draww` }
}
