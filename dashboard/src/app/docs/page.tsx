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
  ExternalLink,
  Github,
  AlertTriangle,
  FileText,
  HelpCircle,
  Layers,
  ArrowRight,
} from 'lucide-react'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('quickstart')
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
    { id: 'quickstart', label: 'Quickstart Guide', icon: Zap },
    { id: 'cli', label: 'CLI Reference', icon: Terminal },
    { id: 'inspector', label: 'Traffic Inspector & Replay', icon: Activity },
    { id: 'deployment', label: 'GCP & Cloudflare Self-Hosting', icon: Server },
    { id: 'security', label: 'Security & Data Privacy', icon: Shield },
    { id: 'troubleshooting', label: 'Troubleshooting & Fixes', icon: HelpCircle },
    { id: 'architecture', label: 'Architecture & Stack', icon: Layers },
    { id: 'developer', label: 'Developer & Contributor Guide', icon: FileText },
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
              Documentation
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/dashboard"
              className="text-xs font-mono text-zinc-300 hover:text-white transition-colors bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg"
            >
              Go to Dashboard →
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
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/90 border border-zinc-800/90 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-3 backdrop-blur-xl shadow-xl">
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-3 py-2">
              Guide Index
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
          {/* SECTION 1: QUICKSTART */}
          {activeSection === 'quickstart' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Getting Started
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Quickstart Guide
                </h1>
                <p className="text-zinc-400 text-xs font-mono mt-1">
                  Expose your local development server in 3 simple steps.
                </p>
              </div>

              {/* Step 1 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center">
                    1
                  </span>
                  <span>Install the CLI Binary</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  Install via Go (recommended) or download the shell setup script:
                </p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <code>go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest</code>
                  <button
                    onClick={() =>
                      handleCopy(
                        'go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest',
                        'qs-install'
                      )
                    }
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'qs-install' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center">
                    2
                  </span>
                  <span>Configure API Key & Server URL</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  Get your 51-character API key from your dashboard and save your server config:
                </p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <code>tunnel config --key tk_YOUR_FULL_KEY --server wss://tunnel.quickshelf.online</code>
                  <button
                    onClick={() =>
                      handleCopy(
                        'tunnel config --key tk_YOUR_FULL_KEY --server wss://tunnel.quickshelf.online',
                        'qs-config'
                      )
                    }
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'qs-config' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-white font-semibold">
                  <span className="w-6 h-6 rounded-full bg-violet-600 text-white text-xs font-mono flex items-center justify-center">
                    3
                  </span>
                  <span>Start the Tunnel</span>
                </div>
                <p className="text-xs text-zinc-400 font-mono">
                  Expose any local HTTP port (e.g. 3000) to the public internet:
                </p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <code>tunnel start --port 3000</code>
                  <button
                    onClick={() => handleCopy('tunnel start --port 3000', 'qs-start')}
                    className="text-zinc-400 hover:text-white transition-colors"
                  >
                    {copiedCode === 'qs-start' ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: CLI REFERENCE */}
          {activeSection === 'cli' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  CLI Reference
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Command Line Commands & Flags
                </h1>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">Config File Locations</h3>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-1">
                  <div>
                    <span className="text-zinc-500">Windows:</span>{' '}
                    <span className="text-violet-300">%AppData%\tunnel\config.json</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">macOS:</span>{' '}
                    <span className="text-violet-300">~/Library/Application Support/tunnel/config.json</span>
                  </div>
                  <div>
                    <span className="text-zinc-500">Linux:</span>{' '}
                    <span className="text-violet-300">~/.config/tunnel/config.json</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">CLI Commands</h3>
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">tunnel update</span>
                      <span className="text-zinc-500 text-[11px]">Auto-Update Check</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">
                      Checks the official GitHub Releases API for newer CLI versions, displays release notes, and provides one-command upgrade instructions.
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 flex items-center justify-between">
                      <code>tunnel update</code>
                      <button
                        onClick={() => handleCopy('tunnel update', 'cli-update')}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedCode === 'cli-update' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-bold">tunnel version</span>
                      <span className="text-zinc-500 text-[11px]">Build & Version Metadata</span>
                    </div>
                    <p className="text-zinc-300 font-sans text-xs">
                      Prints the active CLI binary version, compile-time Git commit SHA, build timestamp, and OS/architecture target.
                    </p>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-emerald-400 flex items-center justify-between">
                      <code>tunnel version</code>
                      <button
                        onClick={() => handleCopy('tunnel version', 'cli-ver')}
                        className="text-zinc-400 hover:text-white transition-colors"
                      >
                        {copiedCode === 'cli-ver' ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-bold text-white">CLI Flags</h3>
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
                        <td className="p-3 text-zinc-300">Displays help description and options for any command</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--port, -p</td>
                        <td className="p-3 text-zinc-500">3000</td>
                        <td className="p-3 text-zinc-300">Local HTTP port to forward traffic to</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--name, -n</td>
                        <td className="p-3 text-zinc-500">&lt;port&gt;</td>
                        <td className="p-3 text-zinc-300">Custom project name (generates `username-name.quickshelf.online`)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--subdomain</td>
                        <td className="p-3 text-zinc-500">Alias</td>
                        <td className="p-3 text-zinc-300">Alias for `--name`</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--server, -s</td>
                        <td className="p-3 text-zinc-500">Saved Config</td>
                        <td className="p-3 text-zinc-300">Control plane WebSocket URL (`wss://...`)</td>
                      </tr>
                      <tr>
                        <td className="p-3 text-emerald-400 font-bold">--key, -k</td>
                        <td className="p-3 text-zinc-500">Saved Config</td>
                        <td className="p-3 text-zinc-300">51-character CLI authentication API key</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: TRAFFIC INSPECTOR & REPLAY */}
          {activeSection === 'inspector' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Real-time Inspector
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Traffic Inspection & 1-Click Webhook Replay
                </h1>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Every request entering your custom subdomain is logged into an auto-expiring 24-hour MongoDB TTL index. You can inspect raw HTTP headers, JSON body payloads, and status codes live from your dashboard.
              </p>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 space-y-3 font-sans">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-violet-400" />
                  How 1-Click Webhook Replay Works
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-400 leading-relaxed">
                  <li>Select any logged request inside your dashboard's <strong>Active Tunnels</strong> panel.</li>
                  <li>Click the <strong>Replay</strong> button on the right side of the request entry.</li>
                  <li>The dashboard re-sends the exact headers and request body down your active tunnel directly to your local application without requiring third-party webhook triggers.</li>
                </ol>
              </div>
            </div>
          )}

          {/* SECTION 4: GCP & CLOUDFLARE DEPLOYMENT */}
          {activeSection === 'deployment' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Self-Hosting
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Deploying on GCP VM & Cloudflare
                </h1>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Recommended VM Specs</h3>
                <ul className="list-disc list-inside text-xs text-zinc-400 space-y-1 font-mono">
                  <li>Instance Type: <code className="text-violet-300">e2-medium</code> (2 vCPU, 4GB RAM)</li>
                  <li>OS: Ubuntu 22.04 LTS</li>
                  <li>Disk: 30GB Balanced Persistent Disk</li>
                  <li>Networking: Reserved Static IP, Firewall HTTP/HTTPS enabled</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-base font-bold text-white">Cloudflare DNS Records (A Records)</h3>
                <p className="text-xs text-zinc-400 font-sans">
                  All 4 records must point to your VM IP and MUST be set to <strong>DNS Only (Grey Cloud)</strong>:
                </p>
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 font-mono text-xs space-y-1">
                  <div>A @ → YOUR_VM_IP (DNS Only)</div>
                  <div>A * → YOUR_VM_IP (DNS Only)</div>
                  <div>A dashboard → YOUR_VM_IP (DNS Only)</div>
                  <div>A tunnel → YOUR_VM_IP (DNS Only)</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Security & Privacy
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  API Key Hashing & TLS Encryption
                </h1>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                <h3 className="text-sm font-bold text-white">SHA-256 Key Encryption</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  Plaintext API keys are generated with 24 crypto-random bytes and displayed <strong>only once</strong> to the user. The database stores only a one-way SHA-256 hash digest (`apiKeyHash`). Plain text keys are never accessible by database admins or server logs.
                </p>
              </div>
            </div>
          )}

          {/* SECTION 6: TROUBLESHOOTING */}
          {activeSection === 'troubleshooting' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Support
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Troubleshooting Common Issues
                </h1>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-1">
                  <span className="font-bold text-white text-sm block">1. `websocket: bad handshake`</span>
                  <p className="text-zinc-400">
                    Ensure your CLI server URL is set to <code className="text-violet-300 font-mono">wss://tunnel.quickshelf.online</code> and that you copied the full 51-character key starting with <code className="text-emerald-400 font-mono">tk_</code>.
                  </p>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 space-y-1">
                  <span className="font-bold text-white text-sm block">2. Native MongoDB Port 27017 Conflict</span>
                  <p className="text-zinc-400">
                    If running locally and port 27017 fails to bind, comment out the <code className="text-violet-300 font-mono">ports:</code> section for mongo in <code className="text-violet-300 font-mono">docker-compose.yml</code>.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 7: ARCHITECTURE */}
          {activeSection === 'architecture' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Architecture
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  System Architecture & Stack
                </h1>
              </div>

              <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 font-mono text-xs space-y-3">
                <div className="text-zinc-400 font-bold uppercase text-[11px]">System Topology</div>
                <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 space-y-1">
                  <div>External Visitor ──► Nginx (Port 443 SSL)</div>
                  <div className="text-violet-400">              └──► Go Proxy Server (Port 4000)</div>
                  <div className="text-emerald-400">                     └──► WebSocket Tunnel (WSS) ──► CLI (Your Laptop) ──► Localhost App</div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 8: DEVELOPER & CONTRIBUTOR GUIDE */}
          {activeSection === 'developer' && (
            <div className="space-y-6">
              <div>
                <span className="text-xs font-mono text-violet-400 uppercase tracking-wider bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                  Contributing
                </span>
                <h1 className="text-3xl font-bold text-white tracking-tight mt-3">
                  Developer & Contributor Guide
                </h1>
              </div>

              <div className="space-y-4 font-sans text-xs">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono">1. Local Setup Commands</h3>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 space-y-1">
                    <div># 1. Start MongoDB</div>
                    <div>docker compose up -d mongo</div>
                    <div className="pt-2"># 2. Run Go server</div>
                    <div>make dev-server</div>
                    <div className="pt-2"># 3. Run Next.js dashboard</div>
                    <div>cd dashboard && npm run dev</div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono">2. Running Unit & Integration Tests</h3>
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-emerald-400 space-y-1">
                    <div># Run all Go package tests</div>
                    <div>go test -v ./...</div>
                    <div className="pt-2"># Run with race detector</div>
                    <div>go test -race ./...</div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-white font-mono">3. Security Standards</h3>
                  <p className="text-zinc-400 leading-relaxed">
                    All new features must comply with Strict Account Namespace Isolation (<code className="text-violet-300 font-mono">&lt;username&gt;-&lt;name&gt;.quickshelf.online</code>), enforce system domain blacklists via <code className="text-violet-300 font-mono">subdomain.IsSystemReserved</code>, and maintain SHA-256 key digest storage.
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-8 px-6 text-center text-xs font-mono text-zinc-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Reverse Tunnel Documentation — MIT License</span>
          <a href="/dashboard" className="hover:text-white transition-colors">
            Back to Dashboard
          </a>
        </div>
      </footer>
    </div>
  )
}
