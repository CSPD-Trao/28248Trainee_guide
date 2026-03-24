import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, code: string) {
  try {
    await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: email,
        template: {
            id: '5a9c683e-5fb3-47ee-92bd-6e98fe3aead5',
            variables: {
            SSO_CODE: code,
            },
        },
    })
    return { success: true }
  } catch (error) {
    console.error('Resend error:', error)
    return { success: false }
  }
}