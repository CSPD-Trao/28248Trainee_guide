import { readdir } from 'fs/promises'
import { join } from 'path'
import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
