import type { NextApiRequest, NextApiResponse } from 'next'
import { verifyCode, createSession } from '@/lib/auth/mongodb'

type ResponseData = {
  success?: boolean
  token?: string
  email?: string
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
    const { email, code } = req.body

    // Validate inputs
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' })
    }

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code is required' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Verify the code
    const result = await verifyCode(normalizedEmail, code)

    if (!result.success) {
      return res.status(401).json({ error: result.error })
    }

    // Create session (30 days)
    const session = await createSession(normalizedEmail, 30)

    // Set secure cookie
    res.setHeader(
      'Set-Cookie',
      `auth_token=${session.token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}`
    )

    return res.status(200).json({
      success: true,
      token: session.token,
      email: normalizedEmail,
    })
  } catch (error) {
    console.error('Verify code error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
