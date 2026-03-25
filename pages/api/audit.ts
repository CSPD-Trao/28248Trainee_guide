import type { NextApiRequest, NextApiResponse } from 'next'

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'CSPD-Trao'
const GITHUB_REPO = process.env.GITHUB_REPO || '28248Trainee_guide'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export interface AuditEntry {
  sha: string
  message: string
  author: string
  date: string
  files: string[]
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'Cache-Control': 'no-cache',
    ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
  }

  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?path=content%2F&sha=${GITHUB_BRANCH}&per_page=50`
    const commitsRes = await fetch(url, { headers })
    if (!commitsRes.ok) {
      return res.status(502).json({ error: 'Failed to fetch commits from GitHub' })
    }

    const commits: Array<{
      sha: string
      commit: { message: string; author: { name: string; date: string } }
    }> = await commitsRes.json()

    // For each commit, get which files were changed (batched, up to 20 to avoid rate limiting)
    const entriesWithFiles = await Promise.all(
      commits.slice(0, 20).map(async (c) => {
        try {
          const detailRes = await fetch(
            `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits/${c.sha}`,
            { headers }
          )
          const detail = detailRes.ok ? await detailRes.json() : null
          const files: string[] = detail?.files?.map((f: { filename: string }) => f.filename) ?? []
          return {
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
            files,
          } as AuditEntry
        } catch {
          return {
            sha: c.sha,
            message: c.commit.message,
            author: c.commit.author.name,
            date: c.commit.author.date,
            files: [],
          } as AuditEntry
        }
      })
    )

    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate')
    return res.status(200).json({ entries: entriesWithFiles })
  } catch (err) {
    console.error('audit GET error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
