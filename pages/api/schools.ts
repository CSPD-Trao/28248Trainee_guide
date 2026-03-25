import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'
import { readFile } from 'fs/promises'
import { join } from 'path'

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'CSPD-Trao'
const GITHUB_REPO = process.env.GITHUB_REPO || '28248Trainee_guide'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'
const SCHOOLS_PATH = 'content/schools.json'
const AUDIT_PATH = 'content/audit-log.json'

export interface School {
  ageId: string
  name: string
}

function gitHubHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
    ...extra,
  }
}

async function getFileFromGitHub(path: string): Promise<{ content: string; sha: string } | null> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`
  const res = await fetch(url, { headers: gitHubHeaders() })
  if (!res.ok) return null
  const data = await res.json()
  const decoded = Buffer.from(data.content, 'base64').toString('utf-8')
  return { content: decoded, sha: data.sha }
}

async function commitFileToGitHub(path: string, content: string, sha: string | null, message: string): Promise<boolean> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`
  const body: Record<string, unknown> = {
    message,
    content: Buffer.from(content).toString('base64'),
    branch: GITHUB_BRANCH,
  }
  if (sha) body.sha = sha
  const res = await fetch(url, { method: 'PUT', headers: gitHubHeaders(), body: JSON.stringify(body) })
  return res.ok
}

async function appendAuditEntry(author: string, action: string, detail: string): Promise<void> {
  try {
    const existing = await getFileFromGitHub(AUDIT_PATH)
    const entries: unknown[] = existing ? JSON.parse(existing.content) : []
    entries.push({ date: new Date().toISOString(), author, action, detail })
    await commitFileToGitHub(
      AUDIT_PATH,
      JSON.stringify(entries, null, 2),
      existing?.sha ?? null,
      `audit: ${action} by ${author}`
    )
  } catch {
    // Audit log failure is non-fatal
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Try GitHub first
    try {
      const file = await getFileFromGitHub(SCHOOLS_PATH)
      if (file) {
        const schools: School[] = JSON.parse(file.content)
        return res.status(200).json({ schools })
      }
    } catch (_) {}

    // Fallback: local filesystem
    try {
      const localPath = join(process.cwd(), SCHOOLS_PATH)
      const raw = await readFile(localPath, 'utf-8')
      return res.status(200).json({ schools: JSON.parse(raw) })
    } catch {
      return res.status(200).json({ schools: [] })
    }
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.email) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const { ageId, name } = req.body as { ageId?: string; name?: string }
    if (!ageId || !name || typeof ageId !== 'string' || typeof name !== 'string') {
      return res.status(400).json({ error: 'ageId and name are required' })
    }

    // Sanitise inputs — only allow safe characters to prevent injection in the JSON commit
    const safeAgeId = ageId.trim().replace(/[^a-zA-Z0-9\-_]/g, '')
    const safeName = name.trim().replace(/[<>"'&]/g, '')
    if (!safeAgeId || !safeName) {
      return res.status(400).json({ error: 'Invalid ageId or name' })
    }

    try {
      const file = await getFileFromGitHub(SCHOOLS_PATH)
      const schools: School[] = file ? JSON.parse(file.content) : []

      if (schools.some(s => s.ageId === safeAgeId)) {
        return res.status(409).json({ error: 'A school with this AgeID already exists' })
      }

      schools.push({ ageId: safeAgeId, name: safeName })
      const ok = await commitFileToGitHub(
        SCHOOLS_PATH,
        JSON.stringify(schools, null, 2),
        file?.sha ?? null,
        `school: add ${safeName} (${safeAgeId})`
      )

      if (!ok) {
        return res.status(500).json({ error: 'Failed to commit school to GitHub' })
      }

      await appendAuditEntry(session.user.email, `Add school: ${safeName} (${safeAgeId})`, SCHOOLS_PATH)
      return res.status(200).json({ school: { ageId: safeAgeId, name: safeName } })
    } catch (err) {
      console.error('schools POST error:', err)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
