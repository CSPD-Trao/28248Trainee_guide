import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect TinaCMS API routes
  if (pathname.startsWith('/api/tina')) {
    // Skip auth check in local dev when NEXTAUTH_SECRET is not configured
    if (!process.env.NEXTAUTH_SECRET) {
      return NextResponse.next()
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/tina/:path*',
  ],
}
