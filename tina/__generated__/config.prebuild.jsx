// tina/config.ts
import { defineConfig, LocalAuthProvider } from "tinacms";
var config_default = defineConfig({
  branch: process.env.GITHUB_BRANCH || "main",
  clientId: null,
  token: null,
  authProvider: new LocalAuthProvider(),
  contentApiUrlOverride: "/api/tina/gql",
  build: {
    outputFolder: "admin",
    publicFolder: "public"
  },
  // Use Cloudinary for media storage via next-tinacms-cloudinary
  media: {
    loadCustomStore: async () => {
      const { CloudinaryMediaStore } = await import("next-tinacms-cloudinary");
      return CloudinaryMediaStore;
    }
  },
  schema: {
    collections: [
      {
        name: "guide",
        label: "Guides",
        path: "content/guides",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title"
          },
          {
            type: "string",
            name: "description",
            label: "Description"
          },
          {
            type: "boolean",
            name: "sensitive",
            label: "Sensitive (requires login to view)"
          },
          {
            type: "string",
            name: "schools",
            label: "Applicable Schools (AgeIDs \u2014 leave empty = all schools)",
            list: true
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
