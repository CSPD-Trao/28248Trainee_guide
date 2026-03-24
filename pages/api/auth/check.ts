import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from '@/lib/auth/mongodb'

type ResponseData = {
  authenticated?: boolean
  email?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.cookies.auth_token

    if (!token) {
      return res.status(401).json({ authenticated: false, error: 'No session' })
    }

    const session = await getSession(token)

    if (!session) {
      return res.status(401).json({ authenticated: false, error: 'Session expired' })
    }

    return res.status(200).json({
      authenticated: true,
      email: session.email,
    })
  } catch (error) {
    console.error('Check session error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
