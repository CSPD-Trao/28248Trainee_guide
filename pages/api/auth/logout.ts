import type { NextApiRequest, NextApiResponse } from 'next'
import { deleteSession } from '@/lib/auth/mongodb'

type ResponseData = {
  success?: boolean
  message?: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = req.cookies.auth_token

    if (token) {
      await deleteSession(token)
    }

    // Clear cookie
    res.setHeader('Set-Cookie', 'auth_token=; Path=/; HttpOnly; Max-Age=0')

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
