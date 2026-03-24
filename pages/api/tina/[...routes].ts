import { TinaNodeBackend, LocalBackendAuthProvider } from '@tinacms/datalayer'
import { GitHubProvider } from 'tinacms-gitprovider-github'
import { MongodbLevel } from 'mongodb-level'
import { NextApiHandler } from 'next'

// Step 1 — Connect to MongoDB
// This is where TinaCMS stores its index of all your guides
const databaseAdapter = new MongodbLevel({
  collectionName: 'tinacms',
  dbName: 'tinacms',
  mongoUri: process.env.MONGODB_URI as string,
})

// Step 2 — Connect to GitHub
// This is how TinaCMS saves your .md guide files
const gitHubProvider = new GitHubProvider({
  owner: 'CSPD-Trao',
  repo: '28248Trainee_guide',
  branch: 'main',
  token: process.env.GITHUB_TOKEN as string,
})

// Step 3 — Wire everything together
const tinaBackend = TinaNodeBackend({
  authProvider: LocalBackendAuthProvider(),
  databaseClient: databaseAdapter,
})

// Export the backend
const handler: NextApiHandler = async (req, res) => {
  return tinaBackend(req, res)
}

export default handler
