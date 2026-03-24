// tina/config.ts
import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: 'main',
  clientId: null,       // not needed for self-hosted
  token: null,          // not needed for self-hosted

  // ✅ ADD THIS BLOCK (Step 2 - Cloudinary)
  media: {
    loadCustomStore: async () => {
      const pack = await import('next-tinacms-cloudinary')
      return pack.TinaCloudCloudinaryMediaStore
    },
  },

  // your existing schema/collections stay here unchanged
  schema: {
    collections: [
      // ... your existing guide collections
    ],
  },
})
