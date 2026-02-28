import { useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import type { Entry, EntryVisibility } from '../types'

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
    <path d="M11.5 8h-7A1.5 1.5 0 0 0 3 9.5v4A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-4A1.5 1.5 0 0 0 11.5 8zM8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5.5 8V5.5a2.5 2.5 0 0 1 5 0V8h-5z"/>
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm-1 14.9A6.5 6.5 0 0 1 2 8.5H1.5a6.5 6.5 0 0 1 5.5 6.4zM8 15a6.97 6.97 0 0 1-1-.07V9H5.5A6.5 6.5 0 0 1 1.5 8h14a6.5 6.5 0 0 1-4 6.5V9H9v5.93A6.97 6.97 0 0 1 8 15zM2 7.5A6.5 6.5 0 0 1 8 1a6.5 6.5 0 0 1 6 4H2.5A6.5 6.5 0 0 1 2 7.5zM8 1c.34 0 .67.03 1 .07V6h1.5A6.5 6.5 0 0 1 14.5 7H1.5A6.5 6.5 0 0 1 4 2.5 6.97 6.97 0 0 1 8 1z"/>
  </svg>
)

interface EntryCardProps {
  entry: Entry
  onSave: (id: number, title: string, body: string, tags: string[], visibility: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  animDelay?: number
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function EntryCard({ entry, onSave, onDelete, animDelay = 0 }: EntryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(entry.title)
  const [body, setBody] = useState(entry.body)
  const [tags, setTags] = useState(entry.tags)
  const [visibility, setVisibility] = useState<EntryVisibility>(entry.visibility)
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(entry.id, title, body, tags, visibility)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setTitle(entry.title); setBody(entry.body); setTags(entry.tags); setVisibility(entry.visibility)
    setEditing(false)
  }

  const addTag = (t: string) => {
    const clean = t.trim().toLowerCase()
    if (clean && !tags.includes(clean)) setTags(prev => [...prev, clean])
    setTagInput('')
  }

  return (
    <article
      className="entry-in mb-3 overflow-hidden"
      style={{
        background: 'var(--c-surface)',
        border: '1px solid var(--c-border)',
        borderRadius: 10,
        animationDelay: `${animDelay}ms`,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border-hi)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--c-border)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {editing ? (
        /* ── Edit mode ── */
        <div data-color-mode="dark">
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título..."
              className="flex-1 bg-transparent outline-none font-display"
              style={{ color: 'var(--c-text)', fontSize: 16, fontWeight: 600 }}
            />
            <button
              onClick={() => setVisibility(v => v === 'private' ? 'shared' : 'private')}
              title={visibility === 'private' ? 'Privado' : 'Compartilhado'}
              style={{ color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
            >
              {visibility === 'private' ? <LockIcon /> : <GlobeIcon />}
            </button>
          </div>

          {/* Tags edit row */}
          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
            {tags.map(t => (
              <span
                key={t}
                className="flex items-center gap-1 font-mono-j"
                style={{
                  background: 'var(--c-muted)', color: 'var(--c-text-2)',
                  fontSize: 10, padding: '2px 8px', borderRadius: 9999,
                  border: '1px solid var(--c-border-hi)',
                }}
              >
                #{t}
                <button
                  onClick={() => setTags(prev => prev.filter(x => x !== t))}
                  style={{ color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 2, lineHeight: 1 }}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text" placeholder="+ tag" value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
              className="bg-transparent outline-none font-mono-j"
              style={{ color: 'var(--c-text-3)', fontSize: 10, width: 56 }}
            />
          </div>

          <div style={{ borderTop: '1px solid var(--c-border)' }}>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={12}
              placeholder="Conteúdo (suporta Markdown)..."
              className="w-full outline-none resize-y font-mono-j"
              style={{
                background: 'var(--c-base)',
                color: 'var(--c-text)',
                fontSize: 13,
                padding: '12px 16px',
                lineHeight: 1.7,
                border: 'none',
              }}
            />
          </div>

          <div
            className="flex justify-end gap-2 px-4 py-3"
            style={{ borderTop: '1px solid var(--c-border)', background: 'var(--c-base)' }}
          >
            <button
              onClick={handleCancel}
              className="font-mono-j"
              style={{ color: 'var(--c-text-3)', fontSize: 12, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 10px' }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="font-mono-j"
              style={{
                background: saving || !title.trim() ? 'var(--c-border-hi)' : 'var(--c-accent)',
                color: saving || !title.trim() ? 'var(--c-text-3)' : '#090909',
                fontSize: 12, fontWeight: 600,
                border: 'none', borderRadius: 7, cursor: 'pointer',
                padding: '5px 14px', transition: 'background 0.15s, color 0.15s',
              }}
            >
              {saving ? 'Salvando…' : 'Salvar'}
            </button>
          </div>
        </div>
      ) : (
        /* ── View mode ── */
        <div>
          {/* Card header */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-display"
                  style={{
                    color: 'var(--c-text)',
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    marginBottom: entry.tags.length > 0 ? 6 : 0,
                  }}
                >
                  {entry.title || <span style={{ color: 'var(--c-text-3)', fontStyle: 'italic', fontWeight: 400 }}>Sem título</span>}
                </h3>

                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map(t => (
                      <span
                        key={t}
                        className="font-mono-j"
                        style={{
                          fontSize: 9, padding: '1px 7px', borderRadius: 9999,
                          background: 'var(--c-muted)', color: 'var(--c-text-3)',
                          border: '1px solid var(--c-border)',
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0 pt-0.5">
                <span style={{ color: 'var(--c-text-3)', display: 'flex' }} title={entry.visibility === 'private' ? 'Privado' : 'Compartilhado'}>
                  {entry.visibility === 'private' ? <LockIcon /> : <GlobeIcon />}
                </span>
                <span
                  className="font-mono-j"
                  style={{ fontSize: 10, color: 'var(--c-text-3)' }}
                >
                  {timeAgo(entry.updated_at)}
                </span>
              </div>
            </div>
          </div>

          {/* Body preview */}
          {entry.body && (
            <div
              className="px-4 pb-3 cursor-pointer"
              onClick={() => setExpanded(e => !e)}
            >
              <div
                data-color-mode="dark"
                style={{
                  maxHeight: expanded ? 9999 : 112,
                  overflow: 'hidden',
                  transition: 'max-height 0.25s ease',
                }}
              >
                <MDEditor.Markdown
                  source={entry.body}
                  style={{ background: 'transparent', fontSize: 13, color: 'var(--c-text-2)', lineHeight: 1.75 }}
                />
              </div>
              {!expanded && entry.body.length > 180 && (
                <div
                  style={{
                    height: 28, marginTop: -28,
                    background: `linear-gradient(to top, var(--c-surface), transparent)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </div>
          )}

          {/* Card footer */}
          <div
            className="flex items-center justify-between px-4 py-2"
            style={{ borderTop: '1px solid var(--c-border)' }}
          >
            <button
              onClick={() => setExpanded(e => !e)}
              className="font-mono-j"
              style={{ fontSize: 10, color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              {expanded ? '↑ recolher' : '↓ expandir'}
            </button>
            <div className="flex gap-4">
              <button
                onClick={() => setEditing(true)}
                className="font-mono-j"
                style={{ fontSize: 10, color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-accent)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
              >
                editar
              </button>
              <button
                onClick={() => onDelete(entry.id)}
                className="font-mono-j"
                style={{ fontSize: 10, color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, transition: 'color 0.12s' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--c-danger)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--c-text-3)')}
              >
                excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
