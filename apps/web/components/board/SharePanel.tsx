'use client'
import { useState } from 'react'
import { Copy, Check, Link } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  roomId: string
}

export function SharePanel({ open, onClose, roomId }: Props) {
  const [copied, setCopied] = useState(false)
  if (!open) return null
  
  const url = typeof window !== 'undefined' ? `${window.location.origin}/board/${roomId}?invite=true` : ''
  
  const copy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="glass rounded-2xl p-6 shadow-2xl border border-border w-full max-w-md mx-4 bg-background" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Link size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="font-sketch text-xl font-bold">Share this board</h3>
            <p className="text-xs text-muted-foreground">Anyone with the link can request to join</p>
          </div>
        </div>
        <div className="flex gap-2">
          <input
            readOnly
            value={url}
            className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-sm text-muted-foreground outline-none font-mono"
          />
          <button
            onClick={copy}
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-sketch flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
    </div>
  )
}
