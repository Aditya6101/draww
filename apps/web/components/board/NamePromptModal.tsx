'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const USER_COLORS = ['#e63946', '#457b9d', '#2a9d8f', '#f4a261', '#6d6875', '#95d5b2', '#ffd166']

interface Props {
  open: boolean
  onJoin: (name: string, color: string) => void
}

export function NamePromptModal({ open, onJoin }: Props) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(USER_COLORS[0])
  
  const adjectives = ['Swift', 'Gentle', 'Bold', 'Clever', 'Bright', 'Calm', 'Witty']
  const animals = ['Fox', 'Panda', 'Owl', 'Otter', 'Hawk', 'Deer', 'Wolf']
  const randomName = () => {
    const a = adjectives[Math.floor(Math.random() * adjectives.length)]
    const b = animals[Math.floor(Math.random() * animals.length)]
    return `${a} ${b}`
  }
  
  return (
    <Dialog open={open}>
      <DialogContent className="glass border-border">
        <DialogHeader>
          <DialogTitle className="font-sketch text-2xl">Who are you? 🎨</DialogTitle>
          <DialogDescription>Pick a name and color before you join the board.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 rounded-xl bg-muted border border-border text-foreground font-sketch text-lg outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && onJoin(name.trim(), color)}
              autoFocus
            />
            <Button variant="ghost" size="icon" onClick={() => setName(randomName())}>🎲</Button>
          </div>
          <div className="flex gap-2">
            {USER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${color === c ? 'ring-2 ring-offset-2 ring-white scale-110' : ''}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <Button
            className="w-full font-sketch text-lg"
            disabled={!name.trim()}
            onClick={() => onJoin(name.trim() || randomName(), color)}
          >
            Join the Board →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
