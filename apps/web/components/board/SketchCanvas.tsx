'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { nanoid } from 'nanoid'
import * as Y from 'yjs'
import { renderElements, renderElement } from '@/lib/canvas/roughRenderer'
import { getElementAtPoint } from '@/lib/canvas/hitTest'
import { useToolStore } from '@/lib/store/toolStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { DrawElement, Point } from '@/lib/canvas/types'

interface Props {
  shapes: Y.Map<DrawElement>
  clientId: string
  undoManager: Y.UndoManager
}

export function SketchCanvas({ shapes, clientId, undoManager }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { activeTool, strokeColor, fillColor, fillStyle, strokeWidth, roughness, fontSize } = useToolStore()
  const { zoom, panX, panY, setZoom, setPan, setSelectedIds, selectedIds } = useUIStore()
  
  // Drawing state (refs to avoid re-renders)
  const isDrawing = useRef(false)
  const startPoint = useRef<Point | null>(null)
  const currentElement = useRef<DrawElement | null>(null)
  const isDragging = useRef(false)
  const dragOffset = useRef<Point>({ x: 0, y: 0 })
  const isPanning = useRef(false)
  const panStart = useRef<Point>({ x: 0, y: 0 })
  const penPoints = useRef<number[][]>([])
  
  // Convert screen coords to canvas coords
  const screenToCanvas = useCallback((sx: number, sy: number): Point => {
    return { x: (sx - panX) / zoom, y: (sy - panY) / zoom }
  }, [zoom, panX, panY])
  
  // Redraw the entire canvas
  const redraw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.translate(panX, panY)
    ctx.scale(zoom, zoom)
    
    const elements = Array.from(shapes.values())
    renderElements(ctx, elements)
    
    // Draw selection box
    if (selectedIds.length > 0) {
      const selected = elements.filter(e => selectedIds.includes(e.id))
      for (const el of selected) {
        ctx.strokeStyle = '#6366f1'
        ctx.lineWidth = 1.5 / zoom
        ctx.setLineDash([5 / zoom, 3 / zoom])
        ctx.strokeRect(el.x - 4, el.y - 4, el.width + 8, el.height + 8)
        ctx.setLineDash([])
      }
    }
    
    // Draw in-progress element
    if (currentElement.current) {
      renderElement(ctx, currentElement.current)
    }
    
    ctx.restore()
  }, [shapes, selectedIds, zoom, panX, panY])
  
  // Listen to Yjs changes
  useEffect(() => {
    const observer = () => redraw()
    shapes.observe(observer)
    return () => shapes.unobserve(observer)
  }, [shapes, redraw])
  
  // Redraw when zoom/pan/selection changes
  useEffect(() => { redraw() }, [redraw])
  
  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    
    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = container.clientWidth * dpr
      canvas.height = container.clientHeight * dpr
      canvas.style.width = `${container.clientWidth}px`
      canvas.style.height = `${container.clientHeight}px`
      const ctx = canvas.getContext('2d')
      ctx?.scale(dpr, dpr)
      redraw()
    }
    
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [redraw])
  
  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault()
        undoManager.undo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        undoManager.redo()
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedIds.length > 0) {
          shapes.doc?.transact(() => {
            selectedIds.forEach(id => shapes.delete(id))
          })
          setSelectedIds([])
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault()
        setSelectedIds(Array.from(shapes.keys()))
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [selectedIds, shapes, setSelectedIds, undoManager])
  
  const createNewElement = (point: Point): DrawElement => ({
    id: nanoid(),
    type: activeTool as DrawElement['type'],
    x: point.x, y: point.y,
    width: 0, height: 0,
    rotation: 0,
    strokeColor, fillColor, fillStyle,
    strokeWidth, roughness, opacity: 1,
    fontSize,
    createdBy: clientId,
    updatedAt: Date.now(),
  })
  
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.setPointerCapture(e.pointerId)
    
    const rect = canvas.getBoundingClientRect()
    const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const pt = screenToCanvas(screenPt.x, screenPt.y)
    
    // Pan with space or middle mouse
    if (activeTool === 'pan' || e.button === 1) {
      isPanning.current = true
      panStart.current = { x: e.clientX - panX, y: e.clientY - panY }
      return
    }
    
    if (activeTool === 'select') {
      const hit = getElementAtPoint(Array.from(shapes.values()), pt)
      if (hit) {
        setSelectedIds([hit.id])
        isDragging.current = true
        dragOffset.current = { x: pt.x - hit.x, y: pt.y - hit.y }
      } else {
        setSelectedIds([])
      }
      return
    }
    
    if (activeTool === 'eraser') {
      const hit = getElementAtPoint(Array.from(shapes.values()), pt)
      if (hit) shapes.delete(hit.id)
      return
    }
    
    if (activeTool === 'text') {
      const text = window.prompt('Enter text:', '')
      if (text) {
        const el: DrawElement = { ...createNewElement(pt), type: 'text', text, width: text.length * (fontSize * 0.6), height: fontSize + 8 }
        shapes.set(el.id, el)
      }
      return
    }
    
    // Start drawing shapes / pen
    isDrawing.current = true
    startPoint.current = pt
    
    if (activeTool === 'pen') {
      penPoints.current = [[pt.x, pt.y]]
      currentElement.current = { ...createNewElement(pt), type: 'pen', points: [[pt.x, pt.y]] }
    } else if (activeTool === 'arrow') {
      currentElement.current = { ...createNewElement(pt), type: 'arrow', startX: pt.x, startY: pt.y, endX: pt.x, endY: pt.y }
    } else {
      currentElement.current = createNewElement(pt)
    }
  }, [activeTool, screenToCanvas, shapes, setSelectedIds, strokeColor, fillColor, fillStyle, strokeWidth, roughness, fontSize, clientId, panX, panY])
  
  const onPointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const screenPt = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const pt = screenToCanvas(screenPt.x, screenPt.y)
    
    if (isPanning.current) {
      setPan(e.clientX - panStart.current.x, e.clientY - panStart.current.y)
      return
    }
    
    if (isDragging.current && selectedIds.length > 0) {
      const id = selectedIds[0]
      const el = shapes.get(id)
      if (el) {
        shapes.set(id, { ...el, x: pt.x - dragOffset.current.x, y: pt.y - dragOffset.current.y, updatedAt: Date.now() })
      }
      return
    }
    
    if (!isDrawing.current || !currentElement.current || !startPoint.current) return
    
    if (activeTool === 'pen') {
      penPoints.current.push([pt.x, pt.y])
      currentElement.current = { ...currentElement.current, points: [...penPoints.current] }
    } else if (activeTool === 'arrow') {
      currentElement.current = { ...currentElement.current, endX: pt.x, endY: pt.y }
    } else {
      const x = Math.min(startPoint.current.x, pt.x)
      const y = Math.min(startPoint.current.y, pt.y)
      const width = Math.abs(pt.x - startPoint.current.x)
      const height = Math.abs(pt.y - startPoint.current.y)
      currentElement.current = { ...currentElement.current, x, y, width, height }
    }
    redraw()
  }, [activeTool, screenToCanvas, shapes, selectedIds, isDragging, isPanning, panX, panY, setPan, redraw, startPoint])
  
  const onPointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    isPanning.current = false
    isDragging.current = false
    
    if (isDrawing.current && currentElement.current) {
      const el = currentElement.current
      const hasSize = activeTool === 'arrow' ? true : (el.width > 2 || el.height > 2)
      const hasPen = activeTool === 'pen' && (el.points?.length ?? 0) > 1
      
      if (hasSize || hasPen) {
        shapes.set(el.id, el)
      }
    }
    
    isDrawing.current = false
    currentElement.current = null
    penPoints.current = []
    redraw()
  }, [shapes, activeTool, redraw])
  
  const onWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (e.ctrlKey || e.metaKey) {
      const delta = e.deltaY > 0 ? 0.9 : 1.1
      setZoom(Math.max(0.1, Math.min(10, zoom * delta)))
    } else {
      setPan(panX - e.deltaX, panY - e.deltaY)
    }
  }, [zoom, panX, panY, setZoom, setPan])
  
  const cursorMap: Record<string, string> = {
    select: 'default', pan: 'grab', text: 'text',
    rect: 'crosshair', ellipse: 'crosshair', diamond: 'crosshair',
    arrow: 'crosshair', pen: 'crosshair', eraser: 'crosshair',
  }
  
  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        style={{ cursor: cursorMap[activeTool] || 'default', touchAction: 'none' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onWheel={onWheel}
      />
    </div>
  )
}
