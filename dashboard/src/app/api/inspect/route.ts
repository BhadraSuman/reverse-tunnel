import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const subdomain = searchParams.get('subdomain')

  if (!subdomain) {
    return NextResponse.json({ error: 'subdomain parameter is required' }, { status: 400 })
  }

  try {
    const apiUrl = process.env.TUNNEL_API_URL || 'http://localhost:3002'
    const res = await fetch(`${apiUrl}/api/inspect/logs?subdomain=${encodeURIComponent(subdomain)}`, {
      cache: 'no-store',
    })

    if (!res.ok) {
      return NextResponse.json({ logs: [] })
    }

    const logs = await res.json()
    return NextResponse.json({ logs: logs || [] })
  } catch {
    return NextResponse.json({ logs: [] })
  }
}
