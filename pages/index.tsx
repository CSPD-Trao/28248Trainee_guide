import type { NextPage } from 'next'
import Head from 'next/head'

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>My Guides</title>
        <meta name="description" content="Welcome to My Guides" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main style={{ padding: '2rem', minHeight: '100vh' }}>
        <h1>Welcome to My Guides</h1>
        <p>Create and manage your guides using TinaCMS</p>
        
        <nav style={{ marginTop: '2rem' }}>
          <h2>Available Guides:</h2>
          <ul style={{ lineHeight: '2' }}>
            <li>
              <a href="/guides/general_jobs" style={{ color: '#0070f3', textDecoration: 'underline' }}>
                General Jobs
              </a>
            </li>
          </ul>
        </nav>
        
        <footer style={{ marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
          <a href="/admin/index.html" style={{ color: '#0070f3', textDecoration: 'underline' }}>
            Edit or Add Guides
          </a>
        </footer>
      </main>
    </div>
  )
}

export default Home
