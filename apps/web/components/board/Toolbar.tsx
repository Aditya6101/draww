'use client'

import { useToolStore } from '@/lib/store/toolStore'
import { useUIStore } from '@/lib/store/uiStore'
import { cn } from '@/lib/utils'
import {
  MousePointer2, Square, Circle, Diamond, ArrowRight,
  Pen, Type, Hand, Eraser, Undo2, Redo2, ZoomIn, ZoomOut,
  Download, Share2
} from 'lucide-react'
import type { DrawElement } from '@/lib/canvas/types'

const TOOLS = [
  { id: 'select', icon: MousePointer2, label: 'Select', key: 'V' },
  { id: 'rect', icon: Square, label: 'Rectangle', key: 'R' },
  { id: 'ellipse', icon: Circle, label: 'Ellipse', key: 'E' },
  { id: 'diamond', icon: Diamond, label: 'Diamond', key: 'D' },
  { id: 'arrow', icon: ArrowRight, label: 'Arrow', key: 'A' },
  { id: 'pen', icon: Pen, label: 'Pen', key: 'P' },
  { id: 'text', icon: Type, label: 'Text', key: 'T' },
  { id: 'pan', icon: Hand, label: 'Pan', key: 'H' },
  { id: 'eraser', icon: Eraser, label: 'Eraser', key: 'X' },
] as const

const STROKE_COLORS = [
  '#1a1a2e', '#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#6d6875'
]

const STROKE_WIDTHS = [1, 2, 4, 6]

interface ToolbarProps {
  onUndo: () => void
  onRedo: () => void
  onExportPNG: () => void
  onShare: () => void
}

export function Toolbar({ onUndo, onRedo, onExportPNG, onShare }: ToolbarProps) {
  const { activeTool, setActiveTool, strokeColor, setStrokeColor, strokeWidth, setStrokeWidth } = useToolStore()
  const { zoom, setZoom } = useUIStore()
  
  return (
    <div className="glass rounded-xl p-1.5 flex flex-col gap-1 shadow-2xl max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Tools */}
      <div className="flex flex-col gap-0.5">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id as DrawElement['type'])}
            title={`${tool.label} (${tool.key})`}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-150',
              'hover:bg-primary/20 hover:text-primary active:scale-95',
              activeTool === tool.id
                ? 'bg-primary text-white shadow-md shadow-primary/30'
                : 'text-muted-foreground'
            )}
          >
            <tool.icon size={15} />
          </button>
        ))}
      </div>
      
      <div className="w-full h-px bg-border my-0.5" />
      
      {/* Stroke colors */}
      <div className="flex flex-col gap-1">
        {STROKE_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => setStrokeColor(color)}
            className={cn(
              'w-5 h-5 rounded-full mx-auto transition-transform hover:scale-110',
              strokeColor === color && 'ring-2 ring-offset-2 ring-primary ring-offset-background scale-110'
            )}
            style={{ background: color }}
          />
        ))}
      </div>
      
      <div className="w-full h-px bg-border my-0.5" />
      
      {/* Stroke widths */}
      <div className="flex flex-col gap-1 items-center">
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => setStrokeWidth(w)}
            title={`Stroke width ${w}px`}
            className={cn(
              'flex items-center justify-center w-7 h-5 rounded hover:bg-primary/20 transition-colors',
              strokeWidth === w && 'bg-primary/20'
            )}
          >
            <div
              className="bg-foreground rounded-full"
              style={{ width: 16, height: w, opacity: strokeWidth === w ? 1 : 0.5 }}
            />
          </button>
        ))}
      </div>
      
      <div className="w-full h-px bg-border my-0.5" />
      
      {/* Actions */}
      <button onClick={onUndo} title="Undo (Ctrl+Z)" className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
        <Undo2 size={15} />
      </button>
      <button onClick={onRedo} title="Redo (Ctrl+Y)" className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
        <Redo2 size={15} />
      </button>
      
      <div className="w-full h-px bg-border my-0.5" />
      
      {/* Zoom */}
      <button onClick={() => setZoom(Math.min(10, zoom * 1.25))} title="Zoom In" className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
        <ZoomIn size={15} />
      </button>
      <div className="text-center font-sketch text-[10px] text-muted-foreground -my-1">{Math.round(zoom * 100)}%</div>
      <button onClick={() => setZoom(Math.max(0.1, zoom * 0.8))} title="Zoom Out" className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
        <ZoomOut size={15} />
      </button>
      
      <div className="w-full h-px bg-border my-0.5" />
      
      <button onClick={onExportPNG} title="Export PNG" className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-accent/20 hover:text-accent transition-all">
        <Download size={15} />
      </button>
      <button onClick={onShare} title="Share" className="flex items-center justify-center w-8 h-8 rounded-lg text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all">
        <Share2 size={15} />
      </button>
    </div>
  )
}
