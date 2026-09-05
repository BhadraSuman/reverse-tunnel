import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const apiUrl = process.env.TUNNEL_API_URL || 'http://localhost:3002'
    const res = await fetch(`${apiUrl}/api/tunnels`, { cache: 'no-store' })
    if (!res.ok) return NextResponse.json([])
    const tunnels = await res.json()
    // Filter to only this user's tunnels
    const myTunnels = tunnels.filter((t: any) => t.userId === session.user.id)
    return NextResponse.json(myTunnels)
  } catch {
    // Return empty array if Go server is unreachable
    return NextResponse.json([])
  }
}
