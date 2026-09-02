import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'
import { connectDB } from './db'
import User from '@/models/User'
import crypto from 'crypto'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  pages: { signIn: '/' },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider !== 'github') return false
      await connectDB()

      const githubId = String(profile?.id || account.providerAccountId)

      // Generate initial API key for new users only
      const rawKey = 'tk_' + crypto.randomBytes(24).toString('hex')
      const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')
      const keyPrefix = rawKey.slice(0, 11) // "tk_" + 8 chars

      await User.findOneAndUpdate(
        { githubId },
        {
          $setOnInsert: {
            githubId,
            email: user.email || '',
            name: user.name || '',
            avatarUrl: user.image || '',
            apiKeyHash: keyHash,
            apiKeyPrefix: keyPrefix,
            maxTunnels: 3,
            createdAt: new Date(),
          },
        },
        { upsert: true, new: true }
      )
      return true
    },

    async session({ session, token }) {
      if (token?.githubId) {
        await connectDB()
        const dbUser = await User.findOne({ githubId: String(token.githubId) }).lean()
        if (dbUser) {
          session.user.id = String((dbUser as any)._id)
          session.user.apiKeyPrefix = (dbUser as any).apiKeyPrefix
        }
      }
      return session
    },

    async jwt({ token, profile }) {
      if (profile) {
        token.githubId = (profile as any).id
      }
      return token
    },
  },
})
