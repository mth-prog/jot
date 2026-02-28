import { useState, useRef } from 'react'
import type { EntryVisibility } from '../types'

const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
    <path d="M11.5 8h-7A1.5 1.5 0 0 0 3 9.5v4A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-4A1.5 1.5 0 0 0 11.5 8zM8 12a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5.5 8V5.5a2.5 2.5 0 0 1 5 0V8h-5z"/>
  </svg>
)

const GlobeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
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
      await onCreate(title || body.split('\n')[0].slice(0, 60), body, tags, visibility)
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
      className={`bg-[#18181b] border rounded-xl mb-6 transition-all overflow-hidden
        ${focused ? 'border-indigo-500/50 shadow-lg shadow-indigo-500/10' : 'border-[#2a2a2e] hover:border-[#3f3f46]'}`}
    >
      <textarea
        ref={textareaRef}
        value={body}
        onChange={e => setBody(e.target.value)}
        onFocus={() => setFocused(true)}
        placeholder="O que você fez hoje? (suporta Markdown)"
        rows={focused ? 4 : 2}
        className="w-full bg-transparent text-zinc-200 text-sm placeholder-zinc-600 px-4 pt-4 pb-2 outline-none resize-none leading-relaxed"
      />

      {focused && (
        <>
          <div className="px-4 pb-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título (opcional)"
              className="w-full bg-transparent text-zinc-400 text-xs outline-none placeholder-zinc-600 border-b border-[#2a2a2e] pb-1"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-[#2a2a2e]">
            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1 flex-1">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-0.5 bg-[#27272a] text-zinc-400 text-[11px] px-1.5 py-0.5 rounded-full">
                  #{t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-white ml-0.5">×</button>
                </span>
              ))}
              <input
                type="text" placeholder="#tag" value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
                className="bg-transparent text-zinc-400 text-[11px] outline-none placeholder-zinc-600 w-16"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setVisibility(v => v === 'private' ? 'shared' : 'private')}
                title={visibility === 'private' ? 'Privado' : 'Compartilhado'}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {visibility === 'private' ? <LockIcon /> : <GlobeIcon />}
              </button>
              <button onClick={reset} className="text-zinc-600 hover:text-zinc-400 text-sm px-2 py-1 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || (!body.trim() && !title.trim())}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-sm px-4 py-1.5 rounded-lg transition-colors font-medium"
              >
                {saving ? '...' : 'Salvar'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
