import { ClientBoard } from '@/components/board/ClientBoard'

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
  return <ClientBoard roomId={id} isInvite={isInvite} />
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return { title: `Board ${id} — draww` }
}
