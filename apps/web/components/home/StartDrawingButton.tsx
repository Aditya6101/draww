'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { nanoid } from 'nanoid'

export function StartDrawingButton({ className }: { className?: string }) {
  const router = useRouter()
  
  const handleStart = async () => {
    // Usually we would POST to an API to create a room.
    // Since draww lets anyone join any room without explicit creation on DB,
    // we just generate a random ID and navigate!
    const roomId = nanoid(10)
    router.push(`/board/${roomId}`)
  }

  return (
    <Button onClick={handleStart} className={`font-sketch text-lg px-6 ${className || ''}`}>
      Start Drawing
    </Button>
  )
}
