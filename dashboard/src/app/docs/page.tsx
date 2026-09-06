'use client'

import { useState } from 'react'
import {
  Terminal,
  Zap,
  BookOpen,
  Server,
  Shield,
  Activity,
  Copy,
  Check,
  Search,
  Github,
  HelpCircle,
  FileText,
  Layers,
  ArrowRight,
  Compass,
  Lock,
  Globe,
  Code,
  Sparkles,
  Cpu,
  RefreshCw,
  Play,
  CheckCircle2,
} from 'lucide-react'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('concepts')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(id)
      setTimeout(() => setCopiedCode(null), 2500)
    } catch {
      // fallback
    }
  }

  const sections = [
    { id: 'concepts', label: '1. What is a Reverse Tunnel?', icon: Compass },
    { id: 'usermanual', label: '2. Beginner User Manual', icon: BookOpen },
    { id: 'cli', label: '3. CLI Reference & Commands', icon: Terminal },
    { id: 'frameworks', label: '4. Framework Setup Examples', icon: Code },
    { id: 'inspector', label: '5. Webhooks & Replay Guide', icon: Activity },
    { id: 'security', label: '6. Security & Account Isolation', icon: Shield },
    { id: 'troubleshooting', label: '7. Troubleshooting & Errors', icon: HelpCircle },
    { id: 'deployment', label: '8. Self-Hosting (GCP & Cloudflare)', icon: Server },
    { id: 'developer', label: '9. Developer & Contributor Guide', icon: FileText },
  ]

  const filteredSections = sections.filter((s) =>
    s.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white relative">
      {/* Background Mesh Grid & Ambient Light */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none -z-10" />
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-violet-600/10 blur-[130px] rounded-full pointer-events-none -z-10" />

      {/* Floating Header */}
      <header className="sticky top-4 z-50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto backdrop-blur-xl bg-zinc-950/80 border border-zinc-800/80 rounded-2xl px-5 h-14 flex items-center justify-between shadow-2xl shadow-black/80">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30">
                <Terminal className="w-4 h-4 text-violet-400" />
              </div>
              <span className="font-bold text-base text-white tracking-tight">Reverse Tunnel</span>
            </a>
            <span className="text-zinc-600">•</span>
            <span className="text-xs font-mono text-violet-400 font-semibold bg-violet-950/60 border border-violet-800/60 px-2.5 py-0.5 rounded-md">
              User Manual & Docs
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-xs font-mono text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
            </a>
            <a
              href="https://github.com/bhadrasuman/reverse-tunnel"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-lg text-zinc-300 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Navigation */}
        <aside className="lg:col-span-1 space-y-6">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search guide & commands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 backdrop-blur-xl shadow-xl">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-3 py-2">
              User Manual Sections
            </p>
            {filteredSections.map(({ id, label, icon: Icon }) => {
              const isActive = activeSection === id
              return (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-mono transition-all text-left ${
                    isActive
                      ? 'bg-violet-600 text-white font-semibold shadow-lg shadow-violet-950/50'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                  <span>{label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Right Content View */}
        <main className="lg:col-span-3 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-10 text-zinc-300 text-sm leading-relaxed">
          
          {/* SECTION 1: WHAT IS A REVERSE TUNNEL */}
          {activeSection === 'concepts' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Beginner Overview
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  What is a Reverse Tunnel?
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-2 leading-relaxed">
                  Understand how Reverse Tunnel works and why you need it for local development.
                </p>
              </div>

              {/* Analogy Box */}
              <div className="bg-gradient-to-br from-violet-950/40 via-zinc-900/80 to-zinc-900/40 border border-violet-800/40 rounded-2xl p-6 space-y-3">
                <div className="flex items-center gap-2.5 text-violet-300 font-bold text-base">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <span>The Real-World Analogy</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  Imagine building a website on your local laptop (<code className="text-violet-300 font-mono">http://localhost:3000</code>). Normally, your laptop lives behind a home or office router, hidden from the internet. Outside services like <strong>Stripe webhooks</strong>, <strong>GitHub notifications</strong>, or your <strong>teammates</strong> cannot reach your computer.
                </p>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  A <strong>Reverse Tunnel</strong> creates a secure, encrypted pipe from inside your computer outward to our cloud server. Anyone on the internet can visit your custom URL (<code className="text-emerald-400 font-mono">https://username-3000.quickshelf.online</code>), and our cloud proxy automatically routes the traffic straight down that pipe directly into your local dev app!
                </p>
              </div>

              {/* Key Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Instant Public HTTPS URL</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Get an instant SSL-encrypted domain without editing router settings or buying domain certificates.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Activity className="w-4 h-4 text-violet-400" />
                    <span>Live Webhook Inspection</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Inspect incoming webhook payloads from Stripe, GitHub, Twilio live, and replay them with 1-click.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span>Account-Isolated Subdomains</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Your URLs are deterministically scoped to your GitHub handle so nobody can steal your tunnel names.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2 text-white font-semibold text-xs">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Auto-Reconnection & Heartbeats</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    If your Wi-Fi drops, the CLI uses exponential backoff to automatically reconnect in milliseconds.
                  </p>
                </div>
              </div>

              {/* Glossary */}
              <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  Key Terminology Dictionary
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <dt className="text-violet-400 font-bold">Control Server (WSS)</dt>
                    <dd className="text-zinc-400 font-sans mt-0.5">The WebSocket server managing active tunnels and heartbeats.</dd>
                  </div>
                  <div>
                    <dt className="text-violet-400 font-bold">Proxy Server (HTTP)</dt>
                    <dd className="text-zinc-400 font-sans mt-0.5">The edge proxy that receives internet traffic and routes it to the CLI.</dd>
                  </div>
                  <div>
                    <dt className="text-violet-400 font-bold">API Key (tk_...)</dt>
                    <dd className="text-zinc-400 font-sans mt-0.5">Your 51-character authentication token generated from the dashboard.</dd>
                  </div>
                  <div>
                    <dt className="text-violet-400 font-bold">Traffic Inspector</dt>
                    <dd className="text-zinc-400 font-sans mt-0.5">The dashboard tool for viewing and replaying HTTP requests.</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* SECTION 2: BEGINNER USER MANUAL */}
          {activeSection === 'usermanual' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Step-by-Step Manual
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Beginner User Manual
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-1">
                  Follow this simple walkthrough to expose your first local web application to the world.
                </p>
              </div>

              {/* Chapter 1 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center font-bold">
                    1
                  </span>
                  <span>Log in to your Dashboard</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Visit <a href="/dashboard" className="text-violet-400 underline font-mono">https://dashboard.quickshelf.online</a> and sign in with your GitHub account. Your GitHub handle will be linked to your tunnel subdomains.
                </p>
              </div>

              {/* Chapter 2 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center font-bold">
                    2
                  </span>
                  <span>Generate & Copy your API Key</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Inside your dashboard, click <strong>Regenerate Key</strong>. Copy the 51-character key starting with <code className="text-emerald-400 font-mono">tk_</code> immediately. 
                </p>
                <div className="bg-amber-950/40 border border-amber-800/50 rounded-lg p-3 text-xs text-amber-300 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Security Notice:</strong> The raw API key is displayed only once. The database stores only an encrypted SHA-256 digest (`apiKeyHash`). If you lose it, click Regenerate Key to get a new one.
                  </span>
                </div>
              </div>

              {/* Chapter 3 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center font-bold">
                    3
                  </span>
                  <span>Install the `tunnel` CLI Tool</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Choose the installation method for your OS:
                </p>
                
                {/* Installation Tabs / Options */}
                <div className="space-y-2 font-mono text-xs">
                  <div className="text-zinc-400 text-[11px] uppercase font-bold">Option A: Via Go (Recommended across OS)</div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-emerald-400 flex items-center justify-between">
                    <code>go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest</code>
                    <button
                      onClick={() => handleCopy('go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest', 'm-install')}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedCode === 'm-install' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-zinc-400 text-[11px] uppercase font-bold pt-2">Option B: Build from Source</div>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-emerald-400 flex items-center justify-between">
                    <code>git clone https://github.com/bhadrasuman/reverse-tunnel.git && cd reverse-tunnel && go build -o tunnel.exe ./cmd/tunnel</code>
                    <button
                      onClick={() => handleCopy('git clone https://github.com/bhadrasuman/reverse-tunnel.git && cd reverse-tunnel && go build -o tunnel.exe ./cmd/tunnel', 'm-build')}
                      className="text-zinc-400 hover:text-white transition-colors"
                    >
                      {copiedCode === 'm-build' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chapter 4 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center font-bold">
                    4
                  </span>
                  <span>Save CLI Configuration</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Save your credentials so you don't have to enter your key every time:
                </p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <code>tunnel config --key tk_YOUR_FULL_KEY --server wss://tunnel.quickshelf.online</code>
                  <button
                    onClick={() => handleCopy('tunnel config --key tk_YOUR_FULL_KEY --server wss://tunnel.quickshelf.online', 'm-config')}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'm-config' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Chapter 5 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center font-bold">
                    5
                  </span>
                  <span>Start Exposing Your App!</span>
                </div>
                <p className="text-xs text-zinc-400 font-sans">
                  Run your local server (e.g., Next.js on port 3000), then launch the tunnel:
                </p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <code>tunnel start --port 3000</code>
                  <button
                    onClick={() => handleCopy('tunnel start --port 3000', 'm-start')}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'm-start' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 font-mono text-xs text-zinc-300 space-y-1">
                  <div className="text-violet-400 font-bold">Terminal Output Example:</div>
                  <div className="text-zinc-500">╔═════════════════════════════════════════════════════════════════╗</div>
                  <div className="text-zinc-300">║  Tunnel live!                                                   ║</div>
                  <div className="text-emerald-400">║  https://suman-bhadra-3000.quickshelf.online                    ║</div>
                  <div className="text-zinc-500">╚═════════════════════════════════════════════════════════════════╝</div>
                  <div className="text-zinc-500 text-[11px] pt-1">Requests: 0 | Status: Connected | Keep-alive ping: 15s</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: CLI REFERENCE */}
          {activeSection === 'cli' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  CLI Reference
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  CLI Command & Flag Reference
                </h1>
              </div>

              {/* Config Files */}
              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Config File Locations</h3>
                <p className="text-xs text-zinc-400 font-sans">
                  The <code className="text-violet-300 font-mono">tunnel config</code> command automatically stores your settings in standard OS config directories:
                </p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-2">
                  <div><span className="text-zinc-500">Windows:</span> <span className="text-violet-300">%AppData%\tunnel\config.json</span></div>
                  <div><span className="text-zinc-500">macOS:</span> <span className="text-violet-300">~/Library/Application Support/tunnel/config.json</span></div>
                  <div><span className="text-zinc-500">Linux:</span> <span className="text-violet-300">~/.config/tunnel/config.json</span></div>
                </div>
              </div>

              {/* Commands List */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">CLI Subcommands</h3>
                <div className="space-y-3 font-mono text-xs">
                  
                  {/* tunnel start */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-sm">tunnel start</span>
                      <span className="text-zinc-500 text-[11px]">Primary Execution Command</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">
                      Starts the reverse proxy connection between your local server and the public control plane.
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 flex items-center justify-between">
                      <code>tunnel start --port 3000 --name billing</code>
                      <button
                        onClick={() => handleCopy('tunnel start --port 3000 --name billing', 'ref-start')}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedCode === 'ref-start' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* tunnel config */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-sm">tunnel config</span>
                      <span className="text-zinc-500 text-[11px]">Configuration Management</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">
                      Saves your API key and default server URL permanently in your OS configuration directory.
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 flex items-center justify-between">
                      <code>tunnel config --key tk_YOUR_KEY --server wss://tunnel.quickshelf.online</code>
                      <button
                        onClick={() => handleCopy('tunnel config --key tk_YOUR_KEY --server wss://tunnel.quickshelf.online', 'ref-cfg')}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedCode === 'ref-cfg' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* tunnel update */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-sm">tunnel update</span>
                      <span className="text-zinc-500 text-[11px]">Version & Upgrade Checker</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">
                      Checks GitHub Releases API for newer CLI releases, displays release notes, and offers quick upgrade options.
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 flex items-center justify-between">
                      <code>tunnel update</code>
                      <button
                        onClick={() => handleCopy('tunnel update', 'ref-upd')}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedCode === 'ref-upd' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* tunnel version */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold text-sm">tunnel version</span>
                      <span className="text-zinc-500 text-[11px]">Version Metadata</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">
                      Prints binary semver, Git commit SHA, build timestamp, and OS/arch architecture.
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 flex items-center justify-between">
                      <code>tunnel version</code>
                      <button
                        onClick={() => handleCopy('tunnel version', 'ref-ver')}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedCode === 'ref-ver' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Flags Matrix */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Flags Table</h3>
                <div className="overflow-x-auto rounded-xl border border-zinc-800">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-3">Flag</th>
                        <th className="p-3">Default</th>
                        <th className="p-3">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 bg-zinc-950">
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--help, -h</td>
                        <td className="p-3 text-zinc-500">Built-in</td>
                        <td className="p-3 text-zinc-300 font-sans">Displays usage documentation for any command</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--port, -p</td>
                        <td className="p-3 text-zinc-500">3000</td>
                        <td className="p-3 text-zinc-300 font-sans">Local HTTP port your local server listens on</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--name, -n</td>
                        <td className="p-3 text-zinc-500">&lt;port&gt;</td>
                        <td className="p-3 text-zinc-300 font-sans">Custom project name (`username-name.quickshelf.online`)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--subdomain</td>
                        <td className="p-3 text-zinc-500">Alias</td>
                        <td className="p-3 text-zinc-300 font-sans">Alias for `--name`</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--server, -s</td>
                        <td className="p-3 text-zinc-500">Saved Config</td>
                        <td className="p-3 text-zinc-300 font-sans">Control plane WebSocket URL (`wss://...`)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--key, -k</td>
                        <td className="p-3 text-zinc-500">Saved Config</td>
                        <td className="p-3 text-zinc-300 font-sans">51-character API key (`tk_...`)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: FRAMEWORK EXAMPLES */}
          {activeSection === 'frameworks' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Presets & Guides
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Framework Setup Examples
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-1">
                  Expose applications built with your favorite languages and web frameworks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Next.js / React */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold font-mono text-xs">
                    <Code className="w-4 h-4 text-violet-400" />
                    <span>Next.js / React</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">Default port is 3000.</p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 font-mono text-xs">
                    <code>tunnel start --port 3000</code>
                  </div>
                </div>

                {/* Node.js / Express */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold font-mono text-xs">
                    <Code className="w-4 h-4 text-emerald-400" />
                    <span>Node.js / Express</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">Commonly port 3000 or 8080.</p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 font-mono text-xs">
                    <code>tunnel start --port 8080 --name api</code>
                  </div>
                </div>

                {/* Python Flask / FastAPI */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold font-mono text-xs">
                    <Code className="w-4 h-4 text-blue-400" />
                    <span>Python Flask / FastAPI</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">Flask defaults to 5000, FastAPI / Uvicorn to 8000.</p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 font-mono text-xs">
                    <code>tunnel start --port 8000 --name fastapi</code>
                  </div>
                </div>

                {/* Go HTTP / Gin */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold font-mono text-xs">
                    <Code className="w-4 h-4 text-cyan-400" />
                    <span>Go Net/HTTP & Gin</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">Commonly port 8080.</p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 font-mono text-xs">
                    <code>tunnel start --port 8080 --name go-app</code>
                  </div>
                </div>

                {/* Vite / Vue / Svelte */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold font-mono text-xs">
                    <Code className="w-4 h-4 text-amber-400" />
                    <span>Vite / Vue / Svelte</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">Vite defaults to 5173.</p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 font-mono text-xs">
                    <code>tunnel start --port 5173</code>
                  </div>
                </div>

                {/* Django */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold font-mono text-xs">
                    <Code className="w-4 h-4 text-green-400" />
                    <span>Django</span>
                  </div>
                  <p className="text-xs text-zinc-400 font-sans">`manage.py runserver` defaults to 8000.</p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 font-mono text-xs">
                    <code>tunnel start --port 8000 --name django</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: TRAFFIC INSPECTOR & WEBHOOK REPLAY */}
          {activeSection === 'inspector' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Real-time Debugging
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Traffic Inspection & 1-Click Webhook Replay
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-1">
                  Debug webhooks locally without repeatedly triggering third-party services.
                </p>
              </div>

              {/* What is a Webhook? */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3 font-sans">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" />
                  What are Webhooks & Why Replay Them?
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Webhooks are HTTP callbacks sent by services like <strong>Stripe</strong> (when a customer pays), <strong>GitHub</strong> (when code is pushed), or <strong>Shopify</strong> (when an order is placed). Testing them locally can be tedious because triggering a real payment or event over and over takes time.
                </p>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  With <strong>Reverse Tunnel Traffic Inspector</strong>, every request sent to your tunnel URL is automatically logged in MongoDB (24-hour TTL). You can inspect raw headers and JSON payloads, then click <strong>Replay</strong> to re-send the exact request straight to your local code as many times as you want!
                </p>
              </div>

              {/* How Replay Works Step-by-Step */}
              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-4 font-sans">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-400" />
                  Step-by-Step Webhook Replay Guide
                </h3>
                
                <div className="space-y-3 text-xs text-zinc-300">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-white">Trigger the event once</strong>
                      <p className="text-zinc-400 mt-0.5">Send a test webhook event from your Stripe or GitHub developer dashboard to your live tunnel URL (<code className="text-emerald-400 font-mono">https://username-3000.quickshelf.online/webhook</code>).</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-white">Open the Traffic Inspector</strong>
                      <p className="text-zinc-400 mt-0.5">Go to your dashboard at <a href="/dashboard" className="text-violet-400 underline font-mono">/dashboard</a>. Below your active tunnels, you'll see the <strong>Traffic Inspector</strong> card.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-white">Inspect Request Headers & Payload</strong>
                      <p className="text-zinc-400 mt-0.5">Click any request row to expand and inspect raw HTTP headers, query parameters, request body, and response duration in milliseconds.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full bg-violet-600 text-white text-[11px] font-mono flex items-center justify-center shrink-0 mt-0.5">4</span>
                    <div>
                      <strong className="text-white">Click "Replay"</strong>
                      <p className="text-zinc-400 mt-0.5">Click the <span className="bg-violet-600 text-white px-2 py-0.5 rounded text-[11px] font-mono">Replay</span> button. The dashboard proxy re-sends the exact request payload down your WebSocket tunnel to your laptop. A custom header <code className="text-violet-300 font-mono">X-Tunnel-Replay: true</code> is attached so your app knows it's a replayed request!</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 6: SECURITY & PRIVACY */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Security & Architecture
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Security & Account Isolation
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-1">
                  How Reverse Tunnel protects your account, credentials, and local environment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Strict Handle Scoping
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    Subdomains are deterministically scoped to your GitHub handle (<code className="text-emerald-400 font-mono">&lt;username&gt;-&lt;name&gt;.quickshelf.online</code>). This ensures no malicious user can impersonate your tunnel URLs.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-violet-400" />
                    SHA-256 Key Digests
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    API keys are generated with 24 crypto-random bytes (`tk_...`). The server stores only a one-way SHA-256 digest (`apiKeyHash`). Database compromises cannot expose raw API keys.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    System Reserved Blacklist
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    System handles like `dashboard`, `tunnel`, `admin`, `api`, `www`, `root` are blacklisted to prevent DNS spoofing or proxy hijacking.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    Zombie Tunnel Eviction
                  </h3>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    If your laptop abruptly disconnects or sleeps, the control plane detects dead TCP connections via 15s WebSocket ping frames and immediately evicts stale connections.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: TROUBLESHOOTING */}
          {activeSection === 'troubleshooting' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Help & FAQs
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Troubleshooting & Common Fixes
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-1">
                  Solutions to common setup issues and error status codes.
                </p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                
                {/* 1. websocket bad handshake */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>1. `websocket: bad handshake`</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    <strong>Cause:</strong> Either your saved API key is invalid/truncated, or the server URL is wrong.
                  </p>
                  <p className="text-zinc-300 leading-relaxed font-mono">
                    <strong>Fix:</strong> Go to <a href="/dashboard" className="text-violet-400 underline">Dashboard</a> → click <strong>Regenerate Key</strong> → copy the full 51-character key starting with <code className="text-emerald-400">tk_</code>, then run:
                  </p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono text-emerald-400">
                    <code>tunnel config --key tk_YOUR_FULL_KEY --server wss://tunnel.quickshelf.online</code>
                  </div>
                </div>

                {/* 2. HTTP 426 Upgrade Required */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>2. `HTTP 426 Upgrade Required`</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    <strong>Cause:</strong> Your CLI version is below the server's required minimum version.
                  </p>
                  <p className="text-zinc-300 leading-relaxed font-mono">
                    <strong>Fix:</strong> Run <code className="text-emerald-400">tunnel update</code> or upgrade via Go:
                  </p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono text-emerald-400">
                    <code>tunnel update</code>
                  </div>
                </div>

                {/* 3. Connection Refused locally */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>3. `connectex: No connection could be made because target machine actively refused it`</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    <strong>Cause:</strong> Your local application is not running on the specified port (e.g. port 3000).
                  </p>
                  <p className="text-zinc-300 leading-relaxed font-sans">
                    <strong>Fix:</strong> Start your local web app first (e.g., `npm run dev`), verify it opens in your browser at `http://localhost:3000`, then launch `tunnel start --port 3000`.
                  </p>
                </div>

                {/* 4. PowerShell curl error */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <span className="w-2 h-2 rounded-full bg-blue-400" />
                    <span>4. PowerShell `curl -H` ParameterBindingException</span>
                  </div>
                  <p className="text-zinc-400 leading-relaxed">
                    <strong>Cause:</strong> Windows PowerShell aliases `curl` to `Invoke-WebRequest` which has different header argument syntax.
                  </p>
                  <p className="text-zinc-300 leading-relaxed font-mono">
                    <strong>Fix:</strong> Use `curl.exe` instead of `curl` in PowerShell:
                  </p>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 font-mono text-emerald-400">
                    <code>curl.exe -X POST https://your-tunnel.quickshelf.online/api -H "Content-Type: application/json" -d '&#123;"hello":"world"&#125;'</code>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: SELF-HOSTING (GCP & CLOUDFLARE) */}
          {activeSection === 'deployment' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Infrastructure
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Self-Hosting on GCP & Cloudflare
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-1">
                  Deploy your own Reverse Tunnel control plane and proxy server.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Recommended VM Hardware</h3>
                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1 font-mono">
                  <li>GCP Instance Type: <code className="text-violet-300">e2-medium</code> (2 vCPU, 4GB RAM)</li>
                  <li>OS: Ubuntu 22.04 LTS</li>
                  <li>Disk: 30GB Balanced Persistent Disk</li>
                  <li>Networking: Reserved Static IP, Firewall HTTP/HTTPS enabled</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Cloudflare DNS Configuration</h3>
                <p className="text-xs text-zinc-400 font-sans">
                  Create 4 A records in Cloudflare pointing to your GCP VM's static IP. All records <strong>MUST</strong> be set to <strong>DNS Only (Grey Cloud)</strong> so WebSocket connections pass unproxied:
                </p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-1">
                  <div>A @ ─────────► YOUR_VM_IP (DNS Only)</div>
                  <div>A * ─────────► YOUR_VM_IP (DNS Only)</div>
                  <div>A dashboard ─► YOUR_VM_IP (DNS Only)</div>
                  <div>A tunnel ────► YOUR_VM_IP (DNS Only)</div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Docker Compose Services</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-2">
                  <div className="text-zinc-400 font-bold">Services in `docker-compose.yml`:</div>
                  <div>1. <span className="text-violet-400">server</span> (Go control plane + HTTP proxy)</div>
                  <div>2. <span className="text-emerald-400">dashboard</span> (Next.js 15 UI)</div>
                  <div>3. <span className="text-cyan-400">mongo</span> (MongoDB 7.0 with 24h request log TTL)</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 9: DEVELOPER & CONTRIBUTOR GUIDE */}
          {activeSection === 'developer' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Contributing
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Developer & Contributor Guide
                </h1>
                <p className="text-zinc-400 text-sm font-sans mt-1">
                  How to build, test, and contribute to the Reverse Tunnel codebase.
                </p>
              </div>

              <div className="space-y-4 font-sans text-xs">
                
                {/* 1. Local setup */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono">1. Local Stack Commands</h3>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 space-y-1">
                    <div># 1. Start MongoDB container</div>
                    <div>docker compose up -d mongo</div>
                    <div className="pt-2"># 2. Run Go server</div>
                    <div>make dev-server</div>
                    <div className="pt-2"># 3. Run Next.js dashboard</div>
                    <div>cd dashboard && npm run dev</div>
                  </div>
                </div>

                {/* 2. Testing */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono">2. Running Tests</h3>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 space-y-1">
                    <div># Run all Go package unit tests</div>
                    <div>go test -v ./...</div>
                    <div className="pt-2"># Run with race detector</div>
                    <div>go test -race ./...</div>
                    <div className="pt-2"># Build Next.js dashboard</div>
                    <div>cd dashboard && npm run build</div>
                  </div>
                </div>

                {/* 3. Security Standards */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono">3. Architectural Guidelines</h3>
                  <ul className="list-disc list-inside text-zinc-400 leading-relaxed space-y-1 font-sans">
                    <li>Maintain strict handle namespace isolation via <code className="text-violet-300 font-mono">subdomain.NormalizeHandle</code>.</li>
                    <li>Always sanitize system handles using <code className="text-violet-300 font-mono">subdomain.IsSystemReserved</code>.</li>
                    <li>Never log or store unhashed API keys. Store only SHA-256 digests (`apiKeyHash`).</li>
                    <li>Do not introduce emojis into UI code or docs per project guidelines.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-6 text-center text-xs font-mono text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Reverse Tunnel User Manual — Open Source (MIT License)</span>
          <a href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
            <span>Back to Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </footer>
    </div>
  )
}
