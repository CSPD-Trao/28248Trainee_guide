import { NextApiHandler } from 'next'

// In local dev (no MONGODB_URI), proxy directly to the tinacms dev server
// started by `tinacms dev` on port 4001. In production, use the full
// self-hosted backend with MongoDB + GitHub.
const LOCAL_TINA_GQL = 'http://localhost:4001/graphql'

let tinaBackend: NextApiHandler | null = null

async function getBackend(): Promise<NextApiHandler | null> {
  if (!process.env.MONGODB_URI) return null

  if (!tinaBackend) {
    const { TinaNodeBackend, LocalBackendAuthProvider, createDatabase } = await import('@tinacms/datalayer')
    const { MongodbLevel } = await import('mongodb-level')
    const { GitHubProvider } = await import('tinacms-gitprovider-github')

    const gitProvider = new GitHubProvider({
      owner: process.env.GITHUB_OWNER || 'CSPD-Trao',
      repo: process.env.GITHUB_REPO || '28248Trainee_guide',
      branch: process.env.GITHUB_BRANCH || 'main',
      token: process.env.GITHUB_TOKEN as string,
    })

    const databaseClient = createDatabase({
      gitProvider,
      databaseAdapter: new MongodbLevel({
        collectionName: 'tinacms',
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI,
      }),
    })

    tinaBackend = TinaNodeBackend({
      authProvider: LocalBackendAuthProvider(),
      databaseClient,
    })
  }

  return tinaBackend
}

const handler: NextApiHandler = async (req, res) => {
  const backend = await getBackend()

  if (!backend) {
    // Local dev mode: proxy to the tinacms dev server (port 4001)
    const method = req.method ?? 'POST'
    const upstream = await fetch(LOCAL_TINA_GQL, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'GET' ? undefined : JSON.stringify(req.body),
    })
    const text = await upstream.text()
    res.setHeader('Content-Type', 'application/json')
    res.status(upstream.status).send(text)
    return
  }

  return backend(req, res)
}

export default handler
