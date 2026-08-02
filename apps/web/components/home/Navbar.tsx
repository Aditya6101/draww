'use client'
import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { StartDrawingButton } from './StartDrawingButton'

export function Navbar() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <nav className="sticky top-0 z-50 glass border-b border-border h-16 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md">
      <div className="font-sketch text-3xl font-bold gradient-text">draww</div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
        >
          {mounted ? (theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />) : <div className="w-[20px] h-[20px]" />}
        </button>
        <StartDrawingButton />
      </div>
    </nav>
  )
}
