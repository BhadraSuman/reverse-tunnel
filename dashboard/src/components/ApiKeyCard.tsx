'use client'

import { useState } from 'react'
import { Key, RefreshCw, Copy, Check, X, AlertTriangle } from 'lucide-react'

interface ApiKeyCardProps {
  apiKeyPrefix?: string
}

export default function ApiKeyCard({ apiKeyPrefix }: ApiKeyCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [currentPrefix, setCurrentPrefix] = useState(apiKeyPrefix)

  const handleRegenerate = async () => {
    const confirmed = window.confirm(
      'This will invalidate your current API key and all existing tunnel connections. Continue?'
    )
    if (!confirmed) return

    setIsLoading(true)
    try {
      const res = await fetch('/api/keys', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to regenerate key')
      const data = await res.json()
      setNewKey(data.key)
      setCurrentPrefix(data.prefix)
      setShowModal(true)
    } catch (err) {
      alert('Failed to regenerate API key. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setNewKey(null)
    setCopied(false)
  }

  return (
    <>
      <section className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Key className="w-5 h-5 text-violet-400" />
          <h2 className="text-lg font-semibold text-white">API Key</h2>
        </div>

        <p className="text-sm text-gray-400 mb-4">
          Use this key to authenticate the tunnel CLI. Keep it secret.
        </p>

        {/* Key display */}
        <div className="flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 mb-5">
          <code className="flex-1 font-mono text-sm text-gray-300 tracking-wider">
            {currentPrefix || 'tk_'}
            {'•'.repeat(32)}
          </code>
        </div>

        {/* Action buttons */}
        <button
          onClick={handleRegenerate}
          disabled={isLoading}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Regenerating…' : 'Regenerate Key'}
        </button>
      </section>

      {/* Modal overlay */}
      {showModal && newKey && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white">New API Key Generated</h3>
                <p className="text-sm text-gray-400 mt-1">Copy and store this key securely.</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Warning banner */}
            <div className="flex items-start gap-2 bg-amber-950/50 border border-amber-700/50 rounded-lg px-4 py-3 mb-4">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-300">
                <strong>Save this now.</strong> This key will not be shown again for security reasons.
              </p>
            </div>

            {/* Key display */}
            <div className="bg-gray-950 border border-gray-800 rounded-lg px-4 py-3 mb-4">
              <code className="block font-mono text-sm text-green-400 break-all">{newKey}</code>
            </div>

            {/* Copy button */}
            <button
              onClick={() => handleCopy(newKey)}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-sm transition-all duration-150 ${
                copied
                  ? 'bg-green-900/50 text-green-400 border border-green-700/50'
                  : 'bg-violet-600 hover:bg-violet-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied to clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy API Key
                </>
              )}
            </button>

            <button
              onClick={handleCloseModal}
              className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
            >
              I've saved it, close this
            </button>
          </div>
        </div>
      )}
    </>
  )
}
