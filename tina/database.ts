// Used by the TinaCMS CLI (`tinacms dev` and `tinacms build`) to:
//   - index content from the repository into the data layer at build time
//   - serve the GraphQL API during local development
//
// In production (MONGODB_URI set): uses MongoDB Atlas + GitHub for persistence.
// In local dev (no MONGODB_URI): uses the built-in local Level DB (port 9000).
import { createDatabase, createLocalDatabase } from '@tinacms/datalayer'
import { MongodbLevel } from 'mongodb-level'
import { GitHubProvider } from 'tinacms-gitprovider-github'

export default process.env.MONGODB_URI
  ? createDatabase({
      gitProvider: new GitHubProvider({
        owner: process.env.GITHUB_OWNER || 'CSPD-Trao',
        repo: process.env.GITHUB_REPO || '28248Trainee_guide',
        branch: process.env.GITHUB_BRANCH || 'main',
        token: process.env.GITHUB_TOKEN as string,
      }),
      databaseAdapter: new MongodbLevel({
        collectionName: 'tinacms',
        dbName: 'tinacms',
        mongoUri: process.env.MONGODB_URI,
      }),
    })
  : createLocalDatabase()
