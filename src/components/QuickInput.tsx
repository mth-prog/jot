import { useState, useRef } from 'react'
import type { EntryVisibility } from '../types'

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

interface QuickInputProps {
  onCreate: (title: string, body: string, tags: string[], visibility: string) => Promise<void>
}

export function QuickInput({ onCreate }: QuickInputProps) {
  const [focused, setFocused] = useState(false)
  const [body, setBody] = useState('')
  const [title, setTitle] = useState('')
  const [visibility, setVisibility] = useState<EntryVisibility>('private')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const reset = () => {
    setBody(''); setTitle(''); setTags([]); setTagInput(''); setFocused(false)
  }

  const handleSave = async () => {
    if (!body.trim() && !title.trim()) return
    setSaving(true)
    try {
      const autoTitle = (() => {
        const now = new Date()
        const dd = String(now.getDate()).padStart(2, '0')
        const mm = String(now.getMonth() + 1).padStart(2, '0')
        const yyyy = now.getFullYear()
        const hh = String(now.getHours()).padStart(2, '0')
        return `note-${dd}/${mm}/${yyyy}-${hh}h`
      })()
      await onCreate(title.trim() || autoTitle, body, tags, visibility)
      reset()
    } finally {
      setSaving(false)
    }
  }

  const addTag = (t: string) => {
    const clean = t.trim().toLowerCase()
    if (clean && !tags.includes(clean)) setTags(prev => [...prev, clean])
    setTagInput('')
  }

  return (
    <div
      className="mb-6 overflow-hidden"
      style={{
        background: 'var(--c-surface)',
        border: `1px solid ${focused ? 'var(--c-accent)' : 'var(--c-border)'}`,
        borderRadius: 10,
        boxShadow: focused ? '0 0 0 3px var(--c-accent-dim)' : 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Main textarea */}
      <textarea
        ref={textareaRef}
        value={body}
        onChange={e => setBody(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="O que aconteceu hoje?"
        rows={focused ? 3 : 1}
        className="w-full bg-transparent outline-none resize-none font-mono-j"
        style={{
          color: 'var(--c-text)',
          fontSize: 12,
          fontStyle: body ? 'normal' : 'italic',
          padding: '10px 14px 6px',
          lineHeight: 1.6,
        }}
      />

      {focused && (
        <>
          {/* Title input */}
          <div className="px-4 pb-3">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título (opcional)"
              className="w-full bg-transparent outline-none font-mono-j"
              style={{
                color: 'var(--c-text-2)',
                fontSize: 12,
                borderBottom: '1px solid var(--c-border)',
                paddingBottom: 6,
              }}
            />
          </div>

          {/* Tags + actions row */}
          <div
            className="flex flex-wrap items-center gap-2 px-4 py-2"
            style={{ borderTop: '1px solid var(--c-border)' }}
          >
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1 flex-1">
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
                    onClick={() => setTags(p => p.filter(x => x !== t))}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-3)', padding: 0, marginLeft: 2 }}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text" placeholder="#tag" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
                className="bg-transparent outline-none font-mono-j"
                style={{ color: 'var(--c-text-3)', fontSize: 10, width: 48 }}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 ml-auto">
              <button
                onClick={() => setVisibility(v => v === 'private' ? 'shared' : 'private')}
                title={visibility === 'private' ? 'Privado' : 'Compartilhado'}
                style={{ color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
              >
                {visibility === 'private' ? <LockIcon /> : <GlobeIcon />}
              </button>
              <button
                onClick={reset}
                className="font-mono-j"
                style={{ color: 'var(--c-text-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, padding: 0 }}
              >
                cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!body.trim() && !title.trim())}
                className="font-mono-j"
                style={{
                  background: saving || (!body.trim() && !title.trim()) ? 'var(--c-border-hi)' : 'var(--c-accent)',
                  color: saving || (!body.trim() && !title.trim()) ? 'var(--c-text-3)' : '#090909',
                  fontSize: 11, fontWeight: 600,
                  border: 'none', borderRadius: 7, cursor: 'pointer',
                  padding: '5px 14px', transition: 'background 0.15s, color 0.15s',
                }}
              >
                {saving ? '…' : 'salvar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
