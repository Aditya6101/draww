'use client'
import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'

const OWNED_BOARDS_KEY = 'draww:owned-boards'
const HOST_TOKEN_PREFIX = 'draww:host-token:'

export function useLocalBoard(roomId: string) {
  const [isOwner, setIsOwner] = useState(false)
  const [hostToken, setHostToken] = useState<string | null>(null)

  useEffect(() => {
    const ownedBoards: string[] = JSON.parse(localStorage.getItem(OWNED_BOARDS_KEY) || '[]')
    if (ownedBoards.includes(roomId)) {
      setIsOwner(true)
      setHostToken(localStorage.getItem(`${HOST_TOKEN_PREFIX}${roomId}`))
    }
  }, [roomId])

  function claimOwnership(): string {
    const token = nanoid(32)
    const ownedBoards: string[] = JSON.parse(localStorage.getItem(OWNED_BOARDS_KEY) || '[]')
    if (!ownedBoards.includes(roomId)) {
      ownedBoards.push(roomId)
      localStorage.setItem(OWNED_BOARDS_KEY, JSON.stringify(ownedBoards))
    }
    localStorage.setItem(`${HOST_TOKEN_PREFIX}${roomId}`, token)
    setIsOwner(true)
    setHostToken(token)
    return token
  }

  return { isOwner, hostToken, claimOwnership }
}
