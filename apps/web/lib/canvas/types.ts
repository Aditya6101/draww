export type ToolType = 'select' | 'rect' | 'ellipse' | 'diamond' | 'arrow' | 'pen' | 'text' | 'pan' | 'eraser'

export type FillStyle = 'none' | 'hachure' | 'solid'

export interface DrawElement {
  id: string
  type: 'rect' | 'ellipse' | 'diamond' | 'arrow' | 'pen' | 'text'
  x: number
  y: number
  width: number
  height: number
  rotation: number
  strokeColor: string
  fillColor: string
  fillStyle: FillStyle
  strokeWidth: number
  roughness: number
  opacity: number
  points?: number[][] // for pen
  text?: string // for text
  fontSize?: number
  startX?: number; startY?: number; endX?: number; endY?: number // for arrows
  createdBy: string
  updatedAt: number
}

export interface Point { x: number; y: number }
export interface BBox { x: number; y: number; width: number; height: number }
