'use client'

import { signIn } from 'next-auth/react'
import { Github } from 'lucide-react'

export default function LoginButton() {
  return (
    <button
      onClick={() => signIn('github')}
      className="flex items-center gap-3 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8 py-3 rounded-xl text-lg transition-all duration-150 shadow-lg hover:shadow-xl"
    >
      <Github className="w-5 h-5" />
      Continue with GitHub
    </button>
  )
}
