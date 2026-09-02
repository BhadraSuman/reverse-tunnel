'use client'

import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  )
}
