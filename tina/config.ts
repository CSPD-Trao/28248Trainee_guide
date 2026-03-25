import { defineConfig, LocalAuthProvider } from 'tinacms'

export default defineConfig({
  branch: process.env.GITHUB_BRANCH || 'main',
  clientId: null,
  token: null,

  authProvider: new LocalAuthProvider(),

  contentApiUrlOverride: '/api/tina/gql',

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  // Use Cloudinary for media storage via next-tinacms-cloudinary
  media: {
    loadCustomStore: async () => {
      const { CloudinaryMediaStore } = await import('next-tinacms-cloudinary')
      return CloudinaryMediaStore
    },
  },

  schema: {
    collections: [
      {
        name: 'guide',
        label: 'Guides',
        path: 'content/guides',
        fields: [
          {
            type: 'string',
            name: 'title',
            label: 'Title',
          },
          {
            type: 'rich-text',
            name: 'body',
            label: 'Body',
            isBody: true,
          },
        ],
      },
    ],
  },
})
