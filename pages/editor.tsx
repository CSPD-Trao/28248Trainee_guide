import { useEffect, useState } from 'react'

const ALLOWED_DOMAIN = '@parra.catholic.edu.au'

type AuthStep = 'email' | 'code' | 'authorized'

export default function AdminWrapper() {
  const [authStep, setAuthStep] = useState<AuthStep>('email')
  const [userEmail, setUserEmail] = useState<string>('')
  const [emailInput, setEmailInput] = useState<string>('')
  const [codeInput, setCodeInput] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setUserEmail(data.email)
        setAuthStep('authorized')
      }
    } catch {
      setAuthStep('email')
    }
  }

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!emailInput.trim()) {
      setError('Please enter your email')
      setLoading(false)
      return
    }

    const normalizedEmail = emailInput.toLowerCase().trim()

    if (!normalizedEmail.endsWith(ALLOWED_DOMAIN)) {
      setError(`Only ${ALLOWED_DOMAIN} emails are allowed`)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send code')
        setLoading(false)
        return
      }

      setUserEmail(normalizedEmail)
      setAuthStep('code')
      setEmailInput('')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!codeInput.trim()) {
      setError('Please enter the verification code')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: userEmail, code: codeInput.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid code')
        setLoading(false)
        return
      }

      setAuthStep('authorized')
      setCodeInput('')
    } catch (err) {
      setError('Network error. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setAuthStep('email')
      setUserEmail('')
      setCodeInput('')
      setEmailInput('')
      setLoading(false)
    }
  }

  if (authStep === 'email') {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '4rem auto',
      }}>
        <h1>🔐 Editor Access</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '2rem', color: '#666' }}>
          Enter your <strong>{ALLOWED_DOMAIN}</strong> email to get a verification code
        </p>

        <form onSubmit={handleEmailSubmit} style={{
          backgroundColor: '#f9f9f9',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="email"
              placeholder="your-email@parra.catholic.edu.au"
              value={emailInput}
              onChange={(e) => { setEmailInput(e.target.value); setError('') }}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '1rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1,
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 'bold' }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: loading ? '#ccc' : '#0070f3',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              width: '100%',
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Sending...' : 'Send Verification Code'}
          </button>

          <a href="/" style={{ display: 'block', color: '#0070f3', textDecoration: 'none', marginTop: '1rem' }}>
            ← Back to Home
          </a>
        </form>
      </div>
    )
  }

  if (authStep === 'code') {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '4rem auto',
      }}>
        <h1>✉️ Verify Your Email</h1>
        <p style={{ fontSize: '1.1rem', marginBottom: '1rem', color: '#666' }}>
          We sent a code to <strong>{userEmail}</strong>
        </p>
        <p style={{ fontSize: '0.95rem', marginBottom: '2rem', color: '#999' }}>
          Check your email and enter the code below
        </p>

        <form onSubmit={handleCodeSubmit} style={{
          backgroundColor: '#f9f9f9',
          padding: '2rem',
          borderRadius: '8px',
          border: '1px solid #ddd',
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="000000"
              value={codeInput}
              onChange={(e) => { setCodeInput(e.target.value.replace(/\D/g, '')); setError('') }}
              maxLength={6}
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontSize: '2rem',
                textAlign: 'center',
                letterSpacing: '0.5rem',
                border: '2px solid #ddd',
                borderRadius: '4px',
                boxSizing: 'border-box',
                opacity: loading ? 0.6 : 1,
                fontFamily: 'monospace',
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#ff4444', marginBottom: '1rem', fontSize: '0.95rem', fontWeight: 'bold' }}>
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || codeInput.length !== 6}
            style={{
              backgroundColor: (loading || codeInput.length !== 6) ? '#ccc' : '#0070f3',
              color: 'white',
              padding: '0.75rem 2rem',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: (loading || codeInput.length !== 6) ? 'not-allowed' : 'pointer',
              width: '100%',
              marginBottom: '1rem',
            }}
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </button>

          <button
            type="button"
            onClick={() => { setAuthStep('email'); setUserEmail(''); setCodeInput(''); setError('') }}
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              color: '#0070f3',
              padding: '0.5rem 1rem',
              border: '1px solid #0070f3',
              borderRadius: '4px',
              fontSize: '0.9rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Use Different Email
          </button>
        </form>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{
        backgroundColor: '#0070f3',
        color: 'white',
        padding: '0.75rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1000,
      }}>
        <div>
          <h2 style={{ margin: 0, display: 'inline' }}>TinaCMS Editor</h2>
          <span style={{ marginLeft: '1rem', fontSize: '0.9rem', opacity: 0.9 }}>{userEmail}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handleLogout}
            disabled={loading}
            style={{
              backgroundColor: '#ff9900',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            Logout
          </button>
          <a
            href="/"
            style={{
              backgroundColor: '#ff4444',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Exit Editor
          </a>
        </div>
      </div>
      <iframe
        src="/admin/index.html"
        style={{ flex: 1, border: 'none', width: '100%', height: '100%' }}
        title="TinaCMS Admin"
      />
    </div>
  )
}