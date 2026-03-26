import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useSession, signIn } from 'next-auth/react'
import type { School } from '@/components/Header'
import AuditLog from '@/components/AuditLog'

interface Article {
  id: string
  title: string
  description: string
  slug: string
  sensitive: boolean
  schools: string[]
}

interface CardState {
  article: Article | null
}

// ── Inline School Dropdown ────────────────────────────────────────────────────
function SchoolDropdown({ schools, selectedSchool, onSchoolChange, session, onSchoolAdded }: {
  schools: School[]
  selectedSchool: string
  onSchoolChange: (id: string) => void
  session: { user?: { email?: string | null } } | null | undefined
  onSchoolAdded: () => void
}) {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [ageId, setAgeId] = useState('')
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const filtered = schools.filter(s =>
    s.name.toLowerCase().includes(filter.toLowerCase()) ||
    s.ageId.toLowerCase().includes(filter.toLowerCase())
  )
  const label = selectedSchool ? (schools.find(s => s.ageId === selectedSchool)?.name ?? selectedSchool) : 'All Schools'

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setSaving(true)
    try {
      const res = await fetch('/api/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageId: ageId.trim(), name: name.trim() }),
      })
      const d = await res.json()
      if (!res.ok) { setErr(d.error || 'Failed') }
      else { setAgeId(''); setName(''); setShowModal(false); onSchoolAdded() }
    } catch { setErr('Network error') }
    finally { setSaving(false) }
  }

  return (
    <>
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: open ? 'rgba(11,15,19,0.9)' : 'rgba(11,15,19,0.7)',
            border: `1.5px solid ${open ? '#f97316' : 'rgba(63,63,70,0.5)'}`,
            borderRadius: '8px', padding: '0.5rem 0.9rem', cursor: 'pointer',
            color: '#f1f5f9', fontSize: '0.88rem', fontFamily: 'system-ui',
            transition: 'all 0.2s', whiteSpace: 'nowrap', minWidth: '140px',
            boxShadow: open ? '0 0 12px rgba(249,115,22,0.2)' : 'none',
          }}
        >
          🏫 {label}
          <span style={{ marginLeft: 'auto', opacity: 0.6, fontSize: '0.72rem' }}>{open ? '▲' : '▼'}</span>
        </button>

        {open && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: 'rgba(11,15,19,0.97)', border: '1.5px solid #f97316',
            borderRadius: '8px', minWidth: '240px', zIndex: 1200,
            backdropFilter: 'blur(16px)',
            boxShadow: '0 16px 40px rgba(0,0,0,0.6), 0 0 20px rgba(249,115,22,0.15)',
            overflow: 'hidden',
          }}>
            <input
              autoFocus placeholder="Search schools..."
              value={filter} onChange={e => setFilter(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box', background: 'rgba(255,255,255,0.05)',
                border: 'none', borderBottom: '1px solid rgba(63,63,70,0.5)',
                color: '#f1f5f9', padding: '0.7rem 1rem', fontSize: '0.88rem', outline: 'none',
              }}
            />
            <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
              {[{ ageId: '', name: 'All Schools' }, ...filtered].map(s => (
                <div
                  key={s.ageId}
                  onClick={() => { onSchoolChange(s.ageId); setOpen(false); setFilter('') }}
                  style={{
                    padding: '0.65rem 1rem', cursor: 'pointer', fontSize: '0.88rem',
                    color: selectedSchool === s.ageId ? '#f97316' : '#e2e8f0',
                    fontWeight: selectedSchool === s.ageId ? 700 : 400,
                    borderLeft: `3px solid ${selectedSchool === s.ageId ? '#f97316' : 'transparent'}`,
                    borderBottom: '1px solid rgba(63,63,70,0.2)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(249,115,22,0.12)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '' }}
                >
                  {s.name}{s.ageId && <span style={{ color: '#6b7280', fontSize: '0.8rem' }}> ({s.ageId})</span>}
                </div>
              ))}
              {filtered.length === 0 && schools.length > 0 && (
                <div style={{ padding: '0.65rem 1rem', color: '#6b7280', fontSize: '0.85rem' }}>No schools found</div>
              )}
            </div>
            <div style={{ borderTop: '1px solid rgba(63,63,70,0.4)', padding: '0.5rem', position: 'relative' }}>
              <button
                onClick={() => {
                  if (!session) { signIn('google'); return }
                  setShowModal(true); setOpen(false)
                }}
                style={{
                  width: '100%', background: 'rgba(249,115,22,0.1)', border: '1.5px solid rgba(249,115,22,0.4)',
                  borderRadius: '6px', padding: '0.5rem', cursor: 'pointer',
                  color: '#f97316', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'system-ui',
                  filter: !session ? 'blur(3px)' : 'none',
                  transition: 'filter 0.2s',
                }}
              >
                + Add School
              </button>
              {!session && (
                <div
                  onClick={() => signIn('google')}
                  style={{
                    position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#f97316', fontSize: '0.78rem', fontWeight: 700,
                  }}
                >
                  🔒 Login to add
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add School Modal — portaled to body so it's not clipped by header */}
      {showModal && typeof document !== 'undefined' && createPortal(
        <div
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false) }}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div style={{
            background: 'linear-gradient(135deg, #1a202c, #0f172a)',
            border: '1.5px solid #f97316', borderRadius: '12px', padding: '2rem',
            width: '90%', maxWidth: '420px', boxShadow: '0 24px 64px rgba(0,0,0,0.8)',
          }}>
            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: '#f1f5f9', marginBottom: '1.5rem', fontFamily: "'Oswald', system-ui, sans-serif", letterSpacing: '0.04em' }}>
              🏫 Add School
            </div>
            <form onSubmit={submit}>
              {(['ageId|AgeID (e.g. 4756)', 'name|School name'] as const).map((field) => {
                const [key, placeholder] = field.split('|') as ['ageId' | 'name', string]
                return (
                  <input
                    key={key}
                    placeholder={placeholder}
                    value={key === 'ageId' ? ageId : name}
                    onChange={e => key === 'ageId' ? setAgeId(e.target.value) : setName(e.target.value)}
                    required
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(11,15,19,0.8)', border: '1.5px solid rgba(63,63,70,0.7)',
                      borderRadius: '8px', padding: '0.7rem 1rem', color: '#f1f5f9',
                      fontSize: '0.95rem', outline: 'none', marginBottom: '1rem',
                    }}
                  />
                )
              })}
              {err && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '0.75rem' }}>⚠ {err}</div>}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ background: 'transparent', border: '1.5px solid rgba(63,63,70,0.7)', borderRadius: '8px', padding: '0.6rem 1.2rem', cursor: 'pointer', color: '#9ca3af', fontSize: '0.9rem', fontFamily: 'system-ui' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ background: 'linear-gradient(135deg, #f97316, #f59e0b)', border: 'none', borderRadius: '8px', padding: '0.6rem 1.4rem', cursor: saving ? 'not-allowed' : 'pointer', color: '#0B0F13', fontSize: '0.9rem', fontWeight: 700, fontFamily: 'system-ui', opacity: saving ? 0.5 : 1 }}>
                  {saving ? 'Adding...' : 'Add School'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Home() {
  const { data: session } = useSession()
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [schools, setSchools] = useState<School[]>([])
  const [selectedSchool, setSelectedSchool] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Article[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [viewMode, setViewMode] = useState<'queue' | 'grid'>('queue')
  const [buttonHovered, setButtonHovered] = useState(false)
  
  // Queue system for each layer
  const [layer1, setLayer1] = useState<CardState>({ article: null })
  const [layer2, setLayer2] = useState<CardState>({ article: null })
  const [layer3, setLayer3] = useState<CardState>({ article: null })
  const [layer4, setLayer4] = useState<CardState>({ article: null })
  const [layer5, setLayer5] = useState<CardState>({ article: null })
  
  // Track which articles have been shown on each layer
  const usedOnLayer1 = useRef<Set<string>>(new Set())
  const usedOnLayer2 = useRef<Set<string>>(new Set())
  const usedOnLayer3 = useRef<Set<string>>(new Set())
  const usedOnLayer4 = useRef<Set<string>>(new Set())
  const usedOnLayer5 = useRef<Set<string>>(new Set())

  // Cycle counters — incrementing forces CardComponent to remount and restart the animation
  const cycleCount1 = useRef(0)
  const cycleCount2 = useRef(0)
  const cycleCount3 = useRef(0)
  const cycleCount4 = useRef(0)
  const cycleCount5 = useRef(0)
  const [cycleKeys, setCycleKeys] = useState({ l1: 0, l2: 0, l3: 0, l4: 0, l5: 0 })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guidesRes, schoolsRes] = await Promise.all([
          fetch('/api/guides'),
          fetch('/api/schools'),
        ])
        const guidesData = await guidesRes.json()
        const schoolsData = await schoolsRes.json()

        const loadedArticles: Article[] = guidesData.guides.map((g: Article) => ({
          id: g.slug,
          slug: g.slug,
          title: g.title,
          description: g.description,
          sensitive: g.sensitive ?? false,
          schools: g.schools ?? [],
        }))

        setAllArticles(loadedArticles)
        setArticles(loadedArticles)
        setSchools(schoolsData.schools ?? [])
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Re-filter articles when school selection changes
  useEffect(() => {
    if (!selectedSchool) {
      setArticles(allArticles)
    } else {
      setArticles(allArticles.filter(a => a.schools.length === 0 || a.schools.includes(selectedSchool)))
    }
  }, [selectedSchool, allArticles])

  // Re-initialize queue layers whenever the filtered article list changes
  useEffect(() => {
    if (articles.length === 0) return
    usedOnLayer1.current = new Set()
    usedOnLayer2.current = new Set()
    usedOnLayer3.current = new Set()
    usedOnLayer4.current = new Set()
    usedOnLayer5.current = new Set()

    const a = articles
    const len = a.length
    // Use modulo wrapping so all 5 lanes are always populated even with < 5 articles.
    // This ensures general (schools=[]) articles appear on multiple lanes simultaneously.
    const at = (i: number) => a[i % len]
    setLayer1({ article: at(0) }); usedOnLayer1.current.add(at(0).id)
    setLayer2({ article: at(1) }); usedOnLayer2.current.add(at(1).id)
    setLayer3({ article: at(2) }); usedOnLayer3.current.add(at(2).id)
    setLayer4({ article: at(3) }); usedOnLayer4.current.add(at(3).id)
    setLayer5({ article: at(4) }); usedOnLayer5.current.add(at(4).id)

    cycleCount1.current += 1; cycleCount2.current += 1; cycleCount3.current += 1
    cycleCount4.current += 1; cycleCount5.current += 1
    setCycleKeys(k => ({ l1: cycleCount1.current, l2: cycleCount2.current, l3: cycleCount3.current, l4: cycleCount4.current, l5: cycleCount5.current }))
  }, [articles])

  function refreshSchools() {
    fetch('/api/schools').then(r => r.json()).then(d => setSchools(d.schools ?? []))
  }

  const getNextArticle = useCallback((usedSet: React.MutableRefObject<Set<string>>) => {
    for (const article of articles) {
      if (!usedSet.current.has(article.id)) {
        usedSet.current.add(article.id)
        return article
      }
    }
    // All articles used, reset and start over
    usedSet.current.clear()
    if (articles.length > 0) {
      usedSet.current.add(articles[0].id)
      return articles[0]
    }
    return null
  }, [articles])

  const handleCardExit = (layer: 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'layer5') => {
    if (layer === 'layer1') {
      const next = getNextArticle(usedOnLayer1)
      cycleCount1.current += 1
      setLayer1({ article: next })
      setCycleKeys(k => ({ ...k, l1: cycleCount1.current }))
    } else if (layer === 'layer2') {
      const next = getNextArticle(usedOnLayer2)
      cycleCount2.current += 1
      setLayer2({ article: next })
      setCycleKeys(k => ({ ...k, l2: cycleCount2.current }))
    } else if (layer === 'layer3') {
      const next = getNextArticle(usedOnLayer3)
      cycleCount3.current += 1
      setLayer3({ article: next })
      setCycleKeys(k => ({ ...k, l3: cycleCount3.current }))
    } else if (layer === 'layer4') {
      const next = getNextArticle(usedOnLayer4)
      cycleCount4.current += 1
      setLayer4({ article: next })
      setCycleKeys(k => ({ ...k, l4: cycleCount4.current }))
    } else if (layer === 'layer5') {
      const next = getNextArticle(usedOnLayer5)
      cycleCount5.current += 1
      setLayer5({ article: next })
      setCycleKeys(k => ({ ...k, l5: cycleCount5.current }))
    }
  }

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    if (query.trim()) {
      const filtered = allArticles.filter(article =>
        article.title.toLowerCase().includes(query.toLowerCase()) ||
        article.description.toLowerCase().includes(query.toLowerCase())
      )
      setSearchResults(filtered)
      setShowSearchResults(true)
    } else {
      setShowSearchResults(false)
    }
  }, [allArticles])

  const CardComponent = ({ card, direction, layer, onExit }: { card: CardState; direction: 'left' | 'right'; layer: 'layer1' | 'layer2' | 'layer3' | 'layer4' | 'layer5'; onExit: () => void }) => {
    if (!card.article) return null

    const [isHovered, setIsHovered] = useState(false)
    const isSensitiveGated = card.article.sensitive && !session

    const cardContent = (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a202c 0%, #0f172a 100%)',
          border: isHovered ? '1px solid #f97316' : '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '1rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          width: 'max-content',
          maxWidth: '350px',
          minHeight: '70px',
          maxHeight: '120px',
          animation: `${direction === 'left' ? 'cycleLeft' : 'cycleRight'} 25s linear forwards`,
          transition: 'all 0.3s ease-in-out',
          boxShadow: isHovered ? '0 0 20px rgba(249, 115, 22, 0.3)' : 'none',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onAnimationEnd={() => onExit()}
      >
        {isSensitiveGated && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, gap: '0.4rem', color: '#f97316', fontSize: '0.8rem', fontWeight: 700 }}>
            🔒 Login to view
          </div>
        )}
        <h3 style={{
          fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem',
          color: '#f1f5f9', lineHeight: '1.2', fontFamily: "'Oswald', system-ui, sans-serif",
          filter: isSensitiveGated ? 'blur(5px)' : 'none',
          userSelect: isSensitiveGated ? 'none' : 'auto',
        }}>
          {card.article.title}
        </h3>
        <p style={{
          fontSize: '0.7rem', color: '#a0aec0', lineHeight: '1.3', margin: 0,
          maxWidth: '330px', overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          filter: isSensitiveGated ? 'blur(4px)' : 'none',
          userSelect: isSensitiveGated ? 'none' : 'auto',
        }}>
          {card.article.description}
        </p>
      </div>
    )

    if (isSensitiveGated) {
      return <div onClick={() => signIn()}>{cardContent}</div>
    }
    return <Link href={`/guides/${card.article.slug}`}>{cardContent}</Link>
  }

  const GridCard = ({ article }: { article: Article }) => {
    const [isHovered, setIsHovered] = useState(false)
    const isSensitiveGated = article.sensitive && !session

    const cardContent = (
      <div
        style={{
          background: 'linear-gradient(135deg, #1a202c 0%, #0f172a 100%)',
          border: isHovered ? '2px solid #f97316' : '1px solid #3f3f46',
          borderRadius: '8px',
          padding: '1.5rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          transition: 'all 0.3s ease-in-out',
          boxShadow: isHovered ? '0 0 20px rgba(249, 115, 22, 0.3)' : 'none',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
          position: 'relative',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isSensitiveGated && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, flexDirection: 'column', gap: '0.4rem', color: '#f97316', fontSize: '0.9rem', fontWeight: 700 }}>
            🔒<span>Login to view</span>
          </div>
        )}
        <h3 style={{
          fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem',
          color: '#f1f5f9', lineHeight: '1.3', fontFamily: "'Oswald', system-ui, sans-serif",
          filter: isSensitiveGated ? 'blur(5px)' : 'none',
          userSelect: isSensitiveGated ? 'none' : 'auto',
        }}>
          {article.title}
        </h3>
        <p style={{
          fontSize: '0.85rem', color: '#a0aec0', lineHeight: '1.5', margin: 0, flex: 1,
          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
          WebkitLineClamp: 4, WebkitBoxOrient: 'vertical',
          filter: isSensitiveGated ? 'blur(4px)' : 'none',
          userSelect: isSensitiveGated ? 'none' : 'auto',
        }}>
          {article.description}
        </p>
        {article.sensitive && !isSensitiveGated && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            🔒 Sensitive
          </div>
        )}
      </div>
    )

    if (isSensitiveGated) {
      return <div style={{ height: '100%' }} onClick={() => signIn()}>{cardContent}</div>
    }
    return <Link href={`/guides/${article.slug}`} style={{ height: '100%' }}>{cardContent}</Link>
  }

  return (
    <div id="main" style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0B0F13',
      color: '#e2e8f0',
      fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
      padding: '2rem',
    }}>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in {
          animation: fadeInUp 0.6s ease-out both;
        }

        .animate-in-scale {
          animation: fadeInScale 0.5s ease-out both;
        }

        .howto-btn {
          background: linear-gradient(135deg, rgba(26, 32, 44, 0.6), rgba(15, 23, 42, 0.6));
          border: 1.5px solid #3f3f46;
          border-radius: 12px;
          padding: 1.75rem;
          cursor: pointer;
          transition: all 0.35s ease;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          text-align: left;
          color: inherit;
        }

        .howto-btn:hover {
          border-color: #f97316;
          background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(245, 158, 11, 0.04));
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(249, 115, 22, 0.2);
        }

        .howto-btn:active {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(249, 115, 22, 0.15);
        }

        .howto-arrow {
          opacity: 0;
          transform: translateX(-4px);
          transition: all 0.3s ease;
          color: #f97316;
          font-size: 1.2rem;
        }

        .howto-btn:hover .howto-arrow {
          opacity: 1;
          transform: translateX(0);
        }

        @keyframes cycleLeft {
          0% {
            transform: translateX(100vw);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(-100vw);
            opacity: 0;
          }
        }
        
        @keyframes cycleRight {
          0% {
            transform: translateX(-100vw);
            opacity: 0;
          }
          5% {
            opacity: 1;
          }
          95% {
            opacity: 1;
          }
          100% {
            transform: translateX(100vw);
            opacity: 0;
          }
        }

        .header-top {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 70px;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(11, 15, 19, 0.95));
          border-bottom: 2px solid #3f3f46;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-left: 2rem;
          padding-right: 2rem;
          z-index: 1000;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }

        .header-logo {
          display: flex;
          alignItems: center;
          gap: 0.75rem;
          fontSize: 1.3rem;
          fontWeight: 900;
          color: #f1f5f9;
          fontFamily: 'Bebas Neue', system-ui, sans-serif;
          textDecoration: none;
          transition: all 0.3s ease;
          letterSpacing: 0.05em;
          cursor: pointer;
          padding: 0.5rem 1rem;
          borderRadius: 6px;
        }

        .header-logo:hover {
          color: #f97316;
          background: rgba(249, 115, 22, 0.1);
          borderColor: #f97316;
        }

        .header-search {
          display: flex;
          alignItems: center;
          gap: 0.75rem;
          background: rgba(24, 24, 27, 0.7);
          border: 1.5px solid #3f3f46;
          borderRadius: 8px;
          padding: 0.7rem 1.2rem;
          maxWidth: 350px;
          transition: all 0.3s ease;
        }

        .header-search:focus-within {
          border-color: #f97316;
          box-shadow: 0 0 12px rgba(249, 115, 22, 0.2);
          background: rgba(24, 24, 27, 0.9);
        }

        .header-search input {
          background: none;
          border: none;
          color: #f1f5f9;
          fontSize: 0.95rem;
          outline: none;
          width: 100%;
          placeholder-color: #a0aec0;
        }

        .header-search input::placeholder {
          color: #a0aec0;
        }

        .header-search-icon {
          color: #a0aec0;
          fontSize: 1.2rem;
          transition: color 0.3s ease;
        }

        .header-search:focus-within .header-search-icon {
          color: #f97316;
        }

        .search-results {
          position: absolute;
          top: 100%;
          right: 0;
          background: linear-gradient(135deg, #1a202c 0%, #0f172a 100%);
          border: 1.5px solid #f97316;
          borderRadius: 8px;
          marginTop: 0.5rem;
          maxHeight: 400px;
          overflowY: auto;
          width: 350px;
          zIndex: 999;
          boxShadow: 0 8px 24px rgba(249, 115, 22, 0.15);
        }

        .search-result-item {
          padding: 1rem 1.2rem;
          borderBottom: 1px solid rgba(63, 63, 70, 0.5);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .search-result-item:hover {
          background: rgba(249, 115, 22, 0.15);
          paddingLeft: 1.5rem;
        }

        .search-result-item:last-child {
          borderBottom: none;
        }

        .search-result-title {
          color: #f1f5f9;
          fontSize: 0.9rem;
          fontWeight: 700;
          marginBottom: 0.3rem;
        }

        .search-result-desc {
          color: #a0aec0;
          fontSize: 0.8rem;
          lineHeight: 1.4;
        }

        .header-search-wrapper {
          position: relative;
        }

        .card-wrapper {
          display: flex;
          justify-content: center;
          width: 100%;
          height: 120px;
          position: relative;
        }

        .card-wrapper a {
          text-decoration: none;
          color: inherit;
          width: 100%;
        }

        a {
          text-decoration: none;
          color: inherit;
        }


      `}</style>

      {/* Top Navigation Header */}
      <div className="header-top">
        <Link href="/">
          <div className="header-logo" title="Home">
            📖 TRAINEE GUIDE
          </div>
        </Link>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'nowrap' }}>
          <button
            onClick={() => setViewMode(viewMode === 'queue' ? 'grid' : 'queue')}
            style={{
              background: buttonHovered ? 'rgba(249, 115, 22, 0.2)' : 'rgba(249, 115, 22, 0.05)',
              border: buttonHovered ? '1px solid #f97316' : '1px solid #3f3f46',
              borderRadius: '6px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              color: '#f1f5f9',
              fontSize: '0.9rem',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              fontFamily: 'system-ui',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
          >
            {viewMode === 'queue' ? '📊 Grid View' : '📜 Queue View'}
          </button>

          {/* School Dropdown */}
          <SchoolDropdown
            schools={schools}
            selectedSchool={selectedSchool}
            onSchoolChange={setSelectedSchool}
            session={session}
            onSchoolAdded={refreshSchools}
          />

          {/* Search */}
          <div className="header-search-wrapper">
          <div className="header-search">
            <span className="header-search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search guides..." 
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ color: '#f1f5f9' }}
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

      {/* Main content container with top padding for header */}
      <div style={{ paddingTop: '70px' }}>
        {/* Header */}
        <div style={{
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <h1 style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: '#f1f5f9',
          fontFamily: "'Bebas Neue', system-ui, sans-serif",
          letterSpacing: '0.05em',
          lineHeight: '0.9',
        }}>
          TRAINEE GUIDE
        </h1>
        <p style={{
          fontSize: '1.1rem',
          color: '#cbd5e1',
          maxWidth: '600px',
          lineHeight: '1.6',
        }}>
          Your comprehensive resource for success. Navigate through guides, best practices, and training materials.
        </p>

        {/* Scroll indicator */}
        <div style={{
          marginTop: '2rem',
          animation: 'bounce 2s infinite',
          color: '#6b7280',
          fontSize: '1.5rem',
        }}>
          ↓
        </div>
      </div>

      {/* Section: What is this? */}
      <section style={{
        padding: '6rem 2rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <h2 className="animate-in" style={{
          fontSize: '2rem',
          fontWeight: 900,
          fontFamily: "'Bebas Neue', system-ui, sans-serif",
          letterSpacing: '0.05em',
          color: '#f1f5f9',
          marginBottom: '1.5rem',
          borderBottom: '2px solid rgba(249, 115, 22, 0.3)',
          paddingBottom: '0.75rem',
        }}>
          What Is The Trainee Guide?
        </h2>
        <p className="animate-in" style={{
          color: '#cbd5e1',
          lineHeight: '1.8',
          fontSize: '1.05rem',
          marginBottom: '1rem',
          animationDelay: '0.15s',
        }}>
          The Trainee Guide is your single source of truth for everything you need to know during your placement at 28248. 
          Whether you&apos;re just starting out or need a quick refresher, every procedure, checklist, and best practice is documented here.
        </p>
        <p className="animate-in" style={{
          color: '#9ca3af',
          lineHeight: '1.8',
          fontSize: '1rem',
          animationDelay: '0.3s',
        }}>
          No more asking around or guessing — everything from daily tasks to ticket management is covered in one place, 
          kept up to date by the team.
        </p>
      </section>

      {/* Section: How to use */}
      <section style={{
        padding: '4rem 2rem 6rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <h2 className="animate-in" style={{
          fontSize: '2rem',
          fontWeight: 900,
          fontFamily: "'Bebas Neue', system-ui, sans-serif",
          letterSpacing: '0.05em',
          color: '#f1f5f9',
          marginBottom: '2rem',
          borderBottom: '2px solid rgba(249, 115, 22, 0.3)',
          paddingBottom: '0.75rem',
        }}>
          How To Use This Site
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
        }}>
          {[
            { icon: '🔍', title: 'Search', desc: 'Use the search bar in the header to quickly find any guide by keyword.', href: '#', action: 'search' },
            { icon: '📖', title: viewMode === 'queue' ? 'Browse Guides' : 'Queue View', desc: viewMode === 'queue' ? 'Switch to Grid View to see all available guides at a glance.' : 'Switch back to Queue View to watch guides scroll past.', href: '#', action: 'grid' },
            { icon: '✏️', title: 'Editor', desc: 'Need to update a guide? Head to the Editor to create or modify content directly.', href: '/editor', action: 'link' },
          ].map((item, i) => (
            item.action === 'link' ? (
              <Link key={i} href={item.href} className="howto-btn animate-in-scale" style={{ animationDelay: `${i * 0.15}s` }}>
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{
                  fontFamily: "'Oswald', system-ui, sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  {item.title}
                  <span className="howto-arrow">→</span>
                </h3>
                <p style={{
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  fontSize: '0.9rem',
                  margin: 0,
                }}>
                  {item.desc}
                </p>
              </Link>
            ) : (
              <button
                key={i}
                className="howto-btn animate-in-scale"
                style={{ animationDelay: `${i * 0.15}s` }}
                onClick={() => {
                  if (item.action === 'search') {
                    const searchInput = document.querySelector('.header-search input') as HTMLInputElement
                    if (searchInput) { searchInput.focus() }
                  } else if (item.action === 'grid') {
                    setViewMode(viewMode === 'queue' ? 'grid' : 'queue')
                    const gridSection = document.querySelector('[data-section="guides"]')
                    if (gridSection) { gridSection.scrollIntoView({ behavior: 'smooth' }) }
                  }
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <h3 style={{
                  fontFamily: "'Oswald', system-ui, sans-serif",
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  color: '#f1f5f9',
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  {item.title}
                  <span className="howto-arrow">→</span>
                </h3>
                <p style={{
                  color: '#9ca3af',
                  lineHeight: '1.6',
                  fontSize: '0.9rem',
                  margin: 0,
                  textAlign: 'left',
                }}>
                  {item.desc}
                </p>
              </button>
            )
          ))}
        </div>
      </section>

      {/* Queue or Grid View */}
      {!loading && articles.length > 0 && (
        viewMode === 'queue' ? (
          // Queue View
          <section data-section="guides" style={{
            backgroundColor: '#0B0F13',
            borderTop: '1px solid #3f3f46',
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.03), transparent 50%)',
            padding: '3rem 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflow: 'hidden',
          }}>
            {/* Layer 1 - exits left */}
            <div className="card-wrapper">
              {layer1.article && <CardComponent key={`l1-${cycleKeys.l1}`} card={layer1} direction="left" layer="layer1" onExit={() => handleCardExit('layer1')} />}
            </div>

            {/* Layer 2 - exits right */}
            <div className="card-wrapper">
              {layer2.article && <CardComponent key={`l2-${cycleKeys.l2}`} card={layer2} direction="right" layer="layer2" onExit={() => handleCardExit('layer2')} />}
            </div>

            {/* Layer 3 - exits left */}
            <div className="card-wrapper">
              {layer3.article && <CardComponent key={`l3-${cycleKeys.l3}`} card={layer3} direction="left" layer="layer3" onExit={() => handleCardExit('layer3')} />}
            </div>

            {/* Layer 4 - exits right */}
            <div className="card-wrapper">
              {layer4.article && <CardComponent key={`l4-${cycleKeys.l4}`} card={layer4} direction="right" layer="layer4" onExit={() => handleCardExit('layer4')} />}
            </div>

            {/* Layer 5 - exits left */}
            <div className="card-wrapper">
              {layer5.article && <CardComponent key={`l5-${cycleKeys.l5}`} card={layer5} direction="left" layer="layer5" onExit={() => handleCardExit('layer5')} />}
            </div>
          </section>
        ) : (
          // Grid View
          <div data-section="guides" style={{
            padding: '2rem',
            paddingBottom: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {articles.map((article) => (
              <GridCard key={article.id} article={article} />
            ))}
          </div>
        )
      )}
      </div>

      {/* Edits Made — read-only audit log */}
      <AuditLog session={session} />

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
          title="Open Editor"
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