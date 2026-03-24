import { v2 as cloudinary } from 'cloudinary'
import { NextApiHandler } from 'next'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const handler: NextApiHandler = async (req, res) => {
  if (req.method === 'POST') {
    try {
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
    } catch (error: any) {
      return res.status(500).json({ error: error.message })
    }
  }

  res.setHeader('Allow', ['POST'])
  res.status(405).end(`Method ${req.method} Not Allowed`)
}

export default handler
