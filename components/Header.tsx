import Link from 'next/link'
import { useState, useCallback } from 'react'

interface HeaderProps {
  articles?: Array<{ id: string; title: string; description: string; slug: string }>
  onSearch?: (query: string) => void
  viewMode?: 'queue' | 'grid'
  onViewModeChange?: (mode: 'queue' | 'grid') => void
}

export default function Header({ articles = [], onSearch, viewMode = 'queue', onViewModeChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; description: string; slug: string }>>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [buttonHovered, setButtonHovered] = useState(false)

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
    onSearch?.(query)
  }, [articles, onSearch])

  return (
    <>
      <style>{`
        .header-top {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(11, 15, 19, 0.98));
          border-bottom: 1.5px solid rgba(249, 115, 22, 0.2);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          z-index: 1000;
          backdrop-filter: blur(12px);
          box-shadow:
            0 8px 24px rgba(0, 0, 0, 0.4),
            0 0 30px rgba(249, 115, 22, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .header-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          line-height: 1;
          cursor: pointer;
          transition: opacity 0.3s ease;
          flex-shrink: 0;
          text-decoration: none;
        }

        .header-logo:hover {
          opacity: 0.75;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .view-toggle-btn {
          background: rgba(249, 115, 22, 0.08);
          border: 1.5px solid rgba(249, 115, 22, 0.25);
          border-radius: 8px;
          padding: 0.5rem 0.9rem;
          cursor: pointer;
          color: #f1f5f9;
          font-size: 0.85rem;
          font-weight: 600;
          transition: all 0.3s ease;
          font-family: system-ui, sans-serif;
          flex-shrink: 0;
          white-space: nowrap;
        }

        .view-toggle-btn:hover {
          background: rgba(249, 115, 22, 0.2);
          border-color: #f97316;
          box-shadow: 0 0 12px rgba(249, 115, 22, 0.2);
        }

        .header-search-wrapper {
          position: relative;
        }

        .header-search {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          background: rgba(11, 15, 19, 0.7);
          border: 1.5px solid rgba(63, 63, 70, 0.5);
          border-radius: 8px;
          padding: 0.5rem 0.9rem;
          width: 280px;
          transition: all 0.3s ease;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
        }

        .header-search:focus-within {
          background: rgba(11, 15, 19, 0.9);
          border-color: #f97316;
          box-shadow: 0 0 16px rgba(249, 115, 22, 0.25), inset 0 1px 3px rgba(0, 0, 0, 0.4);
        }

        .header-search input {
          background: none;
          border: none;
          color: #f1f5f9;
          font-size: 0.9rem;
          outline: none;
          width: 100%;
        }

        .header-search input::placeholder {
          color: #6b7280;
        }

        .header-search-icon {
          color: #6b7280;
          font-size: 0.95rem;
          flex-shrink: 0;
          transition: color 0.3s ease;
        }

        .header-search:focus-within .header-search-icon {
          color: #f97316;
        }

        .search-results {
          position: absolute;
          top: calc(100% + 6px);
          right: 0;
          background: rgba(11, 15, 19, 0.97);
          border: 1.5px solid #f97316;
          border-radius: 8px;
          max-height: 380px;
          overflow-y: auto;
          width: 100%;
          min-width: 280px;
          z-index: 1100;
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(249, 115, 22, 0.15);
        }

        .search-result-item {
          padding: 0.8rem 1rem;
          border-bottom: 1px solid rgba(63, 63, 70, 0.3);
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;
        }

        .search-result-item:hover {
          background: rgba(249, 115, 22, 0.12);
          padding-left: 1.25rem;
          border-left-color: #f97316;
        }

        .search-result-item:last-child {
          border-bottom: none;
        }

        .search-result-title {
          color: #f1f5f9;
          font-size: 0.88rem;
          font-weight: 700;
          margin-bottom: 0.2rem;
        }

        .search-result-desc {
          color: #9ca3af;
          font-size: 0.78rem;
          line-height: 1.4;
        }

        a {
          text-decoration: none;
          color: inherit;
          outline: none;
        }

        a:focus,
        a:focus-visible {
          outline: none;
        }
      `}</style>

      <div className="header-top">
        <Link href="/">
          <div className="header-logo" title="Home">
            📖
          </div>
        </Link>

        <div className="header-right">
          {onViewModeChange && (
            <button
              className="view-toggle-btn"
              onClick={() => onViewModeChange(viewMode === 'queue' ? 'grid' : 'queue')}
            >
              {viewMode === 'queue' ? '📊 Grid' : '📜 Queue'}
            </button>
          )}

          <div className="header-search-wrapper">
            <div className="header-search">
              <span className="header-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {showSearchResults && searchResults.length > 0 && (
              <div className="search-results">
                {searchResults.map(result => (
                  <Link key={result.id} href={`/guides/${result.slug}`}>
                    <div className="search-result-item" onClick={() => setShowSearchResults(false)}>
                      <div className="search-result-title">{result.title}</div>
                      <div className="search-result-desc">{result.description}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
