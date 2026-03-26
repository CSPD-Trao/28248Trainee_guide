import path from 'path'
import Link from 'next/link'
import { marked } from 'marked'
import { signIn } from 'next-auth/react'
import Header from '@/components/Header'

export default function GuidePage({ guide }: any) {
  // Client-side: handle gated content (should already be server-side gated, but extra safety)
  if (guide?.gated) {
    return (
      <div style={{ backgroundColor: '#0B0F13', minHeight: '100vh', color: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1.5rem', fontFamily: 'system-ui' }}>
        <Header />
        <div style={{ paddingTop: '70px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔒</div>
          <h1 style={{ fontFamily: "'Bebas Neue', system-ui", fontSize: '2rem', marginBottom: '0.5rem' }}>Sensitive Guide</h1>
          <p style={{ color: '#9ca3af', marginBottom: '2rem', maxWidth: '400px' }}>
            This guide is restricted. Please log in with your school account to access it.
          </p>
          <button
            onClick={() => signIn('google')}
            style={{
              background: 'linear-gradient(135deg, #f97316, #f59e0b)', border: 'none',
              borderRadius: '8px', padding: '0.75rem 2rem', cursor: 'pointer',
              color: '#0B0F13', fontWeight: 700, fontSize: '1rem',
            }}
          >
            Sign in to view
          </button>
          <div style={{ marginTop: '1.5rem' }}>
            <Link href="/" style={{ color: '#f97316', fontSize: '0.9rem' }}>← Back to Guides</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      backgroundColor: '#0B0F13',
      minHeight: '100vh',
      color: '#f1f5f9',
    }}>
      <style>{`
        .guide-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .guide-content h1,
        .guide-content h2,
        .guide-content h3 {
          font-family: 'Bebas Neue', system-ui, sans-serif;
          margin-top: 2rem;
          margin-bottom: 1rem;
          letter-spacing: 0.05em;
        }
        
        .guide-content h1 {
          font-size: 2.5rem;
          color: #f1f5f9;
          font-weight: 900;
        }
        
        .guide-content h2 {
          font-size: 1.875rem;
          color: #e2e8f0;
          font-weight: 900;
          border-bottom: 2px solid #3f3f46;
          padding-bottom: 0.5rem;
        }
        
        .guide-content h3 {
          font-size: 1.25rem;
          color: #cbd5e1;
          font-weight: 700;
        }
        
        .guide-content p {
          color: #cbd5e1;
          line-height: 1.8;
          margin-bottom: 1rem;
          font-size: 1rem;
        }
        
        .guide-content code {
          background-color: rgba(0, 0, 0, 0.5);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: 'Courier New', monospace;
          color: #84cc16;
          font-size: 0.9em;
        }
        
        .guide-content pre {
          background-color: rgba(0, 0, 0, 0.5);
          border-left: 4px solid #f97316;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-family: 'Courier New', monospace;
        }
        
        .guide-content pre code {
          background: none;
          padding: 0;
          color: #a0aec0;
        }
        
        .guide-content ul,
        .guide-content ol {
          margin-left: 2rem;
          margin-bottom: 1rem;
        }
        
        .guide-content li {
          margin-bottom: 0.5rem;
          color: #cbd5e1;
          line-height: 1.6;
        }
        
        .guide-content a {
          color: #f97316;
          text-decoration: none;
          border-bottom: 1px solid #f97316;
          transition: all 0.3s ease;
        }
        
        .guide-content a:hover {
          color: #f59e0b;
          border-bottom-color: #f59e0b;
        }
        
        .guide-content blockquote {
          border-left: 4px solid #8b5cf6;
          padding-left: 1rem;
          margin-left: 0;
          color: #a0aec0;
          font-style: italic;
          margin-bottom: 1rem;
        }
        
        .guide-content table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
          border: 1px solid #3f3f46;
        }
        
        .guide-content th,
        .guide-content td {
          border: 1px solid #3f3f46;
          padding: 0.75rem;
          text-align: left;
        }
        
        .guide-content th {
          background-color: rgba(249, 115, 22, 0.1);
          font-weight: 700;
          color: #f1f5f9;
        }
        
        .guide-content td {
          color: #cbd5e1;
        }

        .guide-content hr {
          border: none;
          border-top: 2px solid #3f3f46;
          margin: 2rem 0;
        }

        .guide-content strong {
          color: #f1f5f9;
          font-weight: 700;
        }

        .guide-content em {
          color: #e2e8f0;
          font-style: italic;
        }

        .guide-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1rem 0;
          border: 1px solid #3f3f46;
        }
      `}</style>

      <Header />

      {/* Main Content */}
      <div className="guide-content" style={{ paddingTop: '70px' }}>
        <Link href="/" style={{
          color: '#f97316',
          textDecoration: 'none',
          marginBottom: '2rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          transition: 'gap 0.3s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => e.currentTarget.style.gap = '0.75rem'}
        onMouseLeave={(e) => e.currentTarget.style.gap = '0.5rem'}
        >
          ← Back to Guides
        </Link>

        <article style={{
          backgroundColor: 'rgba(26, 32, 44, 0.5)',
          border: '1px solid #3f3f46',
          borderRadius: '0.5rem',
          padding: '2rem',
          marginTop: '2rem',
        }}>
          <h1>{guide.title}</h1>
          
          {/* Markdown Content */}
          <div
            style={{
              color: '#cbd5e1',
              lineHeight: '1.8',
            }}
            dangerouslySetInnerHTML={{ __html: guide.body }}
          />
        </article>

        {/* Back Button */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '2rem',
          borderTop: '1px solid #3f3f46',
        }}>
          <Link href="/" style={{
            display: 'inline-block',
            backgroundColor: 'rgba(249, 115, 22, 0.1)',
            border: '1px solid #f97316',
            color: '#f97316',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            textDecoration: 'none',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f97316'
            e.currentTarget.style.color = '#0B0F13'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(249, 115, 22, 0.1)'
            e.currentTarget.style.color = '#f97316'
          }}
          >
            ← Back to All Guides
          </Link>
        </div>
      </div>

      {/* Floating Edit Button */}
      <Link href="/editor" style={{ textDecoration: 'none' }}>
        <div
          style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f97316, #f59e0b)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.4)',
            transition: 'all 0.3s ease',
            zIndex: 999,
          }}
          title={`Edit: ${guide.title}`}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)'
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(249, 115, 22, 0.6)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(249, 115, 22, 0.4)'
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0B0F13"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </div>
      </Link>
    </div>
  )
}

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'CSPD-Trao'
const GITHUB_REPO = process.env.GITHUB_REPO || '28248Trainee_guide'
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main'

async function fetchGuideFromGitHub(slugPath: string): Promise<string | null> {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/content/guides/${slugPath}.md`
  const headers: Record<string, string> = { 'Cache-Control': 'no-cache' }
  if (process.env.GITHUB_TOKEN) headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`
  const res = await fetch(url, { headers })
  if (!res.ok) return null
  return res.text()
}

export async function getServerSideProps({ params, req, res }: any) {
  const fs = require('fs')
  const matter = require('gray-matter')
  const { getServerSession } = require('next-auth/next')
  const { authOptions } = require('../api/auth/[...nextauth]')
  const readFile = fs.promises.readFile

  // params.slug is an array for [...slug] catch-all routes e.g. ['ola','daily']
  const slugParts: string[] = Array.isArray(params.slug) ? params.slug : [params.slug]
  const slugPath = slugParts.join('/')

  try {
    let raw: string | null = null

    // In production read from GitHub so TinaCMS saves appear without redeploying
    if (process.env.GITHUB_TOKEN || process.env.NODE_ENV === 'production') {
      raw = await fetchGuideFromGitHub(slugPath)
    }
    // Fallback to local filesystem (local dev)
    if (raw === null) {
      try {
        const filePath = path.join(process.cwd(), 'content/guides', `${slugPath}.md`)
        raw = await readFile(filePath, 'utf-8')
      } catch (_) {
        return { notFound: true }
      }
    }
    if (raw === null) return { notFound: true }

    // Parse YAML frontmatter with gray-matter
    const { data: frontmatter, content: mdBody } = matter(raw)

    // If sensitive, check for a valid session
    if (frontmatter.sensitive === true) {
      const session = await getServerSession(req, res, authOptions)
      if (!session) {
        return { props: { guide: { gated: true, slug: slugPath } } }
      }
    }

    // Strip the leading H1 title (we render it separately)
    const lines = mdBody.split('\n')
    const firstHeadingIdx = lines.findIndex((l: string) => /^#\s/.test(l))
    const bodyMd = firstHeadingIdx >= 0
      ? [...lines.slice(0, firstHeadingIdx), ...lines.slice(firstHeadingIdx + 1)].join('\n')
      : mdBody
    const bodyHtml = await marked.parse(bodyMd)

    // Title: prefer frontmatter, then first H1, then slug
    const lastSegment = slugParts[slugParts.length - 1]
    let title = lastSegment.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
    if (frontmatter.title) {
      title = frontmatter.title
    } else if (firstHeadingIdx >= 0) {
      title = lines[firstHeadingIdx].replace(/^#+\s*/, '')
    }

    return {
      props: {
        guide: {
          title,
          body: bodyHtml,
          slug: slugPath,
          sensitive: frontmatter.sensitive ?? false,
          schools: frontmatter.schools ?? [],
          gated: false,
        }
      }
    }
  } catch (error) {
    return { notFound: true }
  }
}
