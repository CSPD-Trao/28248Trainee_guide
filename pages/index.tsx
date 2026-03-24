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

      <header style={{ 
        backgroundColor: '#0070f3', 
        color: 'white', 
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>My Guides</h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Home
          </a>
          <a href="/editor" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>
            Editor
          </a>
        </nav>
      </header>

      <main style={{ padding: '2rem', minHeight: 'calc(100vh - 80px)' }}>
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
      </main>
    </div>
  )
}

export default Home
