import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ApiKeyCard from '@/components/ApiKeyCard'
import TunnelsTable from '@/components/TunnelsTable'
import QuickStart from '@/components/QuickStart'

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) redirect('/')

  const firstName = session.user.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          {getGreeting()}, {firstName} 👋
        </h1>
        <p className="text-gray-400 mt-1 text-sm">
          Manage your tunnels and API key from here.
        </p>
      </div>

      {/* API Key */}
      <ApiKeyCard apiKeyPrefix={session.user.apiKeyPrefix} />

      {/* Active Tunnels */}
      <TunnelsTable userId={session.user.id} />

      {/* Quick Start */}
      <QuickStart />
    </div>
  )
}
