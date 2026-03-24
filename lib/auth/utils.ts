export function generateVerificationCode(length: number = 6): string {
  const digits = '0123456789'
  let code = ''
  for (let i = 0; i < length; i++) {
    code += digits.charAt(Math.floor(Math.random() * digits.length))
  }
  return code
}

export const ALLOWED_DOMAIN = '@parra.catholic.edu.au'

export function isAllowedEmail(email: string): boolean {
  return email.toLowerCase().endsWith(ALLOWED_DOMAIN.toLowerCase())
}
