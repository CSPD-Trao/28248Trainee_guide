import { v2 as cloudinary } from 'cloudinary'
import { NextApiHandler } from 'next'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const handler: NextApiHandler = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  try {
    if (req.method === 'GET') {
      const limit = Number(req.query.limit) || 36
      
      try {
        const result = await cloudinary.api.resources({
          max_results: limit,
          type: 'upload',
        })

        const media = result.resources.map((asset: any) => ({
          directory: 'uploads',
          file: {
            url: asset.secure_url,
            id: asset.public_id,
            size: asset.bytes,
            type: asset.type,
            name: asset.public_id.split('/').pop(),
            createdAt: asset.created_at,
          },
        }))

        return res.status(200).json(media)
      } catch (error: any) {
        console.error('Cloudinary API error:', error)
        return res.status(200).json([])
      }
    }

    if (req.method === 'POST') {
      const { file } = req.body

      if (!file) {
        return res.status(400).json({ error: 'No file provided' })
      }

      const result = await cloudinary.uploader.upload(file, {
        folder: 'tinacms-guides',
      })

      return res.status(200).json({
        url: result.secure_url,
        id: result.public_id,
      })
    }

    if (req.method === 'DELETE') {
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ error: 'No id provided' })
      }

      await cloudinary.uploader.destroy(id)
      return res.status(200).json({ success: true })
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  } catch (error: any) {
    console.error('API error:', error)
    return res.status(500).json({ error: error.message || 'Server error' })
  }
}

export default handler
