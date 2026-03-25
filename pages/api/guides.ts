import { readdir, readFile } from 'fs/promises'
import { join } from 'path'
import matter from 'gray-matter'
import type { NextApiRequest, NextApiResponse } from 'next'

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'CSPD-Trao'
const GITHUB_REPO = process.env.GITHUB_REPO || '28248Trainee_guide'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

interface GuideMeta {
  slug: string
  title: string
  description: string
  sensitive: boolean
  schools: string[]
}

function buildGitHubHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json', 'Cache-Control': 'no-cache' }
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  return headers
}

function parseMeta(slug: string, raw: string): GuideMeta {
  const { data } = matter(raw)
  return {
    slug,
    title: data.title || slug.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    description: data.description || 'Learn more about this topic',
    sensitive: data.sensitive === true,
    schools: Array.isArray(data.schools) ? data.schools : [],
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Try GitHub API first so newly added guides appear without redeploying
  try {
    const listUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/content/guides?ref=${GITHUB_BRANCH}`
    const ghRes = await fetch(listUrl, { headers: buildGitHubHeaders() })
    if (ghRes.ok) {
      const files: Array<{ name: string; type: string; download_url: string }> = await ghRes.json()
      const mdFiles = files.filter(f => f.type === 'file' && f.name.endsWith('.md'))

      const guides = await Promise.all(
        mdFiles.map(async (f) => {
          const slug = f.name.replace('.md', '')
          try {
            const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/content/guides/${f.name}`
            const contentRes = await fetch(rawUrl, { headers: { 'Cache-Control': 'no-cache', ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}) } })
            if (!contentRes.ok) return parseMeta(slug, '')
            const raw = await contentRes.text()
            return parseMeta(slug, raw)
          } catch {
            return parseMeta(slug, '')
          }
        })
      )

      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate')
      return res.status(200).json({ guides })
    }
  } catch (_) {}

  // Fallback: local filesystem (local dev)
  try {
    const guidesPath = join(process.cwd(), 'content', 'guides')
    const files = await readdir(guidesPath)
    const mdFiles = files.filter(file => file.endsWith('.md'))

    const guides = await Promise.all(
      mdFiles.map(async (file) => {
        const slug = file.replace('.md', '')
        try {
          const raw = await readFile(join(guidesPath, file), 'utf-8')
          return parseMeta(slug, raw)
        } catch {
          return parseMeta(slug, '')
        }
      })
    )

    return res.status(200).json({ guides })
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch guides' })
  }
}
