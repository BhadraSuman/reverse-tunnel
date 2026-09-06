import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { logId, subdomain } = await req.json()
    if (!logId || !subdomain) {
      return NextResponse.json({ error: 'logId and subdomain required' }, { status: 400 })
    }

    const apiUrl = process.env.TUNNEL_API_URL || 'http://localhost:3002'
    const logRes = await fetch(`${apiUrl}/api/inspect/log?id=${encodeURIComponent(logId)}`)
    
    if (!logRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch original log for replay' }, { status: 404 })
    }

    const log = await logRes.json()

    // Filter headers to avoid conflicts in fetch
    const cleanHeaders: Record<string, string> = {}
    if (log.requestHeaders) {
      for (const [k, v] of Object.entries(log.requestHeaders)) {
        const lowerKey = k.toLowerCase()
        if (
          lowerKey !== 'host' &&
          lowerKey !== 'content-length' &&
          lowerKey !== 'transfer-encoding' &&
          lowerKey !== 'connection'
        ) {
          cleanHeaders[k] = v as string
        }
      }
    }

    const targetDomain = process.env.DOMAIN || 'quickshelf.online'
    const fullHost = `${subdomain}.${targetDomain}`

    // Perform the replay request against the proxy server (port 4000)
    const proxyUrl = process.env.TUNNEL_PROXY_URL || 'http://localhost:4000'
    const replayRes = await fetch(`${proxyUrl}${log.path}`, {
      method: log.method,
      headers: {
        ...cleanHeaders,
        'Host': fullHost,
        'X-Forwarded-Host': fullHost,
        'X-Tunnel-Subdomain': subdomain,
        'X-Tunnel-Replay': 'true',
      },
      body: ['GET', 'HEAD'].includes(log.method.toUpperCase()) ? undefined : log.requestBody,
    })

    return NextResponse.json({
      replayed: true,
      status: replayRes.status,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Replay failed' }, { status: 500 })
  }
}
