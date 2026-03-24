import { defineConfig } from 'tinacms'

export default defineConfig({
  branch: 'main',
  clientId: null,
  token: null,

  build: {
    outputFolder: 'admin',
    publicFolder: 'public',
  },

  // Cloudinary handles all image uploads
  media: {
    tina: {
      mediaRoot: 'uploads',
      publicFolder: 'public',
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
