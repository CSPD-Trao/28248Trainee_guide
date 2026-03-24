import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(
  email: string,
  code: string,
) {
  try {
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      template: 'trainee-onboarding-welcome',
      props: {
        SSO_CODE: code,
      },
    })

    return { success: true, result }
  } catch (error) {
    console.error('Failed to send verification email:', error)
    return { success: false, error }
  }
}
