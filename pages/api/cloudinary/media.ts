import { createMediaHandler, mediaHandlerConfig } from 'next-tinacms-cloudinary/dist/handlers'
import type { NextApiRequest, NextApiResponse } from 'next'

export const config = mediaHandlerConfig

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
