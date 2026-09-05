import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Zap, Shield, Terminal } from 'lucide-react'
import LoginButton from '@/components/LoginButton'

const features = [
  {
    icon: Zap,
    title: 'Instant',
    description: 'No config, no port forwarding, no firewall rules. Just one command.',
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'TLS encrypted connections. API key authentication on every request.',
  },
  {
    icon: Terminal,
    title: 'Simple',
    description: 'One command to start. One URL to share. Works from anywhere.',
  },
]

export default async function HomePage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-gray-800/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <Terminal className="w-5 h-5 text-violet-400" />
          <span className="font-bold text-white tracking-tight">Tunnel</span>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-950/50 border border-violet-700/50 rounded-full px-4 py-1.5 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs text-violet-300 font-medium">Open source reverse tunnel</span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl">
          <span className="bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Expose localhost to the internet.
          </span>{' '}
          <span className="bg-gradient-to-br from-violet-400 to-violet-600 bg-clip-text text-transparent">
            Instantly.
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-10 max-w-xl">
          Secure reverse tunnels for developers. Share your local server with a single command.
        </p>

        <LoginButton />

        {/* Terminal demo */}
        <div className="mt-14 w-full max-w-lg bg-gray-900 border border-gray-800 rounded-xl overflow-hidden text-left shadow-2xl">
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-800 bg-gray-900/80">
            <span className="w-3 h-3 rounded-full bg-red-500/70" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <span className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-2 text-xs text-gray-500 font-mono">bash</span>
          </div>
          <div className="px-5 py-4 font-mono text-sm space-y-2">
            <div>
              <span className="text-gray-500">$ </span>
              <span className="text-white">tunnel start --port 3000</span>
            </div>
            <div className="text-gray-500">Connecting to server...</div>
            <div className="text-green-400">
              ✓ Tunnel active:{' '}
              <span className="text-violet-400 underline">https://abc123.tunnel.dev</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Forwarding </span>
              <span className="text-white">https://abc123.tunnel.dev → localhost:3000</span>
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 max-w-3xl w-full">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-left hover:border-gray-700 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{description}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-800/50 py-6 text-center text-xs text-gray-600">
        Tunnel &mdash; Open source reverse proxy | 2026
      </footer>
    </div>
  )
}
