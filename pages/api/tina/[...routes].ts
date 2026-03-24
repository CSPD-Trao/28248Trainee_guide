// pages/api/tina/[...routes].ts
import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer'
import { GitHubProvider } from 'tinacms-gitprovider-github'
import { MongodbLevel } from 'mongodb-level'
import { NextApiHandler } from 'next'

// Connects to MongoDB (Step 3)
const databaseAdapter = new MongodbLevel({
  collectionName: 'tinacms',
  dbName: 'tinacms',
  mongoUri: process.env.MONGODB_URI as string,
})

// Connects to GitHub using your token (Step 4)
const gitHubProvider = new GitHubProvider({
  repoOwner: 'CSPD-Trao',
  repoName: '28248Trainee_guide',
  branch: 'main',
  token: process.env.GITHUB_TOKEN as string,
})

const tinaBackend = TinaNodeBackend({
  authProvider: gitHubProvider,
  databaseAdapter,
})

export default tinaBackend as NextApiHandler
