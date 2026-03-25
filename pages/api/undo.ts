import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth/[...nextauth]'

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'CSPD-Trao'
const GITHUB_REPO = process.env.GITHUB_REPO || '28248Trainee_guide'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

function ghHeaders(extra: Record<string, string> = {}): Record<string, string> {
  return {
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
    ...extra,
  }
}

async function ghGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: ghHeaders() })
  if (!res.ok) throw new Error(`GitHub GET ${url} failed: ${res.status}`)
  return res.json() as Promise<T>
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const session = await getServerSession(req, res, authOptions)
  if (!session?.user?.email) return res.status(401).json({ error: 'Authentication required' })

  const { sha } = req.body as { sha?: string }
  if (!sha || typeof sha !== 'string' || !/^[0-9a-f]{7,40}$/i.test(sha)) {
    return res.status(400).json({ error: 'Invalid sha' })
  }

  try {
    // 1. Get the commit to revert and its parent
    const targetCommit = await ghGet<{
      sha: string
      message: string
      parents: Array<{ sha: string }>
      tree: { sha: string }
    }>(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/commits/${sha}`)

    if (!targetCommit.parents.length) {
      return res.status(400).json({ error: 'Cannot revert the initial commit' })
    }
    const parentSha = targetCommit.parents[0].sha

    // 2. Get parent commit's tree sha
    const parentCommit = await ghGet<{ tree: { sha: string } }>(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/commits/${parentSha}`
    )
    const parentTreeSha = parentCommit.tree.sha

    // 3. Get current HEAD sha
    const refData = await ghGet<{ object: { sha: string } }>(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${GITHUB_BRANCH}`
    )
    const headSha = refData.object.sha

    // 4. Create a revert commit: tree = parent's tree, parent = current HEAD
    const revertMessage = `Revert: ${targetCommit.message.split('\n')[0]}\n\nReverts commit ${sha.slice(0, 7)}`
    const newCommitRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/commits`,
      {
        method: 'POST',
        headers: ghHeaders(),
        body: JSON.stringify({
          message: revertMessage,
          tree: parentTreeSha,
          parents: [headSha],
          author: { name: session.user.email, email: session.user.email, date: new Date().toISOString() },
        }),
      }
    )
    if (!newCommitRes.ok) {
      const err = await newCommitRes.text()
      console.error('create revert commit failed:', err)
      return res.status(502).json({ error: 'Failed to create revert commit' })
    }
    const newCommit = await newCommitRes.json() as { sha: string }

    // 5. Update branch ref to new commit
    const updateRefRes = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/refs/heads/${GITHUB_BRANCH}`,
      {
        method: 'PATCH',
        headers: ghHeaders(),
        body: JSON.stringify({ sha: newCommit.sha, force: false }),
      }
    )
    if (!updateRefRes.ok) {
      const err = await updateRefRes.text()
      console.error('update ref failed:', err)
      return res.status(502).json({ error: 'Failed to update branch ref' })
    }

    return res.status(200).json({ revertSha: newCommit.sha })
  } catch (err) {
    console.error('undo error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
