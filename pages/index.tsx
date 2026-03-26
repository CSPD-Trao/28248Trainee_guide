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

interface Car {
  id: number
  article: Article
  lane: number
  x: number          // vw from left
  speed: number      // vw per frame (~16ms)
  direction: 'left' | 'right'
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
  
  // ── Car-physics carousel system ──────────────────────────────────────────
  const LANE_COUNT = 5
  const CARD_W = 22        // approx card width in vw
  const MIN_GAP = 4        // min gap in vw between cars
  const ENTRY_CLEAR = 28   // vw a car must travel before next can enter lane

  const carsRef = useRef<Car[]>([])
  const queueRef = useRef<Article[]>([])
  const rafRef = useRef<number>(0)
  const carIdCounter = useRef(0)
  const lastFrameRef = useRef(0)
  const [renderedCars, setRenderedCars] = useState<Car[]>([])

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

  /** Spawn a new car at the entry edge of a lane */
  const spawnCar = useCallback((lane: number, article: Article) => {
    const dir = lane % 2 === 0 ? 'left' as const : 'right' as const
    const startX = dir === 'left' ? 102 : -(CARD_W + 2)
    const speed = 0.02 + Math.random() * 0.14  // vw per frame
    const car: Car = {
      id: carIdCounter.current++,
      article,
      lane,
      x: startX,
      speed,
      direction: dir,
    }
    carsRef.current.push(car)
  }, [CARD_W])

  /** Check if a lane's entry zone is clear (enough room for a new car) */
  const laneHasRoom = useCallback((lane: number) => {
    const dir = lane % 2 === 0 ? 'left' : 'right'
    const laneCars = carsRef.current.filter(c => c.lane === lane)
    if (laneCars.length === 0) return true
    for (const c of laneCars) {
      if (dir === 'left' && c.x > 100 - ENTRY_CLEAR) return false
      if (dir === 'right' && c.x < ENTRY_CLEAR - CARD_W) return false
    }
    return true
  }, [CARD_W, ENTRY_CLEAR])

  // Combined init + animation loop (merged to avoid two effects fighting over rAF)
  useEffect(() => {
    if (articles.length === 0) {
      console.log('[carousel] no articles, skipping')
      return
    }

    // ── Reset: shuffle articles into queue, spawn initial cars ──
    cancelAnimationFrame(rafRef.current)
    lastFrameRef.current = 0

    const shuffled = [...articles]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    queueRef.current = shuffled
    carsRef.current = []

    for (let lane = 0; lane < LANE_COUNT && queueRef.current.length > 0; lane++) {
      const article = queueRef.current.shift()!
      spawnCar(lane, article)
    }
    console.log('[carousel] init: %d articles, %d cars spawned, %d in queue',
      articles.length, carsRef.current.length, queueRef.current.length)
    setRenderedCars([...carsRef.current])

    // ── Animation loop ──
    let frameCount = 0
    const tick = (now: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = now
      const dt = Math.min(now - lastFrameRef.current, 50) / 16
      lastFrameRef.current = now

      const cars = carsRef.current

      // Move each car, slowing if it would close gap on car ahead
      for (const car of cars) {
        const ahead = cars.filter(c =>
          c.lane === car.lane && c.id !== car.id &&
          (car.direction === 'left' ? c.x < car.x : c.x > car.x)
        )
        let effectiveSpeed = car.speed

        if (ahead.length > 0) {
          const closest = ahead.reduce((best, c) => {
            const dist = car.direction === 'left'
              ? car.x - c.x - CARD_W
              : c.x - car.x - CARD_W
            const bestDist = car.direction === 'left'
              ? best.x === Infinity ? Infinity : car.x - best.x - CARD_W
              : best.x === Infinity ? Infinity : best.x - car.x - CARD_W
            return dist < bestDist ? c : best
          }, { x: Infinity } as Car)

          if (closest.x !== Infinity) {
            const gap = car.direction === 'left'
              ? car.x - closest.x - CARD_W
              : closest.x - car.x - CARD_W
            if (gap < MIN_GAP + CARD_W) {
              effectiveSpeed = Math.min(effectiveSpeed, closest.speed * 0.95)
            }
          }
        }

        car.x += (car.direction === 'left' ? -1 : 1) * effectiveSpeed * dt
      }

      // Remove exited cars → back to queue
      const remaining: Car[] = []
      for (const car of cars) {
        const exited = car.direction === 'left'
          ? car.x < -(CARD_W + 5)
          : car.x > 105
        if (exited) {
          queueRef.current.push(car.article)
        } else {
          remaining.push(car)
        }
      }
      carsRef.current = remaining

      // Spawn from queue into lanes with room
      for (let lane = 0; lane < LANE_COUNT; lane++) {
        if (queueRef.current.length === 0) break
        if (laneHasRoom(lane)) {
          const article = queueRef.current.shift()!
          spawnCar(lane, article)
        }
      }

      setRenderedCars([...carsRef.current])

      // Periodic debug log
      frameCount++
      if (frameCount % 300 === 0) {
        console.log('[carousel] frame %d: %d cars on screen, %d in queue',
          frameCount, carsRef.current.length, queueRef.current.length)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [articles, CARD_W, LANE_COUNT, MIN_GAP, ENTRY_CLEAR, laneHasRoom, spawnCar])

  function refreshSchools() {
    fetch('/api/schools').then(r => r.json()).then(d => setSchools(d.schools ?? []))
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

  const CarCard = ({ car }: { car: Car }) => {
    const [isHovered, setIsHovered] = useState(false)
    const isSensitiveGated = car.article.sensitive && !session

    const cardContent = (
      <div
        style={{
          position: 'absolute',
          left: `${car.x}vw`,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'linear-gradient(135deg, #1a202c 0%, #0f172a 100%)',
          border: isHovered ? '1px solid #f97316' : '1px solid #3f3f46',
          borderRadius: '6px',
          padding: '1rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          width: `${CARD_W}vw`,
          maxWidth: '350px',
          minHeight: '70px',
          maxHeight: '100px',
          overflow: 'hidden',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          boxShadow: isHovered ? '0 0 20px rgba(249, 115, 22, 0.3)' : 'none',
          willChange: 'left',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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
          {car.article.title}
        </h3>
        <p style={{
          fontSize: '0.7rem', color: '#a0aec0', lineHeight: '1.3', margin: 0,
          maxWidth: '330px', overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
          filter: isSensitiveGated ? 'blur(4px)' : 'none',
          userSelect: isSensitiveGated ? 'none' : 'auto',
        }}>
          {car.article.description}
        </p>
      </div>
    )

    if (isSensitiveGated) {
      return <div onClick={() => signIn()}>{cardContent}</div>
    }
    return <Link href={`/guides/${car.article.slug}`}>{cardContent}</Link>
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

        /* car-physics carousel uses JS positioning, no keyframes needed */

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
            {Array.from({ length: LANE_COUNT }, (_, laneIdx) => (
              <div key={laneIdx} style={{
                position: 'relative',
                height: '120px',
                width: '100%',
                overflow: 'hidden',
              }}>
                {renderedCars
                  .filter(c => c.lane === laneIdx)
                  .map(car => <CarCard key={car.id} car={car} />)
                }
              </div>
            ))}
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