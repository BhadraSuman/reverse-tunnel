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
      const username = (profile as any)?.login || user.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user'

      await User.findOneAndUpdate(
        { githubId },
        {
          $set: {
            username,
            email: user.email || '',
            name: user.name || '',
            avatarUrl: user.image || '',
          },
          $setOnInsert: {
            githubId,
            subdomain: username,
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
