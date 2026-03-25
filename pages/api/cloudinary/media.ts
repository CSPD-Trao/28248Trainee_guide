import { createMediaHandler } from 'next-tinacms-cloudinary/dist/handlers'
import type { NextApiRequest, NextApiResponse } from 'next'

// bodyParser must be disabled so multer can handle multipart/form-data uploads
export const config = { api: { bodyParser: false } }

export default createMediaHandler(
  {
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
    authorized: async (_req: NextApiRequest, _res: NextApiResponse) => {
      // The editor page is guarded by NextAuth; allow any request here.
      return true
    },
  },
  { useHttps: true }
)
