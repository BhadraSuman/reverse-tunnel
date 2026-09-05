import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  Terminal,
  Zap,
  Shield,
  Activity,
  Globe,
  Lock,
  Github,
  Check,
  X,
  Sparkles,
  Server,
  Cpu,
  RefreshCw,
  ExternalLink,
  Laptop,
  ArrowRight,
} from 'lucide-react'
import LoginButton from '@/components/LoginButton'
import LandingHero from '@/components/LandingHero'
import ProviderLogosTicker from '@/components/ProviderLogos'

export default async function HomePage() {
  const session = await auth()
  if (session) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-violet-500 selection:text-white relative">
      {/* Background Subtle Mesh Grid */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#27272a15_1px,transparent_1px),linear-gradient(to_bottom,#27272a15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none -z-10" />

      {/* ── 1. Floating Glassmorphism Navbar ─────────────────────────────── */}
      <header className="sticky top-4 z-50 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto backdrop-blur-xl bg-zinc-950/80 border border-zinc-800/80 rounded-2xl px-5 py-3 shadow-2xl shadow-black/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30">
              <Terminal className="w-4 h-4 text-violet-400" />
            </div>
            <span className="font-bold text-base text-white tracking-tight font-sans">
              Reverse Tunnel
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-7 text-xs font-mono text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#comparison" className="hover:text-white transition-colors">
              Comparison
            </a>
            <a href="#architecture" className="hover:text-white transition-colors">
              Architecture
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com/bhadrasuman/reverse-tunnel"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded-xl text-zinc-300 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Star</span>
            </a>
            <LoginButton
              className="flex items-center gap-1.5 bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-4 py-2 rounded-xl transition-all shadow-md"
              text="Sign In"
            />
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* ── 2. Hero Section ──────────────────────────────────────────────── */}
        <LandingHero />

        {/* ── 3. Provider Integrations Marquee ────────────────────────────── */}
        <section className="border-y border-zinc-900 bg-zinc-950/60 py-8 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="text-center text-[11px] font-mono text-zinc-500 uppercase tracking-widest mb-6">
              Works seamlessly with your entire developer stack
            </p>
            <ProviderLogosTicker />
          </div>
        </section>

        {/* ── 4. The Problem ───────────────────────────────────── */}
        <section className="px-6 py-20 border-b border-zinc-900 bg-zinc-950/40">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-mono text-violet-400 uppercase tracking-widest bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                The Problem
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-4">
                Why Local Development Sucks Without a Custom Tunnel
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-7 hover:border-zinc-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center mb-5">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Third-Party Paywalls</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Commercial tunnel tools restrict session limits, enforce random ugly URLs, and charge $20+/month just to reserve a static custom domain.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-7 hover:border-zinc-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center mb-5">
                  <Lock className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Data Privacy Risks</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Routing sensitive customer payload data or confidential local endpoints through third-party proprietary servers creates major security & GDPR risks.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-7 hover:border-zinc-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center mb-5">
                  <RefreshCw className="w-5 h-5 text-red-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Painful Webhook Debugging</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Testing Stripe or GitHub webhooks forces you to trigger real external events 20+ times manually just to test a single handler change.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 5. Bento Grid Features Section ──────────────────────────────── */}
        <section id="features" className="px-6 py-24 border-b border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-full">
                Features
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-4">
                Everything You Need for Webhook & Local Debugging
              </h2>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 (Large Bento Card) */}
              <div className="md:col-span-2 bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/90 rounded-3xl p-8 hover:border-violet-500/40 transition-all shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30">
                    <Activity className="w-5 h-5 text-violet-400" />
                  </div>
                  <span className="text-xs font-mono text-violet-400 uppercase tracking-wider font-semibold">
                    Real-time Inspector
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Traffic Inspection & 1-Click Payload Replay</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                  Inspect incoming HTTP headers, raw body JSON, and execution latencies in real-time. Re-trigger captured webhooks straight from your dashboard without triggering external providers.
                </p>
                <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 font-mono text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-emerald-400 font-bold">POST /api/webhooks/stripe</span>
                    <span className="text-zinc-500">200 OK • 14ms</span>
                  </div>
                  <div className="bg-zinc-900/80 p-2 rounded text-[11px] text-zinc-300">
                    {`{ "event": "payment_intent.succeeded", "amount": 4900, "currency": "usd" }`}
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/90 rounded-3xl p-8 hover:border-violet-500/40 transition-all shadow-xl">
                <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 w-fit mb-5">
                  <Zap className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Instant Expose</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans mb-4">
                  Bypass NATs and routers with a single terminal command: <code className="text-violet-300 font-mono">tunnel start --port 3000</code>.
                </p>
                <div className="bg-zinc-950 border border-zinc-800/80 px-3 py-2 rounded-lg text-emerald-400 font-mono text-[11px]">
                  ✓ Connected in 84ms
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/90 rounded-3xl p-8 hover:border-violet-500/40 transition-all shadow-xl">
                <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 w-fit mb-5">
                  <Globe className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Custom Subdomain</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Get predictable URLs under <code className="text-violet-300 font-mono">*.quickshelf.online</code> or configure your own domain.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/90 rounded-3xl p-8 hover:border-violet-500/40 transition-all shadow-xl">
                <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 w-fit mb-5">
                  <Shield className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">SHA-256 Hashed Keys</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Plain-text API keys are never saved on servers. Encrypted with one-way SHA-256 hashing.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-gradient-to-br from-zinc-900/90 to-zinc-950 border border-zinc-800/90 rounded-3xl p-8 hover:border-violet-500/40 transition-all shadow-xl">
                <div className="p-2.5 rounded-xl bg-violet-600/20 border border-violet-500/30 w-fit mb-5">
                  <Cpu className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Headless & Docker Ready</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Run on Linux servers, CI/CD pipelines, or Docker containers without GUI editor dependencies.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 6. Minimalist Comparison Section ─────────────────────────────── */}
        <section id="comparison" className="px-6 py-24 border-b border-zinc-900 bg-zinc-950/40">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-widest">
                Comparison
              </span>
              <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mt-2">
                Why Developers Switch
              </h2>
            </div>

            <div className="border border-zinc-800/80 rounded-2xl bg-zinc-950/80 overflow-hidden backdrop-blur-md shadow-xl">
              <table className="w-full text-left text-xs border-collapse font-sans">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-400 font-mono text-[11px] bg-zinc-900/50">
                    <th className="py-4 px-6 font-medium text-zinc-400">Feature</th>
                    <th className="py-4 px-6 font-semibold text-white bg-zinc-900/60 border-x border-zinc-800/60">
                      Reverse Tunnel
                    </th>
                    <th className="py-4 px-6 font-medium text-zinc-500">ngrok Free</th>
                    <th className="py-4 px-6 font-medium text-zinc-500">VS Code Tunnel</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50 text-xs">
                  {/* Row 1 */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-200">
                      Custom Subdomains
                      <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">
                        Predictable URLs for webhooks & testing
                      </span>
                    </td>
                    <td className="py-4 px-6 bg-zinc-900/30 border-x border-zinc-800/50 text-white font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-4 h-4" /> Free (*.quickshelf.online)
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-500">Paid ($20+/mo)</td>
                    <td className="py-4 px-6 text-zinc-500">Random *.devtunnels.ms</td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-200">
                      1-Click Webhook Replay
                      <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">
                        Re-trigger payload directly to localhost
                      </span>
                    </td>
                    <td className="py-4 px-6 bg-zinc-900/30 border-x border-zinc-800/50 text-white font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-4 h-4" /> Built-in 1-Click Replay
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-500">Basic Web Inspector</td>
                    <td className="py-4 px-6 text-zinc-500">None</td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-200">
                      Data Ownership
                      <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">
                        Control over request logs & traffic data
                      </span>
                    </td>
                    <td className="py-4 px-6 bg-zinc-900/30 border-x border-zinc-800/50 text-white font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-4 h-4" /> 100% Self-Hostable
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-500">Proprietary Servers</td>
                    <td className="py-4 px-6 text-zinc-500">Microsoft Infrastructure</td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-200">
                      Standalone CLI / Docker
                      <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">
                        Headless execution on servers & CI/CD
                      </span>
                    </td>
                    <td className="py-4 px-6 bg-zinc-900/30 border-x border-zinc-800/50 text-white font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-4 h-4" /> Go Binary & Docker
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-400">CLI Binary</td>
                    <td className="py-4 px-6 text-zinc-500">Requires VS Code IDE</td>
                  </tr>

                  {/* Row 5 */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-200">
                      AI Context Protocol (MCP)
                      <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">
                        Cursor & Claude Code integration
                      </span>
                    </td>
                    <td className="py-4 px-6 bg-zinc-900/30 border-x border-zinc-800/50 text-white font-medium">
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <Check className="w-4 h-4" /> Native Server Included
                      </span>
                    </td>
                    <td className="py-4 px-6 text-zinc-500">None</td>
                    <td className="py-4 px-6 text-zinc-500">None</td>
                  </tr>

                  {/* Row 6 */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-zinc-200">
                      Monthly Cost
                      <span className="block text-[11px] text-zinc-500 font-normal mt-0.5">
                        Price per developer / month
                      </span>
                    </td>
                    <td className="py-4 px-6 bg-zinc-900/30 border-x border-zinc-800/50 text-white font-semibold">
                      $0 (MIT Open Source)
                    </td>
                    <td className="py-4 px-6 text-zinc-500">$20+/mo for custom domains</td>
                    <td className="py-4 px-6 text-zinc-500">Free with MS Account</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── 7. Architecture Section ─────────────────────────────────────── */}
        <section id="architecture" className="px-6 py-24 border-b border-zinc-900">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-mono text-violet-400 uppercase tracking-widest bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-4">
                Secure 3-Node Tunnel Architecture
              </h2>
            </div>

            <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-950 to-zinc-950 border border-zinc-800/80 rounded-3xl p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 font-mono text-xs text-zinc-300">
                {/* Node 1 */}
                <div className="w-full md:w-1/3 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center hover:border-violet-500/50 transition-colors shadow-lg">
                  <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 mb-3">
                    <Globe className="w-6 h-6 text-violet-400" />
                  </div>
                  <span className="font-bold text-white text-sm mb-1 font-sans">1. External Request</span>
                  <span className="text-zinc-400 text-[11px] bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                    https://*.quickshelf.online
                  </span>
                </div>

                {/* Connector 1 */}
                <div className="flex flex-col items-center gap-1 text-violet-400 font-bold text-xs">
                  <span className="text-[10px] text-zinc-500 font-mono">TLS Encrypted</span>
                  <div className="flex items-center gap-1 bg-violet-950/80 border border-violet-800/80 text-violet-300 px-3 py-1 rounded-full">
                    <span>HTTPS</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-90 md:rotate-0" />
                  </div>
                </div>

                {/* Node 2 */}
                <div className="w-full md:w-1/3 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center hover:border-violet-500/50 transition-colors shadow-lg">
                  <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 mb-3">
                    <Server className="w-6 h-6 text-violet-400" />
                  </div>
                  <span className="font-bold text-white text-sm mb-1 font-sans">2. GCP Go Proxy</span>
                  <span className="text-zinc-400 text-[11px] bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                    WebSocket Control Plane
                  </span>
                </div>

                {/* Connector 2 */}
                <div className="flex flex-col items-center gap-1 text-emerald-400 font-bold text-xs">
                  <span className="text-[10px] text-zinc-500 font-mono">Persistent Channel</span>
                  <div className="flex items-center gap-1 bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 px-3 py-1 rounded-full">
                    <span>WSS</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-90 md:rotate-0" />
                  </div>
                </div>

                {/* Node 3 */}
                <div className="w-full md:w-1/3 bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col items-center text-center hover:border-emerald-500/50 transition-colors shadow-lg">
                  <div className="p-3 rounded-xl bg-emerald-600/20 border border-emerald-500/30 mb-3">
                    <Laptop className="w-6 h-6 text-emerald-400" />
                  </div>
                  <span className="font-bold text-white text-sm mb-1 font-sans">3. Local Machine</span>
                  <span className="text-emerald-400 text-[11px] bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800 font-bold">
                    http://localhost:3000
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. FAQ Section ───────────────────────────────────────────────── */}
        <section id="faq" className="px-6 py-24 border-b border-zinc-900 bg-zinc-950/40">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-mono text-violet-400 uppercase tracking-widest bg-violet-950/60 border border-violet-800/60 px-3 py-1 rounded-full">
                FAQ
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mt-4">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-4">
              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <h3 className="text-base font-bold text-white mb-2">Is Reverse Tunnel 100% free & open source?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Yes! Reverse Tunnel is released under the MIT License. You can use our hosted service at <code className="text-violet-300 font-mono">quickshelf.online</code> or self-host your own server on any $4/month cloud VM.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <h3 className="text-base font-bold text-white mb-2">How does 1-Click Webhook Replay work?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  When a request hits your tunnel URL, our Go server records the headers and raw body into a 24-hour MongoDB TTL collection. Clicking "Replay" in your web dashboard re-sends that payload down your active WebSocket tunnel directly to your localhost app.
                </p>
              </div>

              <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-6 hover:border-zinc-700 transition-colors">
                <h3 className="text-base font-bold text-white mb-2">How are API keys stored and secured?</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  API keys are generated with random crypto bytes and stored as SHA-256 hashes. Plain text keys are only displayed once upon creation and are never accessible by server operators.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── 9. Footer ────────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-12 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-500 font-mono">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-violet-600/20 border border-violet-500/30">
              <Terminal className="w-4 h-4 text-violet-400" />
            </div>
            <span className="font-bold text-white font-sans">Reverse Tunnel</span>
            <span>— MIT Open Source Project</span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="https://github.com/bhadrasuman/reverse-tunnel"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://github.com/bhadrasuman/reverse-tunnel/blob/main/docs/index.md"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
