'use client'

import { useEffect, useState, useCallback } from 'react'
import { Terminal, ExternalLink, Wifi } from 'lucide-react'

interface Tunnel {
  subdomain: string
  userId: string
  connectedAt: string
  reqCount: number
}

function relativeTime(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

interface TunnelsTableProps {
  userId: string
}

export default function TunnelsTable({ userId }: TunnelsTableProps) {
  const [tunnels, setTunnels] = useState<Tunnel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const domain = process.env.NEXT_PUBLIC_DOMAIN || 'tunnel.local'

  const fetchTunnels = useCallback(async () => {
    try {
      const res = await fetch('/api/tunnels')
      if (!res.ok) throw new Error('Failed to fetch tunnels')
      const data = await res.json()
      setTunnels(data)
      setError(null)
    } catch {
      setError('Could not reach tunnel server')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTunnels()
    const interval = setInterval(fetchTunnels, 5000)
    return () => clearInterval(interval)
  }, [fetchTunnels])

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Wifi className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Active Tunnels</h2>
          {/* Live indicator */}
          <span className="flex items-center gap-1.5 ml-1">
            <span
              className={`w-2 h-2 rounded-full ${
                tunnels.length > 0 ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
              }`}
            />
            <span className="text-xs text-gray-500">{tunnels.length > 0 ? 'Live' : 'Idle'}</span>
          </span>
        </div>
        <span className="text-xs text-gray-600">Refreshes every 5s</span>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center py-8 text-sm text-amber-400">{error}</div>
      )}

      {/* Empty state */}
      {!loading && !error && tunnels.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Terminal className="w-10 h-10 text-gray-700 mb-3" />
          <p className="text-gray-400 font-medium mb-1">No active tunnels</p>
          <p className="text-sm text-gray-600 mb-4">Start the CLI to create one</p>
          <div className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5">
            <code className="font-mono text-sm text-green-400">tunnel start --port 3000</code>
          </div>
        </div>
      )}

      {/* Table */}
      {!loading && !error && tunnels.length > 0 && (
        <div className="overflow-x-auto -mx-6">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-800">
                <th className="text-left px-6 pb-3 font-medium">Subdomain</th>
                <th className="text-left px-6 pb-3 font-medium">URL</th>
                <th className="text-left px-6 pb-3 font-medium">Connected</th>
                <th className="text-left px-6 pb-3 font-medium">Requests</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {tunnels.map((tunnel) => (
                <tr key={tunnel.subdomain} className="hover:bg-gray-800/30 transition-colors">
                  <td className="px-6 py-3.5">
                    <span className="font-mono text-sm bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md">
                      {tunnel.subdomain}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <a
                      href={`https://${tunnel.subdomain}.${domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      {tunnel.subdomain}.{domain}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </td>
                  <td className="px-6 py-3.5 text-sm text-gray-400">
                    {relativeTime(tunnel.connectedAt)}
                  </td>
                  <td className="px-6 py-3.5">
                    <span className="inline-flex items-center text-sm font-mono text-gray-300">
                      {tunnel.reqCount.toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
