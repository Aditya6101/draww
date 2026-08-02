'use client'

interface JoinRequest {
  joinerId: string
  displayName: string
  color: string
}

interface Props {
  requests: JoinRequest[]
  onAllow: (joinerId: string) => void
  onDeny: (joinerId: string) => void
}

export function JoinRequestToasts({ requests, onAllow, onDeny }: Props) {
  if (requests.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {requests.map((req) => (
        <div key={req.joinerId} className="glass rounded-2xl p-4 shadow-2xl border border-border flex flex-col gap-3 min-w-72 animate-fade-in-up bg-background">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-sketch text-sm font-bold" style={{ background: req.color }}>
              {req.displayName[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-sketch text-base font-semibold">{req.displayName}</p>
              <p className="text-xs text-muted-foreground">wants to join your board</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onAllow(req.joinerId)}
              className="flex-1 py-1.5 rounded-lg bg-primary text-white font-sketch text-sm hover:bg-primary/90 transition-colors"
            >
              Allow ✓
            </button>
            <button
              onClick={() => onDeny(req.joinerId)}
              className="flex-1 py-1.5 rounded-lg bg-muted text-muted-foreground font-sketch text-sm hover:bg-destructive/20 hover:text-destructive transition-colors"
            >
              Deny ✗
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
