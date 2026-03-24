import type { NextApiRequest, NextApiResponse } from 'next'
import { saveVerificationCode } from '@/lib/auth/mongodb'
import { sendVerificationEmail } from '@/lib/auth/email'
import { generateVerificationCode, isAllowedEmail } from '@/lib/auth/utils'

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
    const { email } = req.body

    // Validate email
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'Email is required' })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check domain
    if (!isAllowedEmail(normalizedEmail)) {
      return res.status(403).json({ 
        error: `Only @parra.catholic.edu.au emails are allowed` 
      })
    }

    // Generate code
    const code = generateVerificationCode(6)

    // Save to database
    await saveVerificationCode(normalizedEmail, code, 15) // 15 minute expiration

    // Send email
    const emailResult = await sendVerificationEmail(normalizedEmail, code)

    if (!emailResult.success) {
      return res.status(500).json({ 
        error: `Failed to send verification email: ${emailResult.error || 'Unknown error'}` 
      })
    }

    return res.status(200).json({ 
      success: true,
      message: `Verification code sent to ${normalizedEmail}` 
    })
  } catch (error) {
    console.error('Request code error:', error)
    return res.status(500).json({ 
      error: 'Internal server error' 
    })
  }
}
