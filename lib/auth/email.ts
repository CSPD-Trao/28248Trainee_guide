import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type SendResult = {
  success: boolean
  error?: string
}

export async function sendVerificationEmail(email: string, code: string): Promise<SendResult> {
  try {
    const result = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
        to: email,
        subject: 'Verification Code',
        template: {
            id: '5a9c683e-5fb3-47ee-92bd-6e98fe3aead5',
            variables: {
            SSO_CODE: code,
            },
        },
    })
    
    if (result.error) {
      console.error('Resend API error:', result.error)
      return { success: false, error: result.error.message }
    }
    
    console.log('Email sent successfully:', result.data?.id)
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Resend error:', errorMessage)
    return { success: false, error: errorMessage }
  }
}