import Link from 'next/link'
import { useState, useEffect } from 'react'

const guideMetadata: Record<string, { title: string; description: string }> = {
  'general_jobs': {
    title: 'General Jobs',
    description: 'Information about common roles and responsibilities',
  },
  'training_resources': {
    title: 'Training Resources',
    description: 'Comprehensive training materials and documentation',
  },
  'best_practices': {
    title: 'Best Practices',
    description: 'Guidelines and best practices for success',
  },
  'onboarding': {
    title: 'Onboarding',
    description: 'Get started with your new role',
  },
}

export default function Home() {
  const [articles, setArticles] = useState<Array<{ id: string; title: string; description: string; slug: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchGuides = async () => {
      try {
        const response = await fetch('/api/guides')
        const data = await response.json()
        
        const loadedArticles = data.guides.map((slug: string) => ({
          id: slug,
          slug: slug,
          title: guideMetadata[slug]?.title || slug.replace(/_/g, ' '),
          description: guideMetadata[slug]?.description || 'Learn more about this topic',
        }))
        
        setArticles(loadedArticles)
      } catch (error) {
        console.error('Failed to fetch guides:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGuides()
  }, [])

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0B0F13',
      color: '#e2e8f0',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      padding: '2rem',
    }}>
      <style>{`
        * {
          margin: 0;
          padding: 0;
        }
        
        @keyframes scrollLeft {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-100%);
          }
        }
        
        @keyframes scrollRight {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .marquee__content {
          display: flex;
          gap: 1rem;
          list-style: none;
          flex-shrink: 0;
        }
        
        .marquee__content-left {
          animation: scrollLeft 480s linear infinite;
        }
        
        .marquee__content-right {
          animation: scrollRight 240s linear infinite;
        }
        
        .marquee {
          display: flex;
          overflow: hidden;
          width: 100%;
        }
        
        a {
          text-decoration: none;
          color: inherit;
        }
      `}</style>

      {/* Header */}
      <div style={{
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '600',
          color: '#f1f5f9',
        }}>
          Trainee Guide
        </h1>
      </div>

      {/* Three Marquee Lines */}
      {!loading && articles.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#0B0F13',
          borderTop: '1px solid #2d3748',
          padding: '1rem 0',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {/* Top line - scrolling right (faster) */}
          <div className="marquee">
            <ul className="marquee__content marquee__content-right">
              {[...Array(Math.ceil(12 / articles.length))].flatMap(() => 
                articles.map((article) => (
                  <li key={`top-${article.id}`} style={{ margin: '0.5rem' }}>
                    <div
                      style={{
                        background: '#1a1f2e',
                        border: '1px solid #2d3748',
                        borderRadius: '6px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '160px',
                        minHeight: '70px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7C3AED'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2d3748'
                      }}
                    />
                  </li>
                ))
              )}
            </ul>
            <ul className="marquee__content marquee__content-right" aria-hidden="true">
              {[...Array(Math.ceil(12 / articles.length))].flatMap(() => 
                articles.map((article) => (
                  <li key={`top-dup-${article.id}`} style={{ margin: '0.5rem' }}>
                    <div
                      style={{
                        background: '#1a1f2e',
                        border: '1px solid #2d3748',
                        borderRadius: '6px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '160px',
                        minHeight: '70px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7C3AED'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2d3748'
                      }}
                    />
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Middle line - scrolling left (slower) */}
          <div className="marquee">
            <ul className="marquee__content marquee__content-left">
              {[...Array(Math.ceil(12 / articles.length))].flatMap(() => 
                articles.map((article) => (
                  <li key={`mid-${article.id}`} style={{ margin: '0.5rem' }}>
                    <Link href={`/guides/${article.slug}`}>
                      <div
                        style={{
                          background: '#1a1f2e',
                          border: '1px solid #2d3748',
                          borderRadius: '6px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: '160px',
                          minHeight: '70px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#7C3AED'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2d3748'
                        }}
                      >
                        <h3 style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          marginBottom: '0.3rem',
                          color: '#e2e8f0',
                          lineHeight: '1.2',
                        }}>
                          {article.title}
                        </h3>
                        <p style={{
                          fontSize: '0.7rem',
                          color: '#a0aec0',
                          lineHeight: '1.2',
                          margin: 0,
                        }}>
                          {article.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
            <ul className="marquee__content marquee__content-left" aria-hidden="true">
              {[...Array(Math.ceil(12 / articles.length))].flatMap(() => 
                articles.map((article) => (
                  <li key={`mid-dup-${article.id}`} style={{ margin: '0.5rem' }}>
                    <Link href={`/guides/${article.slug}`}>
                      <div
                        style={{
                          background: '#1a1f2e',
                          border: '1px solid #2d3748',
                          borderRadius: '6px',
                          padding: '1rem',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: '160px',
                          minHeight: '70px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#7C3AED'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2d3748'
                        }}
                      >
                        <h3 style={{
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          marginBottom: '0.3rem',
                          color: '#e2e8f0',
                          lineHeight: '1.2',
                        }}>
                          {article.title}
                        </h3>
                        <p style={{
                          fontSize: '0.7rem',
                          color: '#a0aec0',
                          lineHeight: '1.2',
                          margin: 0,
                        }}>
                          {article.description}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Bottom line - scrolling right (faster) */}
          <div className="marquee">
            <ul className="marquee__content marquee__content-right">
              {[...Array(Math.ceil(12 / articles.length))].flatMap(() => 
                articles.map((article) => (
                  <li key={`bot-${article.id}`} style={{ margin: '0.5rem' }}>
                    <div
                      style={{
                        background: '#1a1f2e',
                        border: '1px solid #2d3748',
                        borderRadius: '6px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '160px',
                        minHeight: '70px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7C3AED'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2d3748'
                      }}
                    />
                  </li>
                ))
              )}
            </ul>
            <ul className="marquee__content marquee__content-right" aria-hidden="true">
              {[...Array(Math.ceil(12 / articles.length))].flatMap(() => 
                articles.map((article) => (
                  <li key={`bot-dup-${article.id}`} style={{ margin: '0.5rem' }}>
                    <div
                      style={{
                        background: '#1a1f2e',
                        border: '1px solid #2d3748',
                        borderRadius: '6px',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        minWidth: '160px',
                        minHeight: '70px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7C3AED'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2d3748'
                      }}
                    />
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}