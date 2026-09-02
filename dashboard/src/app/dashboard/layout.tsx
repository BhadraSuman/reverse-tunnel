import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Terminal } from 'lucide-react'
import SignOutButton from '@/components/SignOutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session) redirect('/')

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center">
              <Terminal className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white tracking-tight">Tunnel</span>
          </div>

          {/* User section */}
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                width={30}
                height={30}
                className="w-7 h-7 rounded-full ring-1 ring-gray-700"
              />
            )}
            <span className="text-sm text-gray-300 hidden sm:block">{session.user?.name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
