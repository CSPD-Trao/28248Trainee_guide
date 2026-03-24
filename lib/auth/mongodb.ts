import { MongoClient } from 'mongodb'
import crypto from 'crypto'

const client = new MongoClient(process.env.MONGODB_URI as string)
const clientPromise = client.connect()

// ── OTP codes ──────────────────────────────────────────────

export async function saveVerificationCode(
  email: string,
  code: string,
  expiresInMinutes: number
) {
  const db = (await clientPromise).db('tinacms')
  const expires = new Date(Date.now() + expiresInMinutes * 60 * 1000)
  await db.collection('otp_codes').updateOne(
    { email },
    { $set: { email, code, expires, used: false } },
    { upsert: true }
  )
}

export async function verifyCode(email: string, code: string) {
  const db = (await clientPromise).db('tinacms')
  const record = await db.collection('otp_codes').findOne({ email })

  if (!record)                          return { success: false, error: 'No code found' }
  if (record.used)                      return { success: false, error: 'Code already used' }
  if (new Date() > new Date(record.expires)) return { success: false, error: 'Code expired' }
  if (record.code !== code)             return { success: false, error: 'Invalid code' }

  // Mark used
  await db.collection('otp_codes').updateOne({ email }, { $set: { used: true } })
  return { success: true }
}

// ── Sessions ───────────────────────────────────────────────

export async function createSession(email: string, expiresInDays: number) {
  const db = (await clientPromise).db('tinacms')
  const token = crypto.randomBytes(32).toString('hex')
  const expires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
  await db.collection('sessions').insertOne({ email, token, expires })
  return { token }
}

export async function getSession(token: string) {
  const db = (await clientPromise).db('tinacms')
  const session = await db.collection('sessions').findOne({ token })
  if (!session || new Date() > new Date(session.expires)) return null
  return session
}

export async function deleteSession(token: string) {
  const db = (await clientPromise).db('tinacms')
  await db.collection('sessions').deleteOne({ token })
}