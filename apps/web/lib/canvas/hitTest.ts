import type { DrawElement, Point } from './types'

export function hitTest(el: DrawElement, point: Point): boolean {
  const { x, y, width, height } = el
  const tolerance = 8
  
  switch (el.type) {
    case 'rect':
    case 'diamond':
    case 'text':
      return point.x >= x - tolerance && point.x <= x + width + tolerance &&
             point.y >= y - tolerance && point.y <= y + height + tolerance
    case 'ellipse': {
      const cx = x + width/2, cy = y + height/2
      const rx = width/2 + tolerance, ry = height/2 + tolerance
      return ((point.x - cx)**2 / rx**2 + (point.y - cy)**2 / ry**2) <= 1
    }
    case 'arrow': {
      const sx = el.startX ?? x, sy = el.startY ?? y
      const ex = el.endX ?? x + width, ey = el.endY ?? y + height
      return distToSegment(point, {x: sx, y: sy}, {x: ex, y: ey}) < tolerance + 4
    }
    case 'pen': {
      if (!el.points) return false
      for (let i = 1; i < el.points.length; i++) {
        const a = { x: el.points[i-1][0], y: el.points[i-1][1] }
        const b = { x: el.points[i][0], y: el.points[i][1] }
        if (distToSegment(point, a, b) < tolerance + 2) return true
      }
      return false
    }
    default: return false
  }
}

function distToSegment(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dy = b.y - a.y
  if (dx === 0 && dy === 0) return Math.hypot(p.x - a.x, p.y - a.y)
  const t = Math.max(0, Math.min(1, ((p.x - a.x)*dx + (p.y - a.y)*dy) / (dx*dx + dy*dy)))
  return Math.hypot(p.x - (a.x + t*dx), p.y - (a.y + t*dy))
}

export function getElementAtPoint(elements: DrawElement[], point: Point): DrawElement | null {
  // Reverse order so topmost element is selected first
  for (let i = elements.length - 1; i >= 0; i--) {
    if (hitTest(elements[i], point)) return elements[i]
  }
  return null
}
