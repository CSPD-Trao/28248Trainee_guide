import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Header from '@/components/Header'

const ALLOWED_DOMAIN = '@parra.catholic.edu.au'

export default function EditorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const error = router.query.error as string | undefined

  if (status === 'loading') {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0B0F13',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <p style={{ color: '#9ca3af', fontFamily: 'system-ui' }}>Loading...</p>
        </div>
      </>
    )
  }

  if (!session) {
    return (
      <>
        <Header />
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0B0F13',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          paddingTop: '120px',
        }}>
          <style>{`
            .auth-form-container {
              background: linear-gradient(135deg, rgba(26, 32, 44, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%);
              border: 1px solid #3f3f46;
              border-radius: 0.5rem;
              padding: 2.5rem;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
              max-width: 480px;
              width: 100%;
            }
            .google-btn {
              width: 100%;
              padding: 0.875rem 1.5rem;
              border: none;
              border-radius: 0.5rem;
              font-size: 1rem;
              font-weight: 700;
              cursor: pointer;
              transition: all 0.3s ease;
              font-family: 'Bebas Neue', system-ui, sans-serif;
              letter-spacing: 0.05em;
              background: linear-gradient(to right, #f97316, #f59e0b);
              color: #0B0F13;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 0.75rem;
            }
            .google-btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 20px rgba(249, 115, 22, 0.3);
            }
          `}</style>

          <div className="auth-form-container">
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: '#f1f5f9',
              fontFamily: "'Bebas Neue', system-ui, sans-serif",
              letterSpacing: '0.05em',
              textAlign: 'center',
              marginBottom: '0.5rem',
            }}>
              🔐 EDITOR ACCESS
            </h1>
            <p style={{
              fontSize: '1rem',
              marginBottom: '2rem',
              color: '#cbd5e1',
              textAlign: 'center',
              lineHeight: '1.6',
            }}>
              Sign in with your{' '}
              <span style={{ color: '#f97316', fontWeight: 600 }}>{ALLOWED_DOMAIN}</span>{' '}
              Google account to continue
            </p>

            {error === 'AccessDenied' && (
              <div style={{
                color: '#ef4444',
                marginBottom: '1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                textAlign: 'center',
              }}>
                ⚠️ Only {ALLOWED_DOMAIN} accounts are permitted
              </div>
            )}

            <button
              className="google-btn"
              onClick={() => signIn('google', { callbackUrl: '/editor' })}
            >
              <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
                <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
                <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
                <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
                <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
              </svg>
              SIGN IN WITH GOOGLE
            </button>

            <Link href="/" style={{
              display: 'block',
              textAlign: 'center',
              color: '#f97316',
              textDecoration: 'none',
              marginTop: '1.5rem',
              fontSize: '0.95rem',
              fontWeight: 600,
              transition: 'color 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#f59e0b')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#f97316')}
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#0B0F13' }}>
        <div style={{
          background: 'linear-gradient(to right, #f97316, #f59e0b)',
          color: '#0B0F13',
          padding: '1rem 1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 1000,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
        }}>
          <div>
            <h2 style={{
              margin: 0,
              display: 'inline',
              fontFamily: "'Bebas Neue', system-ui, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 900,
              letterSpacing: '0.05em',
            }}>
              TINACMS EDITOR
            </h2>
            <span style={{ marginLeft: '1.5rem', fontSize: '0.95rem', opacity: 0.8, fontWeight: 600 }}>
              {session.user?.email}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href="/" style={{
              backgroundColor: 'rgba(0, 0, 0, 0.2)',
              color: '#0B0F13',
              padding: '0.6rem 1.2rem',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              border: '1px solid rgba(0, 0, 0, 0.3)',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)')}
            >
              ← EXIT EDITOR
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: '/editor' })}
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: '#0B0F13',
                border: '1px solid rgba(0, 0, 0, 0.3)',
                padding: '0.6rem 1.2rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.4)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.2)')}
            >
              LOGOUT
            </button>
          </div>
        </div>
        <iframe
          src="/admin/index.html"
          style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
          title="TinaCMS Admin"
        />
      </div>
    </>
  )
}
