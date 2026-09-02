import { auth } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import crypto from 'crypto'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const user = await User.findById(session.user.id).lean()
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

  return NextResponse.json({ prefix: (user as any).apiKeyPrefix })
}

export async function POST() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rawKey = 'tk_' + crypto.randomBytes(24).toString('hex')
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
  const keyPrefix = rawKey.slice(0, 11)

  await connectDB()
  await User.findByIdAndUpdate(session.user.id, { apiKeyHash: keyHash, apiKeyPrefix: keyPrefix })

  // Return the full key ONCE — never stored in plain text
  return NextResponse.json({ key: rawKey, prefix: keyPrefix })
}
