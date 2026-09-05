'use client'

import { useEffect, useState, useCallback } from 'react'
import { Activity, RefreshCw, ChevronDown, ChevronRight, Play, Clock, CheckCircle2, AlertCircle } from 'lucide-react'

interface RequestLog {
  id: string
  channelId: string
  subdomain: string
  method: string
  path: string
  query?: string
  requestHeaders: Record<string, string>
  requestBody?: string
  responseStatus: number
  responseHeaders?: Record<string, string>
  responseBody?: string
  durationMs: number
  clientIp?: string
  createdAt: string
}

interface TrafficInspectorProps {
  subdomain?: string
}

export default function TrafficInspector({ subdomain }: TrafficInspectorProps) {
  const [logs, setLogs] = useState<RequestLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replayingId, setReplayingId] = useState<string | null>(null)
  const [replaySuccess, setReplaySuccess] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!subdomain) return
    setLoading(true)
    try {
      const res = await fetch(`/api/inspect?subdomain=${encodeURIComponent(subdomain)}`)
      if (!res.ok) throw new Error('Failed to fetch inspect logs')
      const data = await res.json()
      setLogs(data.logs || [])
      setError(null)
    } catch {
      setError('Could not fetch traffic logs')
    } finally {
      setLoading(false)
    }
  }, [subdomain])

  useEffect(() => {
    fetchLogs()
    const interval = setInterval(fetchLogs, 4000)
    return () => clearInterval(interval)
  }, [fetchLogs])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleReplay = async (log: RequestLog, e: React.MouseEvent) => {
    e.stopPropagation()
    setReplayingId(log.id)
    try {
      // Replay action makes HTTP call to proxied tunnel host
      const res = await fetch(`/api/inspect/replay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logId: log.id, subdomain: log.subdomain }),
      })

      if (res.ok) {
        setReplaySuccess(log.id)
        setTimeout(() => setReplaySuccess(null), 3000)
        fetchLogs()
      }
    } catch {
      // Handled silently
    } finally {
      setReplayingId(null)
    }
  }

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return 'bg-green-950 text-green-400 border-green-800'
    if (status >= 300 && status < 400) return 'bg-blue-950 text-blue-400 border-blue-800'
    if (status >= 400 && status < 500) return 'bg-amber-950 text-amber-400 border-amber-800'
    return 'bg-red-950 text-red-400 border-red-800'
  }

  const getMethodBadge = (method: string) => {
    switch (method.toUpperCase()) {
      case 'GET': return 'bg-blue-900/50 text-blue-300 border-blue-700/50'
      case 'POST': return 'bg-green-900/50 text-green-300 border-green-700/50'
      case 'PUT': return 'bg-amber-900/50 text-amber-300 border-amber-700/50'
      case 'DELETE': return 'bg-red-900/50 text-red-300 border-red-700/50'
      default: return 'bg-gray-800 text-gray-300 border-gray-700'
    }
  }

  if (!subdomain) {
    return null
  }

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">Traffic Inspector</h2>
          <span className="text-xs bg-violet-950 text-violet-300 border border-violet-800 px-2 py-0.5 rounded-full font-mono">
            {subdomain}
          </span>
        </div>
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Logs Table */}
      {logs.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-500">
          No traffic logs captured for this tunnel yet. Send a request to test!
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const isExpanded = expandedId === log.id
            const isReplaying = replayingId === log.id
            const isReplayed = replaySuccess === log.id

            return (
              <div
                key={log.id}
                className="rounded-lg border border-gray-800 bg-gray-950 overflow-hidden transition-colors"
              >
                {/* Request Bar Header */}
                <div
                  onClick={() => toggleExpand(log.id)}
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-gray-900/50 transition-colors"
                >
                  <div className="flex items-center gap-3 font-mono text-sm">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded border font-semibold ${getMethodBadge(log.method)}`}>
                      {log.method}
                    </span>
                    <span className={`px-2 py-0.5 text-xs rounded border font-semibold ${getStatusColor(log.responseStatus)}`}>
                      {log.responseStatus}
                    </span>
                    <span className="text-gray-200 truncate max-w-xs sm:max-w-md">{log.path}</span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      {log.durationMs}ms
                    </span>
                    <button
                      onClick={(e) => handleReplay(log, e)}
                      disabled={isReplaying}
                      className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white px-2.5 py-1 rounded text-xs transition-colors"
                    >
                      {isReplayed ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-green-300" />
                          Replayed!
                        </>
                      ) : (
                        <>
                          <Play className={`w-3 h-3 ${isReplaying ? 'animate-pulse' : ''}`} />
                          {isReplaying ? 'Replaying...' : 'Replay'}
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details View */}
                {isExpanded && (
                  <div className="border-t border-gray-800 p-4 bg-gray-900/40 text-xs font-mono space-y-4">
                    {/* Headers */}
                    <div>
                      <h4 className="text-gray-400 font-semibold mb-2">Request Headers</h4>
                      <div className="bg-gray-950 border border-gray-800 rounded p-3 text-gray-300 overflow-x-auto">
                        {Object.entries(log.requestHeaders || {}).map(([k, v]) => (
                          <div key={k}>
                            <span className="text-violet-400">{k}:</span> {v}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Request Body */}
                    {log.requestBody && (
                      <div>
                        <h4 className="text-gray-400 font-semibold mb-2">Request Body</h4>
                        <pre className="bg-gray-950 border border-gray-800 rounded p-3 text-green-400 overflow-x-auto max-h-40">
                          {log.requestBody}
                        </pre>
                      </div>
                    )}

                    {/* Response Body */}
                    {log.responseBody && (
                      <div>
                        <h4 className="text-gray-400 font-semibold mb-2">Response Body</h4>
                        <pre className="bg-gray-950 border border-gray-800 rounded p-3 text-blue-300 overflow-x-auto max-h-40">
                          {log.responseBody}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
