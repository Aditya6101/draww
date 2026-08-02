'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { nanoid } from 'nanoid'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { IndexeddbPersistence } from 'y-indexeddb'
import { useLocalBoard } from '@/hooks/useLocalBoard'
import { useToolStore } from '@/lib/store/toolStore'
import { useUIStore } from '@/lib/store/uiStore'
import { Toolbar } from './Toolbar'
import { Cursors } from './Cursors'
import { JoinRequestToasts } from './JoinRequestToast'
import { NamePromptModal } from './NamePromptModal'
import { SharePanel } from './SharePanel'
import { exportToPNG, exportToJSON } from '@/lib/canvas/export'
import type { DrawElement } from '@/lib/canvas/types'
import type { CursorState } from '@/lib/yjs/awareness'
import { Moon, Sun, Users } from 'lucide-react'
import { useTheme } from 'next-themes'

const SketchCanvas = dynamic(
  () => import('./SketchCanvas').then((m) => ({ default: m.SketchCanvas })),
  { ssr: false }
)

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787'

interface Peer { clientId: string; displayName: string; color: string }
interface JoinReq { joinerId: string; displayName: string; color: string }

interface Props {
  roomId: string
  isInvite: boolean
}

export function BoardRoom({ roomId, isInvite }: Props) {
  const { theme, setTheme } = useTheme()
  const [clientId] = useState(() => `c-${nanoid(8)}`)
  const [myName, setMyName] = useState<string | null>(null)
  const [myColor, setMyColor] = useState('#6366f1')
  const [showNameModal, setShowNameModal] = useState(isInvite)
  const [showShare, setShowShare] = useState(false)
  const [peers, setPeers] = useState<Peer[]>([])
  const [joinRequests, setJoinRequests] = useState<JoinReq[]>([])
  const [remoteCursors, setRemoteCursors] = useState<CursorState[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isHost, setIsHost] = useState(!isInvite)
  
  // Yjs state
  const docRef = useRef<Y.Doc | null>(null)
  const shapesRef = useRef<Y.Map<DrawElement> | null>(null)
  const undoManagerRef = useRef<Y.UndoManager | null>(null)
  const providerRef = useRef<WebsocketProvider | null>(null)
  const persistenceRef = useRef<IndexeddbPersistence | null>(null)
  
  // Control WS
  const controlWsRef = useRef<WebSocket | null>(null)
  
  const { isOwner, hostToken, claimOwnership } = useLocalBoard(roomId)
  const { zoom, panX, panY } = useUIStore()
  
  const connectYjs = useCallback((name: string, color: string) => {
    setMyName(name)
    setMyColor(color)
    
    const doc = new Y.Doc({ guid: roomId })
    docRef.current = doc
    
    const persistence = new IndexeddbPersistence(`draww-${roomId}`, doc)
    persistenceRef.current = persistence
    
    const shapes = doc.getMap<DrawElement>('shapes')
    shapesRef.current = shapes
    
    const undoManager = new Y.UndoManager(shapes, { trackedOrigins: new Set([doc.clientID]) })
    undoManagerRef.current = undoManager
    
    const wsUrl = `${WS_URL}/ws/${roomId}?clientId=${encodeURIComponent(clientId)}`
    const provider = new WebsocketProvider(WS_URL + '/ws', roomId, doc, {
      params: { clientId },
    })
    providerRef.current = provider
    
    provider.on('status', ({ status }: { status: string }) => {
      setIsConnected(status === 'connected')
    })
    
    // Awareness for cursors
    provider.awareness.setLocalState({ displayName: name, color, cursor: null, selectedIds: [] })
    provider.awareness.on('change', () => {
      const states: CursorState[] = []
      provider.awareness.getStates().forEach((state, cid) => {
        if (cid !== provider.awareness.clientID && state.cursor !== undefined) {
          states.push({ clientId: String(cid), displayName: state.displayName || 'Anonymous', color: state.color || '#6366f1', cursor: state.cursor, selectedIds: state.selectedIds || [] })
        }
      })
      setRemoteCursors(states)
    })
    
    return { doc, shapes, undoManager, provider }
  }, [roomId, clientId])
  
  const connectControl = useCallback((name: string, color: string, token?: string) => {
    const ws = new WebSocket(`${WS_URL}/ws/${roomId}?clientId=${encodeURIComponent(clientId)}-ctrl`)
    controlWsRef.current = ws
    
    ws.onopen = () => {
      if (!isInvite) {
        // Creator: identify as host
        ws.send(JSON.stringify({ type: 'host-identify', hostToken: token || claimOwnership(), displayName: name, color }))
      } else {
        // Joiner: send join request
        ws.send(JSON.stringify({ type: 'join-request', displayName: name, color }))
      }
    }
    
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data)
        switch (msg.type) {
          case 'join-request':
            setJoinRequests(prev => [...prev, { joinerId: msg.joinerId, displayName: msg.displayName, color: msg.color }])
            break
          case 'join-approved':
            setIsHost(false)
            setPeers(msg.peers || [])
            break
          case 'join-denied':
            alert('The host declined your request to join.')
            window.location.href = '/'
            break
          case 'room-info':
            setIsHost(msg.isHost)
            setPeers(msg.peers || [])
            break
          case 'peer-joined':
            setPeers(prev => [...prev.filter(p => p.clientId !== msg.clientId), { clientId: msg.clientId, displayName: msg.displayName, color: msg.color }])
            break
          case 'peer-left':
            setPeers(prev => prev.filter(p => p.clientId !== msg.clientId))
            if (msg.newHostId === clientId) setIsHost(true)
            break
          case 'promoted-to-host':
            setIsHost(true)
            break
        }
      } catch {}
    }
  }, [roomId, clientId, isInvite, claimOwnership])
  
  // Auto-connect for creators (non-invite)
  useEffect(() => {
    if (!isInvite) {
      const savedName = localStorage.getItem('draww:myname') || `Creator ${Math.floor(Math.random() * 100)}`
      const savedColor = localStorage.getItem('draww:mycolor') || '#6366f1'
      setMyName(savedName)
      setMyColor(savedColor)
      connectYjs(savedName, savedColor)
      const token = isOwner ? (hostToken || claimOwnership()) : claimOwnership()
      connectControl(savedName, savedColor, token)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  const handleJoin = (name: string, color: string) => {
    localStorage.setItem('draww:myname', name)
    localStorage.setItem('draww:mycolor', color)
    setShowNameModal(false)
    connectYjs(name, color)
    connectControl(name, color)
  }
  
  const handleAllow = (joinerId: string) => {
    controlWsRef.current?.send(JSON.stringify({ type: 'join-response', joinerId, allow: true }))
    setJoinRequests(prev => prev.filter(r => r.joinerId !== joinerId))
  }
  
  const handleDeny = (joinerId: string) => {
    controlWsRef.current?.send(JSON.stringify({ type: 'join-response', joinerId, allow: false }))
    setJoinRequests(prev => prev.filter(r => r.joinerId !== joinerId))
  }
  
  const handleExportPNG = () => {
    const canvas = document.querySelector('canvas') as HTMLCanvasElement
    if (canvas) exportToPNG(canvas)
  }
  
  const handleExportJSON = () => {
    const shapes = shapesRef.current
    if (shapes) exportToJSON(Array.from(shapes.values()))
  }
  
  useEffect(() => {
    return () => {
      providerRef.current?.disconnect()
      persistenceRef.current?.destroy()
      docRef.current?.destroy()
      controlWsRef.current?.close()
    }
  }, [])
  
  const shapes = shapesRef.current
  const undoManager = undoManagerRef.current
  
  return (
    <div className="board-layout bg-background h-screen w-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-border h-12 flex items-center justify-between px-4 shrink-0 bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <a href="/" className="font-sketch text-xl font-bold gradient-text">draww</a>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span className="text-xs text-muted-foreground font-sketch">
              {isConnected ? `${peers.length + 1} online` : 'connecting...'}
            </span>
          </div>
          {isHost && <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-sketch">host</span>}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Peer avatars */}
          <div className="flex -space-x-2">
            <div className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-sketch font-bold" style={{ background: myColor }}>
              {myName?.[0]?.toUpperCase() ?? '?'}
            </div>
            {peers.slice(0, 4).map(p => (
              <div key={p.clientId} className="w-7 h-7 rounded-full border-2 border-background flex items-center justify-center text-white text-xs font-sketch font-bold" style={{ background: p.color }} title={p.displayName}>
                {p.displayName[0]?.toUpperCase()}
              </div>
            ))}
            {peers.length > 4 && (
              <div className="w-7 h-7 rounded-full border-2 border-background bg-muted flex items-center justify-center text-xs text-muted-foreground">+{peers.length - 4}</div>
            )}
          </div>
          
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        </div>
      </header>
      
      {/* Canvas area */}
      <div className="relative flex-1 flex overflow-hidden">
        {/* Toolbar */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          <Toolbar
            onUndo={() => undoManagerRef.current?.undo()}
            onRedo={() => undoManagerRef.current?.redo()}
            onExportPNG={handleExportPNG}
            onShare={() => setShowShare(true)}
          />
        </div>
        
        {/* Canvas */}
        {shapes && undoManager ? (
          <SketchCanvas shapes={shapes} clientId={clientId} undoManager={undoManager} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-sketch text-2xl text-muted-foreground animate-pulse">Setting up your board...</p>
          </div>
        )}
        
        {/* Remote cursors */}
        {shapes && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <Cursors cursors={remoteCursors} zoom={zoom} panX={panX} panY={panY} />
          </div>
        )}
      </div>
      
      {/* Modals and overlays */}
      <NamePromptModal open={showNameModal} onJoin={handleJoin} />
      <JoinRequestToasts requests={joinRequests} onAllow={handleAllow} onDeny={handleDeny} />
      <SharePanel open={showShare} onClose={() => setShowShare(false)} roomId={roomId} />
    </div>
  )
}
