'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Key, RefreshCw, Copy, Check, X, ShieldCheck } from 'lucide-react'

interface ApiKeyCardProps {
  apiKeyPrefix?: string
}

export default function ApiKeyCard({ apiKeyPrefix }: ApiKeyCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [newKey, setNewKey] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copiedCmd, setCopiedCmd] = useState(false)
  const [currentPrefix, setCurrentPrefix] = useState(apiKeyPrefix)

  const executeRegenerateKey = async () => {
    setShowConfirmModal(false)
    setIsLoading(true)
    try {
      const res = await fetch('/api/keys', { method: 'POST' })
      if (!res.ok) throw new Error('Failed to generate key')
      const data = await res.json()
      setNewKey(data.key)
      setCurrentPrefix(data.prefix)
      setShowModal(true)
    } catch {
      alert('Failed to generate API key. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGenerateClick = () => {
    if (currentPrefix) {
      setShowConfirmModal(true)
    } else {
      executeRegenerateKey()
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // fallback
    }
  }

  const handleCopyCmd = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCmd(true)
      setTimeout(() => setCopiedCmd(false), 2500)
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
      <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 p-6 shadow-2xl backdrop-blur-xl hover:border-zinc-700/80 transition-all">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-600/20 border border-violet-500/30">
              <Key className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">CLI API Key</h2>
              <p className="text-xs text-gray-400">Authenticates your CLI tool with the tunnel server</p>
            </div>
          </div>

          {currentPrefix && (
            <span className="flex items-center gap-1.5 text-xs bg-green-950/80 text-green-400 border border-green-800/80 px-3 py-1 rounded-full font-medium shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5" />
              Active Key
            </span>
          )}
        </div>

        {!currentPrefix ? (
          <div className="bg-violet-950/40 border border-violet-800/60 rounded-xl p-4 mb-5">
            <h4 className="text-sm font-semibold text-white">Generate Your CLI Key</h4>
            <p className="text-xs text-gray-300 mt-1 leading-relaxed">
              Click below to generate your secure API key. For security, the full key is shown <strong>only once</strong> when generated.
            </p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-950 border border-gray-800/80 rounded-xl p-4 mb-5">
            <div>
              <span className="text-xs text-gray-500 font-mono block mb-1">KEY PREFIX:</span>
              <code className="font-mono text-sm text-violet-300 tracking-wider font-semibold">
                {currentPrefix}••••••••••••••••••••••••••••••••
              </code>
            </div>

            <div className="text-xs text-gray-400 bg-gray-900 border border-gray-800 px-3 py-1.5 rounded-lg font-mono">
              <span>SHA-256 Encrypted</span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          {!currentPrefix ? (
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-violet-950/40"
            >
              <Key className="w-4 h-4" />
              {isLoading ? 'Generating Key…' : 'Generate API Key'}
            </button>
          ) : (
            <button
              onClick={handleGenerateClick}
              disabled={isLoading}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700/80 disabled:opacity-60 text-gray-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Regenerating…' : 'Regenerate Key'}
            </button>
          )}
        </div>
      </section>

      {/* ── 1. MINIMALIST REGENERATE CONFIRMATION DIALOG ──────────────── */}
      {showConfirmModal && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen bg-black/75 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-xl space-y-4 font-sans text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-base font-semibold text-white">Regenerate API Key?</h3>
              <button onClick={() => setShowConfirmModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              This will invalidate your active key and disconnect existing tunnel sessions.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 px-4 py-2 rounded-lg text-xs font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeRegenerateKey}
                className="bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-lg text-xs transition-colors"
              >
                Regenerate
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── 2. MINIMALIST NEW KEY GENERATED DIALOG ────────────────────── */}
      {showModal && newKey && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 top-0 left-0 right-0 bottom-0 w-screen h-screen min-h-screen bg-black/75 backdrop-blur-sm flex items-center justify-center z-[99999] p-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4 font-sans text-left">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-base font-semibold text-white">API Key Generated</h3>
              <button onClick={handleCloseModal} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              Copy this key now. It is stored as a SHA-256 hash and will not be displayed again.
            </p>

            {/* Key Box */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <span className="text-[10px] font-mono text-zinc-500 block mb-1 uppercase">API Key</span>
              <code className="block font-mono text-xs text-emerald-400 break-all select-all font-semibold">
                {newKey}
              </code>
            </div>

            {/* Copy Button */}
            <button
              onClick={() => handleCopy(newKey)}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-xs transition-colors ${
                copied
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-white hover:bg-zinc-200 text-black'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied to Clipboard
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy API Key
                </>
              )}
            </button>

            {/* Configure Command */}
            <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-lg p-3 space-y-1 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 font-sans uppercase">Quick Config</span>
                <button
                  onClick={() => handleCopyCmd(`tunnel config --key ${newKey} --server wss://tunnel.quickshelf.online`)}
                  className="text-[11px] text-zinc-400 hover:text-white transition-colors flex items-center gap-1 font-sans"
                >
                  {copiedCmd ? <span className="text-emerald-400">Copied</span> : 'Copy Command'}
                </button>
              </div>
              <div
                onClick={() => handleCopyCmd(`tunnel config --key ${newKey} --server wss://tunnel.quickshelf.online`)}
                className="text-zinc-300 text-[11px] truncate cursor-pointer hover:text-white transition-colors"
              >
                tunnel config --key {newKey} --server wss://tunnel.quickshelf.online
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-full text-center text-xs text-zinc-500 hover:text-zinc-300 transition-colors pt-1"
            >
              Done, close
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
