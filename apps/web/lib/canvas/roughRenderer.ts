import rough from 'roughjs'
import type { DrawElement } from './types'

export function renderElement(ctx: CanvasRenderingContext2D, el: DrawElement): void {
  const rc = rough.canvas(ctx.canvas)
  ctx.save()
  ctx.globalAlpha = el.opacity
  
  const options = {
    stroke: el.strokeColor,
    strokeWidth: el.strokeWidth,
    roughness: el.roughness,
    fill: el.fillColor !== 'transparent' ? el.fillColor : undefined,
    fillStyle: el.fillStyle,
    seed: hashCode(el.id), // deterministic seed so shape looks same on all clients
  }
  
  switch (el.type) {
    case 'rect':
      rc.rectangle(el.x, el.y, el.width, el.height, options)
      break
    case 'ellipse':
      rc.ellipse(el.x + el.width/2, el.y + el.height/2, el.width, el.height, options)
      break
    case 'diamond': {
      const cx = el.x + el.width/2, cy = el.y + el.height/2
      rc.polygon([
        [cx, el.y],
        [el.x + el.width, cy],
        [cx, el.y + el.height],
        [el.x, cy],
      ], options)
      break
    }
    case 'arrow': {
      const sx = el.startX ?? el.x, sy = el.startY ?? el.y
      const ex = el.endX ?? (el.x + el.width), ey = el.endY ?? (el.y + el.height)
      rc.line(sx, sy, ex, ey, options)
      // Draw arrowhead
      const angle = Math.atan2(ey - sy, ex - sx)
      const headLen = 15
      ctx.beginPath()
      ctx.moveTo(ex, ey)
      ctx.lineTo(ex - headLen * Math.cos(angle - Math.PI/6), ey - headLen * Math.sin(angle - Math.PI/6))
      ctx.moveTo(ex, ey)
      ctx.lineTo(ex - headLen * Math.cos(angle + Math.PI/6), ey - headLen * Math.sin(angle + Math.PI/6))
      ctx.strokeStyle = el.strokeColor
      ctx.lineWidth = el.strokeWidth
      ctx.stroke()
      break
    }
    case 'pen': {
      if (!el.points || el.points.length < 2) break
      ctx.beginPath()
      ctx.strokeStyle = el.strokeColor
      ctx.lineWidth = el.strokeWidth
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(el.points[0][0], el.points[0][1])
      for (let i = 1; i < el.points.length; i++) {
        ctx.lineTo(el.points[i][0], el.points[i][1])
      }
      ctx.stroke()
      break
    }
    case 'text': {
      ctx.font = `${el.fontSize || 20}px Caveat, cursive`
      ctx.fillStyle = el.strokeColor
      ctx.fillText(el.text || '', el.x, el.y + (el.fontSize || 20))
      break
    }
  }
  ctx.restore()
}

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

export function renderElements(ctx: CanvasRenderingContext2D, elements: DrawElement[]): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
  for (const el of elements) {
    renderElement(ctx, el)
  }
}
