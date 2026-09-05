'use client'

import { useState } from 'react'
import { Copy, Check, Send, Sparkles, Terminal, Activity, ArrowRight, Play } from 'lucide-react'
import LoginButton from './LoginButton'

interface MockLog {
  id: string
  method: string
  path: string
  status: number
  duration: number
}

export default function LandingHero() {
  const [copied, setCopied] = useState(false)
  const [osTab, setOsTab] = useState<'go' | 'sh' | 'ps'>('go')
  const [activeTab, setActiveTab] = useState<'cli' | 'inspector' | 'simulator'>('cli')
  const [simulatedLogs, setSimulatedLogs] = useState<MockLog[]>([
    { id: '1', method: 'POST', path: '/api/webhooks/stripe', status: 200, duration: 14 },
    { id: '2', method: 'GET', path: '/api/v1/users?page=1', status: 200, duration: 8 },
  ])

  const getInstallCmd = () => {
    switch (osTab) {
      case 'go':
        return 'go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest'
      case 'sh':
        return 'curl -fsSL https://quickshelf.online/install.sh | sh'
      case 'ps':
        return 'iwr https://quickshelf.online/install.ps1 | iex'
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getInstallCmd())
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleSimulateRequest = () => {
    const endpoints = [
      { method: 'POST', path: '/api/webhooks/stripe', status: 200 },
      { method: 'POST', path: '/api/webhooks/github', status: 200 },
      { method: 'GET', path: '/api/v1/products', status: 200 },
    ]
    const randomEp = endpoints[Math.floor(Math.random() * endpoints.length)]
    const newLog: MockLog = {
      id: Date.now().toString(),
      method: randomEp.method,
      path: randomEp.path,
      status: randomEp.status,
      duration: Math.floor(Math.random() * 20) + 6,
    }
    setSimulatedLogs((prev) => [newLog, ...prev.slice(0, 2)])
  }

  return (
    <section className="relative px-6 pt-20 pb-24 text-center max-w-5xl mx-auto flex flex-col items-center overflow-hidden">
      {/* Background Radial Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-violet-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Premium Status Pill */}
      <div className="inline-flex items-center gap-2 bg-zinc-900/90 border border-zinc-800/90 rounded-full px-4 py-1.5 mb-8 text-xs font-mono text-zinc-300 shadow-xl shadow-black/40 backdrop-blur-md hover:border-zinc-700 transition-colors">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
        </span>
        <span className="text-zinc-400">v0.1-beta</span>
        <span className="text-zinc-600">•</span>
        <span className="text-zinc-200 font-semibold">100% Open Source Reverse Proxy</span>
      </div>

      {/* Exact Requested Headline */}
      <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6 max-w-4xl">
        Expose localhost to the internet{' '}
        <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-indigo-400 bg-clip-text text-transparent">
          instantly.
        </span>
      </h1>

      {/* Exact Requested Subtitle */}
      <p className="text-base sm:text-xl text-zinc-400 mb-10 max-w-2xl leading-relaxed font-normal">
        A minimalist, high-performance reverse proxy for developers. Debug webhooks in real-time, inspect payloads, and share live WIP links on your custom domain.
      </p>

      {/* Sleek OS Install Command Box */}
      <div className="w-full max-w-xl bg-zinc-950/80 border border-zinc-800/80 hover:border-zinc-700/80 rounded-2xl p-3.5 mb-8 shadow-2xl shadow-violet-950/20 backdrop-blur-xl text-left transition-colors">
        <div className="flex items-center justify-between text-xs border-b border-zinc-900 pb-2.5 px-2">
          <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider font-medium">Install CLI</span>
          <div className="flex items-center gap-1 font-mono text-[11px] bg-zinc-900/90 p-1 rounded-lg border border-zinc-800/80">
            <button
              onClick={() => setOsTab('go')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                osTab === 'go' ? 'bg-zinc-800 text-white font-medium shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Go
            </button>
            <button
              onClick={() => setOsTab('sh')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                osTab === 'sh' ? 'bg-zinc-800 text-white font-medium shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              macOS / Linux
            </button>
            <button
              onClick={() => setOsTab('ps')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                osTab === 'ps' ? 'bg-zinc-800 text-white font-medium shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              PowerShell
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 px-2 pt-2.5">
          <div className="flex items-center gap-2 font-mono text-xs text-zinc-200 overflow-x-auto">
            <span className="text-violet-400 font-bold">$</span>
            <span className="truncate">{getInstallCmd()}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 hover:border-zinc-700 px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all shadow-sm"
          >
            {copied ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Copied
              </span>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" /> Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hero Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mb-16">
        <LoginButton
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-100 font-semibold px-6 py-3 rounded-xl text-sm transition-all shadow-xl shadow-white/10 hover:scale-[1.02]"
          text="Get Started Free"
        />
        <a
          href="https://github.com/bhadrasuman/reverse-tunnel"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium px-6 py-3 rounded-xl text-sm transition-all hover:scale-[1.02]"
        >
          View GitHub Source
        </a>
      </div>

      {/* Terminal Visual Component */}
      <div className="w-full max-w-3xl bg-zinc-950 border border-zinc-800/80 rounded-2xl overflow-hidden text-left shadow-2xl shadow-violet-950/20">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-900 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-xs text-zinc-400 font-mono">tunnel --port 3000</span>
          </div>

          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800 font-mono text-[11px]">
            <button
              onClick={() => setActiveTab('cli')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'cli' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Terminal
            </button>
            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'inspector' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Inspector
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1 rounded-md transition-all ${
                activeTab === 'simulator' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Live Simulator
            </button>
          </div>
        </div>

        {/* Tab 1: Terminal View */}
        {activeTab === 'cli' && (
          <div className="p-6 font-mono text-xs space-y-3 bg-zinc-950">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="text-violet-400">$</span>
              <span className="text-white font-medium">tunnel start --port 3000</span>
            </div>
            <div className="text-zinc-500">⟳ Connecting to control plane wss://tunnel.quickshelf.online...</div>
            <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300 flex items-center justify-between">
              <span className="font-semibold">✓ Tunnel Active</span>
              <span className="text-zinc-300 font-mono underline underline-offset-4">
                https://brave-lynx-8.quickshelf.online
              </span>
            </div>
            <div className="text-zinc-500 pt-2 flex items-center justify-between text-[11px] border-t border-zinc-900">
              <span>Forwarding requests to http://localhost:3000</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 200 OK • 12ms
              </span>
            </div>
          </div>
        )}

        {/* Tab 2: Inspector Stream */}
        {activeTab === 'inspector' && (
          <div className="p-5 font-mono text-xs space-y-2.5 bg-zinc-950">
            <div className="text-zinc-500 border-b border-zinc-900 pb-2 flex justify-between text-[11px]">
              <span>REAL-TIME REQUEST STREAM</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Streaming Logs
              </span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                  POST
                </span>
                <span className="text-zinc-400">200 OK</span>
                <span className="text-zinc-200 font-mono">/api/webhooks/stripe</span>
              </div>
              <span className="text-zinc-500">14ms</span>
            </div>
            <div className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-xl">
              <div className="flex items-center gap-2.5">
                <span className="text-blue-400 font-bold bg-blue-950/60 border border-blue-800/60 px-2 py-0.5 rounded text-[11px]">
                  GET
                </span>
                <span className="text-zinc-400">200 OK</span>
                <span className="text-zinc-200 font-mono">/api/v1/users?page=1</span>
              </div>
              <span className="text-zinc-500">8ms</span>
            </div>
          </div>
        )}

        {/* Tab 3: Simulator */}
        {activeTab === 'simulator' && (
          <div className="p-5 font-mono text-xs space-y-3 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
              <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Interactive Webhook Simulator</span>
              <button
                onClick={handleSimulateRequest}
                className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white font-sans text-xs px-3 py-1.5 rounded-lg transition-colors shadow-md shadow-violet-950/50"
              >
                <Send className="w-3.5 h-3.5" /> Send Mock Payload
              </button>
            </div>

            <div className="space-y-2">
              {simulatedLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 p-2.5 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded text-[11px]">
                      {log.method}
                    </span>
                    <span className="text-zinc-400">{log.status}</span>
                    <span className="text-zinc-200 font-mono">{log.path}</span>
                  </div>
                  <span className="text-zinc-500">{log.duration}ms</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

