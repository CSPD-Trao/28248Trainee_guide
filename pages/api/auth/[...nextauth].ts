import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const ALLOWED_DOMAIN = 'parra.catholic.edu.au'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ profile }) {
      return profile?.email?.endsWith(`@${ALLOWED_DOMAIN}`) ?? false
    },
    async jwt({ token, profile }) {
      if (profile?.email) token.email = profile.email
      return token
    },
    async session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email as string
      return session
    },
  },
  pages: {
    signIn: '/editor',
    error: '/editor',
  },
}

export default NextAuth(authOptions)
