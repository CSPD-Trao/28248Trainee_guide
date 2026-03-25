import Link from 'next/link'
import { useState, useCallback, useRef, useEffect } from 'react'
import { signIn } from 'next-auth/react'

export interface School {
  ageId: string
  name: string
}

interface HeaderProps {
  articles?: Array<{ id: string; title: string; description: string; slug: string; sensitive: boolean; schools: string[] }>
  onSearch?: (query: string) => void
  viewMode?: 'queue' | 'grid'
  onViewModeChange?: (mode: 'queue' | 'grid') => void
  schools?: School[]
  selectedSchool?: string
  onSchoolChange?: (ageId: string) => void
  session?: { user?: { email?: string | null } } | null
  onSchoolAdded?: () => void
}

export default function Header({
  articles = [],
  onSearch,
  viewMode = 'queue',
  onViewModeChange,
  schools = [],
  selectedSchool = '',
  onSchoolChange,
  session,
  onSchoolAdded,
}: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; title: string; description: string; slug: string; sensitive: boolean; schools: string[] }>>([])
  const [showSearchResults, setShowSearchResults] = useState(false)

  // School dropdown state
  const [schoolFilter, setSchoolFilter] = useState('')
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)
  const schoolDropdownRef = useRef<HTMLDivElement>(null)

  // Add School modal state
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAgeId, setNewAgeId] = useState('')
  const [newName, setNewName] = useState('')
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)

  // Close school dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (schoolDropdownRef.current && !schoolDropdownRef.current.contains(e.target as Node)) {
        setShowSchoolDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

  const filteredSchools = schools.filter(s =>
    s.name.toLowerCase().includes(schoolFilter.toLowerCase()) ||
    s.ageId.toLowerCase().includes(schoolFilter.toLowerCase())
  )

  const selectedSchoolLabel = selectedSchool
    ? schools.find(s => s.ageId === selectedSchool)?.name ?? selectedSchool
    : 'All Schools'

  async function handleAddSchool(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAddLoading(true)
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageId: newAgeId.trim(), name: newName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setAddError(data.error || 'Failed to add school')
      } else {
        setNewAgeId('')
        setNewName('')
        setShowAddModal(false)
        onSchoolAdded?.()
      }
    } catch {
      setAddError('Network error — please try again')
    } finally {
      setAddLoading(false)
    }
  }

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
          box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 30px rgba(249,115,22,0.05), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .header-logo {
          display: flex; align-items: center; justify-content: center;
          font-size: 2.2rem; line-height: 1; cursor: pointer;
          transition: opacity 0.3s ease; flex-shrink: 0; text-decoration: none;
        }
        .header-logo:hover { opacity: 0.75; }
        .header-right {
          display: flex; align-items: center; gap: 0.75rem;
        }
        .view-toggle-btn {
          background: rgba(249,115,22,0.08); border: 1.5px solid rgba(249,115,22,0.25);
          border-radius: 8px; padding: 0.5rem 0.9rem; cursor: pointer;
          color: #f1f5f9; font-size: 0.85rem; font-weight: 600;
          transition: all 0.3s ease; font-family: system-ui, sans-serif;
          flex-shrink: 0; white-space: nowrap;
        }
        .view-toggle-btn:hover {
          background: rgba(249,115,22,0.2); border-color: #f97316;
          box-shadow: 0 0 12px rgba(249,115,22,0.2);
        }
        /* School dropdown */
        .school-dropdown-wrapper { position: relative; }
        .school-dropdown-btn {
          display: flex; align-items: center; gap: 0.5rem;
          background: rgba(11,15,19,0.7); border: 1.5px solid rgba(63,63,70,0.5);
          border-radius: 8px; padding: 0.5rem 0.9rem; cursor: pointer;
          color: #f1f5f9; font-size: 0.88rem; font-family: system-ui, sans-serif;
          transition: all 0.3s ease; white-space: nowrap; min-width: 140px;
        }
        .school-dropdown-btn:hover, .school-dropdown-btn.open {
          border-color: #f97316; background: rgba(11,15,19,0.9);
          box-shadow: 0 0 12px rgba(249,115,22,0.2);
        }
        .school-dropdown-panel {
          position: absolute; top: calc(100% + 6px); left: 0;
          background: rgba(11,15,19,0.97); border: 1.5px solid #f97316;
          border-radius: 8px; min-width: 240px; z-index: 1200;
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.15);
          overflow: hidden;
        }
        .school-search-input {
          width: 100%; background: rgba(255,255,255,0.05); border: none;
          border-bottom: 1px solid rgba(63,63,70,0.5);
          color: #f1f5f9; padding: 0.7rem 1rem; font-size: 0.88rem;
          outline: none; box-sizing: border-box;
        }
        .school-search-input::placeholder { color: #6b7280; }
        .school-option {
          padding: 0.65rem 1rem; cursor: pointer; font-size: 0.88rem;
          color: #e2e8f0; transition: all 0.15s ease;
          border-left: 3px solid transparent;
          border-bottom: 1px solid rgba(63,63,70,0.2);
        }
        .school-option:last-child { border-bottom: none; }
        .school-option:hover { background: rgba(249,115,22,0.12); border-left-color: #f97316; padding-left: 1.25rem; }
        .school-option.selected { color: #f97316; font-weight: 700; border-left-color: #f97316; }
        .school-option-list { max-height: 260px; overflow-y: auto; }
        .add-school-btn {
          background: rgba(249,115,22,0.1); border: 1.5px solid rgba(249,115,22,0.4);
          border-radius: 8px; padding: 0.5rem 0.9rem; cursor: pointer;
          color: #f97316; font-size: 0.85rem; font-weight: 700;
          transition: all 0.3s ease; white-space: nowrap; font-family: system-ui, sans-serif;
        }
        .add-school-btn:hover {
          background: rgba(249,115,22,0.2); border-color: #f97316;
          box-shadow: 0 0 12px rgba(249,115,22,0.3);
        }
        /* Modal */
        .modal-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.7);
          z-index: 2000; display: flex; align-items: center; justify-content: center;
          backdrop-filter: blur(4px);
        }
        .modal-box {
          background: linear-gradient(135deg, #1a202c, #0f172a);
          border: 1.5px solid #f97316; border-radius: 12px; padding: 2rem;
          width: 100%; max-width: 420px; box-shadow: 0 24px 64px rgba(0,0,0,0.8);
        }
        .modal-title {
          font-size: 1.3rem; font-weight: 900; color: #f1f5f9; margin-bottom: 1.5rem;
          font-family: 'Oswald', system-ui, sans-serif; letter-spacing: 0.04em;
        }
        .modal-input {
          width: 100%; background: rgba(11,15,19,0.8); border: 1.5px solid rgba(63,63,70,0.7);
          border-radius: 8px; padding: 0.7rem 1rem; color: #f1f5f9;
          font-size: 0.95rem; outline: none; box-sizing: border-box;
          margin-bottom: 1rem; transition: border-color 0.2s ease;
        }
        .modal-input:focus { border-color: #f97316; }
        .modal-input::placeholder { color: #6b7280; }
        .modal-error { color: #f87171; font-size: 0.85rem; margin-bottom: 0.75rem; }
        .modal-actions { display: flex; gap: 0.75rem; justify-content: flex-end; margin-top: 0.5rem; }
        .modal-cancel {
          background: transparent; border: 1.5px solid rgba(63,63,70,0.7);
          border-radius: 8px; padding: 0.6rem 1.2rem; cursor: pointer;
          color: #9ca3af; font-size: 0.9rem; transition: all 0.2s ease; font-family: system-ui;
        }
        .modal-cancel:hover { border-color: #f1f5f9; color: #f1f5f9; }
        .modal-submit {
          background: linear-gradient(135deg, #f97316, #f59e0b); border: none;
          border-radius: 8px; padding: 0.6rem 1.4rem; cursor: pointer;
          color: #0B0F13; font-size: 0.9rem; font-weight: 700;
          transition: all 0.2s ease; font-family: system-ui;
        }
        .modal-submit:hover { opacity: 0.9; box-shadow: 0 4px 16px rgba(249,115,22,0.4); }
        .modal-submit:disabled { opacity: 0.5; cursor: not-allowed; }
        /* Search */
        .header-search-wrapper { position: relative; }
        .header-search {
          display: flex; align-items: center; gap: 0.6rem;
          background: rgba(11,15,19,0.7); border: 1.5px solid rgba(63,63,70,0.5);
          border-radius: 8px; padding: 0.5rem 0.9rem; width: 250px;
          transition: all 0.3s ease; box-shadow: inset 0 1px 3px rgba(0,0,0,0.4);
          backdrop-filter: blur(8px);
        }
        .header-search:focus-within {
          background: rgba(11,15,19,0.9); border-color: #f97316;
          box-shadow: 0 0 16px rgba(249,115,22,0.25), inset 0 1px 3px rgba(0,0,0,0.4);
        }
        .header-search input {
          background: none; border: none; color: #f1f5f9;
          font-size: 0.9rem; outline: none; width: 100%;
        }
        .header-search input::placeholder { color: #6b7280; }
        .header-search-icon { color: #6b7280; font-size: 0.95rem; flex-shrink: 0; transition: color 0.3s ease; }
        .header-search:focus-within .header-search-icon { color: #f97316; }
        .search-results {
          position: absolute; top: calc(100% + 6px); right: 0;
          background: rgba(11,15,19,0.97); border: 1.5px solid #f97316;
          border-radius: 8px; max-height: 380px; overflow-y: auto;
          width: 100%; min-width: 250px; z-index: 1100;
          backdrop-filter: blur(16px);
          box-shadow: 0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.15);
        }
        .search-result-item {
          padding: 0.8rem 1rem; border-bottom: 1px solid rgba(63,63,70,0.3);
          cursor: pointer; transition: all 0.2s ease; border-left: 3px solid transparent;
        }
        .search-result-item:hover { background: rgba(249,115,22,0.12); padding-left: 1.25rem; border-left-color: #f97316; }
        .search-result-item:last-child { border-bottom: none; }
        .search-result-title { color: #f1f5f9; font-size: 0.88rem; font-weight: 700; margin-bottom: 0.2rem; }
        .search-result-desc { color: #9ca3af; font-size: 0.78rem; line-height: 1.4; }
        a { text-decoration: none; color: inherit; outline: none; }
        a:focus, a:focus-visible { outline: none; }
      `}</style>

      <div className="header-top">
        <Link href="/">
          <div className="header-logo" title="Home">📖</div>
        </Link>

        <div className="header-right">
          {onViewModeChange && (
            <button className="view-toggle-btn" onClick={() => onViewModeChange(viewMode === 'queue' ? 'grid' : 'queue')}>
              {viewMode === 'queue' ? '📊 Grid' : '📜 Queue'}
            </button>
          )}

          {/* School Dropdown */}
          <div className="school-dropdown-wrapper" ref={schoolDropdownRef}>
            <button
              className={`school-dropdown-btn${showSchoolDropdown ? ' open' : ''}`}
              onClick={() => setShowSchoolDropdown(v => !v)}
            >
              🏫 {selectedSchoolLabel}
              <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.75rem' }}>{showSchoolDropdown ? '▲' : '▼'}</span>
            </button>

            {showSchoolDropdown && (
              <div className="school-dropdown-panel">
                <input
                  className="school-search-input"
                  placeholder="Search schools..."
                  value={schoolFilter}
                  onChange={e => setSchoolFilter(e.target.value)}
                  autoFocus
                />
                <div className="school-option-list">
                  <div
                    className={`school-option${selectedSchool === '' ? ' selected' : ''}`}
                    onClick={() => { onSchoolChange?.(''); setShowSchoolDropdown(false); setSchoolFilter('') }}
                  >
                    All Schools
                  </div>
                  {filteredSchools.length === 0 && (
                    <div style={{ padding: '0.65rem 1rem', color: '#6b7280', fontSize: '0.85rem' }}>No schools found</div>
                  )}
                  {filteredSchools.map(s => (
                    <div
                      key={s.ageId}
                      className={`school-option${selectedSchool === s.ageId ? ' selected' : ''}`}
                      onClick={() => { onSchoolChange?.(s.ageId); setShowSchoolDropdown(false); setSchoolFilter('') }}
                    >
                      {s.name} <span style={{ color: '#6b7280', fontSize: '0.8rem' }}>({s.ageId})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Add School button — only when logged in */}
          {session && (
            <button className="add-school-btn" onClick={() => { setShowAddModal(true); setAddError('') }}>
              + Add School
            </button>
          )}

          {/* Search */}
          <div className="header-search-wrapper">
            <div className="header-search">
              <span className="header-search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search guides..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
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

      {/* Add School Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false) }}>
          <div className="modal-box">
            <div className="modal-title">🏫 Add School</div>
            <form onSubmit={handleAddSchool}>
              <input
                className="modal-input"
                placeholder="AgeID (e.g. 4756)"
                value={newAgeId}
                onChange={e => setNewAgeId(e.target.value)}
                required
                autoFocus
              />
              <input
                className="modal-input"
                placeholder="School name (e.g. Parramatta Catholic College)"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
              {addError && <div className="modal-error">⚠ {addError}</div>}
              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="modal-submit" disabled={addLoading}>
                  {addLoading ? 'Adding...' : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
