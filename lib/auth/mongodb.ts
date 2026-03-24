import { MongoClient, Db } from 'mongodb'

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined')
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db(process.env.MONGODB_DB || 'auth')

  cachedClient = client
  cachedDb = db

  return { client, db }
}

export async function getDb() {
  const { db } = await connectToDatabase()
  return db
}

export interface VerificationCode {
  email: string
  code: string
  expiresAt: Date
  verified: boolean
}

export async function saveVerificationCode(
  email: string,
  code: string,
  expirationMinutes: number = 15
) {
  const db = await getDb()
  const collection = db.collection<VerificationCode>('verification_codes')

  const expiresAt = new Date(Date.now() + expirationMinutes * 60 * 1000)

  await collection.updateOne(
    { email },
    {
      $set: {
        email,
        code,
        expiresAt,
        verified: false,
      },
    },
    { upsert: true }
  )

  return { email, code, expiresAt, verified: false }
}

export async function verifyCode(email: string, code: string) {
  const db = await getDb()
  const collection = db.collection<VerificationCode>('verification_codes')

  const record = await collection.findOne({ email, code })

  if (!record) {
    return { success: false, error: 'Invalid code' }
  }

  if (record.expiresAt < new Date()) {
    return { success: false, error: 'Code has expired' }
  }

  // Mark as verified
  await collection.updateOne({ email, code }, { $set: { verified: true } })

  return { success: true, email }
}

export async function deleteVerificationCode(email: string) {
  const db = await getDb()
  const collection = db.collection<VerificationCode>('verification_codes')
  await collection.deleteOne({ email })
}

// Session management
export interface UserSession {
  email: string
  createdAt: Date
  expiresAt: Date
  token: string
}

export async function createSession(
  email: string,
  expirationDays: number = 30
): Promise<UserSession> {
  const db = await getDb()
  const collection = db.collection<UserSession>('sessions')

  const now = new Date()
  const expiresAt = new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000)

  // Generate a simple token (in production, use JWT)
  const token = Buffer.from(`${email}:${Date.now()}`).toString('base64')

  const session: UserSession = {
    email,
    createdAt: now,
    expiresAt,
    token,
  }

  await collection.insertOne(session)
  return session
}

export async function getSession(token: string): Promise<UserSession | null> {
  const db = await getDb()
  const collection = db.collection<UserSession>('sessions')

  const session = await collection.findOne({ token })

  if (!session) {
    return null
  }

  if (session.expiresAt < new Date()) {
    // Session expired, delete it
    await collection.deleteOne({ token })
    return null
  }

  return session
}

export async function deleteSession(token: string) {
  const db = await getDb()
  const collection = db.collection<UserSession>('sessions')
  await collection.deleteOne({ token })
}
