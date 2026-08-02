import type { DrawElement } from './types'

export function exportToPNG(canvas: HTMLCanvasElement, filename = 'draww-board'): void {
  const link = document.createElement('a')
  link.download = `${filename}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function exportToJSON(elements: DrawElement[], filename = 'draww-board'): void {
  const data = JSON.stringify({ version: 1, elements }, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = `${filename}.draww.json`
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}

export function importFromJSON(file: File): Promise<DrawElement[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        resolve(data.elements || [])
      } catch { reject(new Error('Invalid file')) }
    }
    reader.readAsText(file)
  })
}
