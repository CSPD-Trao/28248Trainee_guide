import { readdir } from 'fs/promises'
import { join } from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'CSPD-Trao'
const GITHUB_REPO = process.env.GITHUB_REPO || '28248Trainee_guide'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Try GitHub API first so newly added guides appear without redeploying
  try {
    const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/content/guides?ref=${GITHUB_BRANCH}`
    const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json', 'Cache-Control': 'no-cache' }
    if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
    const ghRes = await fetch(url, { headers })
    if (ghRes.ok) {
      const files: Array<{ name: string; type: string }> = await ghRes.json()
      const guideSlugs = files
        .filter(f => f.type === 'file' && f.name.endsWith('.md'))
        .map(f => f.name.replace('.md', ''))
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate')
      return res.status(200).json({ guides: guideSlugs })
    }
  } catch (_) {}

  // Fallback: local filesystem (local dev)
  try {
    const guidesPath = join(process.cwd(), 'content', 'guides')
    const files = await readdir(guidesPath)
    const guideSlugs = files
      .filter(file => file.endsWith('.md'))
      .map(file => file.replace('.md', ''))
    res.status(200).json({ guides: guideSlugs })
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guides' })
  }
}
