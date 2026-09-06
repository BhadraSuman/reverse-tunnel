import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Terminal } from 'lucide-react'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative selection:bg-violet-500 selection:text-white">
      {/* Background Mesh Grid & Glow Orbs */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Floating Glassmorphism Navbar */}
      <header className="sticky top-4 z-40 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto backdrop-blur-xl bg-zinc-950/80 border border-zinc-800/80 rounded-2xl px-5 h-14 flex items-center justify-between shadow-2xl shadow-black/80">
          {/* Logo */}
          <a href="/dashboard" className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30">
              <Terminal className="w-4 h-4 text-violet-400" />
            </div>
            <span className="font-bold text-base text-white tracking-tight">Reverse Tunnel</span>
          </a>

          {/* User Section */}
          <div className="flex items-center gap-3">
            <a
              href="/docs"
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg hidden sm:block"
            >
              Docs 📖
            </a>
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={28}
                height={28}
                className="w-7 h-7 rounded-full ring-1 ring-zinc-700"
              />
            )}
            <span className="text-xs font-medium text-zinc-300 hidden sm:block font-mono">{session.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-5xl mx-auto px-4 py-8 w-full flex-1">{children}</main>

      {/* Glassmorphism Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-8 px-6 mt-12 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Reverse Tunnel — 100% Open Source MIT</span>
          <span>wss://tunnel.quickshelf.online</span>
        </div>
      </footer>
    </div>
  )
}
