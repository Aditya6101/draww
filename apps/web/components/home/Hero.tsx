import { StartDrawingButton } from './StartDrawingButton'

export function Hero() {
  return (
    <section className="py-24 px-6 text-center max-w-4xl mx-auto flex flex-col items-center">
      <h1 className="font-sketch text-5xl md:text-7xl font-bold mb-6 gradient-text">
        Draw. Together. Now.
      </h1>
      <p className="text-xl md:text-2xl text-muted-foreground mb-10">
        A free collaborative whiteboard. No login. No fuss. Just draw.
      </p>
      <StartDrawingButton className="text-xl px-10 py-6 h-auto rounded-2xl shadow-xl hover:scale-105 transition-transform" />
      
      {/* Decorative sketchy elements */}
      <div className="mt-20 relative w-full h-64 opacity-50 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 800 200" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M 100 100 C 150 50, 200 150, 300 100" strokeDasharray="5,5" className="animate-pulse text-indigo-500" />
          <rect x="50" y="50" width="80" height="80" transform="rotate(15 50 50)" className="text-rose-500" />
          <circle cx="500" cy="100" r="40" className="text-teal-500" />
          <path d="M 600 150 L 700 50 L 750 100 Z" className="text-amber-500" />
        </svg>
      </div>
    </section>
  )
}
