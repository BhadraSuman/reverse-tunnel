'use client'

import { signIn } from 'next-auth/react'
import { Github } from 'lucide-react'

interface LoginButtonProps {
  className?: string
  text?: string
}

export default function LoginButton({ className, text }: LoginButtonProps) {
  return (
    <button
      onClick={() => signIn('github')}
      className={
        className ||
        'flex items-center justify-center gap-2.5 bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all shadow-lg hover:shadow-violet-600/30'
      }
    >
      <Github className="w-4 h-4" />
      {text || 'Sign In with GitHub'}
    </button>
  )
}
