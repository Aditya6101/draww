import { create } from 'zustand'

interface UIState {
  zoom: number
  panX: number
  panY: number
  selectedIds: string[]
  isDrawing: boolean
  setZoom: (zoom: number) => void
  setPan: (panX: number, panY: number) => void
  setSelectedIds: (ids: string[]) => void
  setIsDrawing: (isDrawing: boolean) => void
  resetView: () => void
}

export const useUIStore = create<UIState>((set) => ({
  zoom: 1,
  panX: 0,
  panY: 0,
  selectedIds: [],
  isDrawing: false,
  setZoom: (zoom) => set({ zoom }),
  setPan: (panX, panY) => set({ panX, panY }),
  setSelectedIds: (selectedIds) => set({ selectedIds }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  resetView: () => set({ zoom: 1, panX: 0, panY: 0 }),
}))
