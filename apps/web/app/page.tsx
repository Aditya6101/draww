import { Navbar } from '@/components/home/Navbar'
import { Hero } from '@/components/home/Hero'
import { Features } from '@/components/home/Features'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <footer className="text-center py-12 text-muted-foreground font-sketch text-base">
        Made with ✏️ and ❤️ — draww is free forever
      </footer>
    </main>
  )
}
