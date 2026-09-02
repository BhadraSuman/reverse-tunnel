import { Zap } from 'lucide-react'
import CopyButton from './CopyButton'

const steps = [
  {
    number: '01',
    title: 'Install the CLI',
    description: 'Install the tunnel binary via Go:',
    code: 'go install github.com/bhadrasuman/reverse-tunnel/cmd/tunnel@latest',
  },
  {
    number: '02',
    title: 'Configure your API key',
    description: 'Set your API key from the dashboard above:',
    code: 'tunnel config --key YOUR_API_KEY',
  },
  {
    number: '03',
    title: 'Start a tunnel',
    description: 'Expose any local port to the internet:',
    code: 'tunnel start --port 3000',
  },
]

export default function QuickStart() {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="w-5 h-5 text-violet-400" />
        <h2 className="text-lg font-semibold text-white">Quick Start</h2>
      </div>

      <div className="space-y-6">
        {steps.map((step) => (
          <div key={step.number} className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <span className="text-xs font-bold text-violet-400">{step.number}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-1">{step.title}</h3>
              <p className="text-sm text-gray-400 mb-2">{step.description}</p>
              <div className="flex items-center gap-2 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3">
                <code className="flex-1 font-mono text-sm text-green-400 truncate">{step.code}</code>
                <CopyButton text={step.code} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
