import { useState, useEffect, useCallback } from 'react'
import type { AuditEntry } from '@/pages/api/audit'

interface AuditLogProps {
  session: { user?: { email?: string | null } } | null
}

export default function AuditLog({ session }: AuditLogProps) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [undoing, setUndoing] = useState<string | null>(null)
  const [undoMessage, setUndoMessage] = useState('')

  const fetchEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/audit')
      const data = await res.json()
      if (res.ok) setEntries(data.entries ?? [])
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open && entries.length === 0) fetchEntries()
  }, [open, entries.length, fetchEntries])

  async function handleUndo(sha: string) {
    setUndoing(sha)
    setUndoMessage('')
    try {
      const res = await fetch('/api/undo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sha }),
      })
      const data = await res.json()
      if (res.ok) {
        setUndoMessage(`✅ Reverted successfully (${data.revertSha?.slice(0, 7)})`)
        await fetchEntries()
      } else {
        setUndoMessage(`⚠ ${data.error || 'Failed to undo'}`)
      }
    } catch {
      setUndoMessage('⚠ Network error — please try again')
    } finally {
      setUndoing(null)
    }
  }

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleString('en-AU', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    } catch {
      return iso
    }
  }

  return (
    <section style={{
      margin: '3rem 2rem 2rem',
      border: '1.5px solid rgba(63,63,70,0.6)',
      borderRadius: '12px',
      overflow: 'hidden',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <style>{`
        .audit-entry {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid rgba(63,63,70,0.4);
          display: flex;
          align-items: flex-start;
          gap: 1rem;
        }
        .audit-entry:last-child { border-bottom: none; }
        .audit-sha {
          font-family: 'Courier New', monospace;
          font-size: 0.78rem;
          color: #f97316;
          background: rgba(249,115,22,0.08);
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          flex-shrink: 0;
        }
        .audit-msg {
          flex: 1;
          min-width: 0;
        }
        .audit-commit-text {
          color: #f1f5f9;
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          white-space: pre-wrap;
          word-break: break-word;
        }
        .audit-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.78rem;
          color: #9ca3af;
        }
        .audit-files {
          margin-top: 0.3rem;
          display: flex;
          flex-wrap: wrap;
          gap: 0.3rem;
        }
        .audit-file-tag {
          font-size: 0.72rem;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.25);
          color: #a5b4fc;
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
        }
        .undo-btn {
          background: rgba(239,68,68,0.1);
          border: 1.5px solid rgba(239,68,68,0.3);
          border-radius: 6px;
          padding: 0.35rem 0.8rem;
          cursor: pointer;
          color: #fca5a5;
          font-size: 0.8rem;
          font-weight: 600;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .undo-btn:hover {
          background: rgba(239,68,68,0.2);
          border-color: #ef4444;
          color: #f87171;
        }
        .undo-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>

      {/* Collapsible header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, rgba(26,32,44,0.8), rgba(15,23,42,0.8))',
          border: 'none',
          cursor: 'pointer',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#f1f5f9',
          fontFamily: "'Oswald', system-ui, sans-serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
        }}
      >
        <span>📋 Edits Made</span>
        <span style={{ fontSize: '0.85rem', opacity: 0.6, fontFamily: 'system-ui' }}>
          {open ? '▲ Collapse' : '▼ Expand'}
        </span>
      </button>

      {open && (
        <div style={{ background: 'rgba(11,15,19,0.6)' }}>
          {/* Toolbar */}
          <div style={{ padding: '0.75rem 1.5rem', borderBottom: '1px solid rgba(63,63,70,0.4)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#9ca3af', fontSize: '0.82rem' }}>
              Showing most recent 20 edits to content files. This log is read-only.
            </span>
            <button
              onClick={fetchEntries}
              disabled={loading}
              style={{
                marginLeft: 'auto', background: 'transparent',
                border: '1px solid rgba(63,63,70,0.5)', borderRadius: '6px',
                padding: '0.3rem 0.75rem', cursor: loading ? 'not-allowed' : 'pointer',
                color: '#a0aec0', fontSize: '0.8rem', transition: 'all 0.2s',
              }}
            >
              {loading ? 'Loading...' : '↻ Refresh'}
            </button>
          </div>

          {undoMessage && (
            <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(249,115,22,0.06)', borderBottom: '1px solid rgba(249,115,22,0.2)', color: '#fdba74', fontSize: '0.88rem' }}>
              {undoMessage}
            </div>
          )}

          {loading && entries.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>Loading edits...</div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#6b7280' }}>No edits found yet.</div>
          ) : (
            <div>
              {entries.map(entry => (
                <div key={entry.sha} className="audit-entry">
                  <span className="audit-sha">{entry.sha.slice(0, 7)}</span>
                  <div className="audit-msg">
                    <div className="audit-commit-text">{entry.message}</div>
                    <div className="audit-meta">
                      <span>👤 {entry.author}</span>
                      <span>🕐 {formatDate(entry.date)}</span>
                    </div>
                    {entry.files.length > 0 && (
                      <div className="audit-files">
                        {entry.files.map(f => (
                          <span key={f} className="audit-file-tag">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  {session && (
                    <button
                      className="undo-btn"
                      disabled={undoing === entry.sha}
                      onClick={() => handleUndo(entry.sha)}
                      title={`Revert commit ${entry.sha.slice(0, 7)}`}
                    >
                      {undoing === entry.sha ? 'Reverting...' : '↩ Undo'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
