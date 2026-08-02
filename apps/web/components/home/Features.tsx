export function Features() {
  const features = [
    { emoji: '🎨', title: 'Sketch anything', desc: 'Shapes, freehand pen, text, arrows. All with a hand-drawn feel.' },
    { emoji: '👥', title: 'Draw together', desc: 'Share an invite link. Collaborators join in seconds, no account needed.' },
    { emoji: '💾', title: 'Save your work', desc: 'Download as PNG or JSON. Your board is saved locally in your browser too.' },
    { emoji: '🚀', title: 'Instant & free', desc: 'No signup, no login, no fuss. Open a board and start drawing.' },
  ]
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((f, i) => (
          <div key={i} className="glass p-6 rounded-2xl sketch-border hover:-translate-y-1 hover:shadow-xl transition-all border-2 border-border border-dashed">
            <div className="text-4xl mb-4">{f.emoji}</div>
            <h3 className="font-sketch text-2xl font-bold mb-2">{f.title}</h3>
            <p className="text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
