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

/** Recursively collect all .md files from a GitHub directory, returning { slug, downloadUrl } pairs. */
async function collectGitHubGuides(
  dirPath: string,
  slugPrefix: string
): Promise<Array<{ slug: string; downloadUrl: string }>> {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${dirPath}?ref=${GITHUB_BRANCH}`
  const res = await fetch(url, { headers: buildGitHubHeaders() })
  if (!res.ok) return []
  const items: Array<{ name: string; type: string; download_url: string | null }> = await res.json()
  const results: Array<{ slug: string; downloadUrl: string }> = []
  await Promise.all(items.map(async (item) => {
    const entrySlug = slugPrefix ? `${slugPrefix}/${item.name}` : item.name
    if (item.type === 'file' && item.name.endsWith('.md') && item.download_url) {
      results.push({ slug: entrySlug.replace(/\.md$/, ''), downloadUrl: item.download_url })
    } else if (item.type === 'dir') {
      const nested = await collectGitHubGuides(`${dirPath}/${item.name}`, entrySlug)
      results.push(...nested)
    }
  }))
  return results
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Try GitHub API first so newly added guides appear without redeploying
  try {
    const ghEntries = await collectGitHubGuides('content/guides', '')
    if (ghEntries.length > 0) {
      const rawHeaders: Record<string, string> = { 'Cache-Control': 'no-cache' }
      if (process.env.GITHUB_TOKEN) rawHeaders['Authorization'] = `token ${process.env.GITHUB_TOKEN}`

      const guides = await Promise.all(
        ghEntries.map(async ({ slug, downloadUrl }) => {
          try {
            const contentRes = await fetch(downloadUrl, { headers: rawHeaders })
            if (!contentRes.ok) return parseMeta(slug, '')
            return parseMeta(slug, await contentRes.text())
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
    // recursive: true returns relative paths like 'ola/daily.md'
    const files = (await readdir(guidesPath, { recursive: true })) as string[]
    const mdFiles = files.filter(f => f.endsWith('.md'))

    const guides = await Promise.all(
      mdFiles.map(async (relPath) => {
        const slug = relPath.replace(/\.md$/, '').replace(/\\/g, '/') // normalise Windows separators
        try {
          const raw = await readFile(join(guidesPath, relPath), 'utf-8')
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
