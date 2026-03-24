const ALLOWED_DOMAIN = 'parra.catholic.edu.au'

export function generateVerificationCode(length: number): string {
  return Math.floor(
    Math.pow(10, length - 1) + Math.random() * 9 * Math.pow(10, length - 1)
  ).toString()
}

export function isAllowedEmail(email: string): boolean {
  return email.endsWith(`@${ALLOWED_DOMAIN}`)
}