import { create } from 'zustand'
import type { ToolType, FillStyle } from '@/lib/canvas/types'

interface ToolState {
  activeTool: ToolType
  strokeColor: string
  fillColor: string
  fillStyle: FillStyle
  strokeWidth: number
  roughness: number
  fontSize: number
  opacity: number
  setActiveTool: (tool: ToolType) => void
  setStrokeColor: (color: string) => void
  setFillColor: (color: string) => void
  setFillStyle: (style: FillStyle) => void
  setStrokeWidth: (width: number) => void
  setRoughness: (roughness: number) => void
  setFontSize: (size: number) => void
  setOpacity: (opacity: number) => void
}

export const useToolStore = create<ToolState>((set) => ({
  activeTool: 'select',
  strokeColor: '#1a1a2e',
  fillColor: 'transparent',
  fillStyle: 'none',
  strokeWidth: 2,
  roughness: 1.5,
  fontSize: 20,
  opacity: 1,
  setActiveTool: (tool) => set({ activeTool: tool }),
  setStrokeColor: (color) => set({ strokeColor: color }),
  setFillColor: (color) => set({ fillColor: color }),
  setFillStyle: (style) => set({ fillStyle: style }),
  setStrokeWidth: (width) => set({ strokeWidth: width }),
  setRoughness: (roughness) => set({ roughness }),
  setFontSize: (fontSize) => set({ fontSize }),
  setOpacity: (opacity) => set({ opacity }),
}))
