import { useState, useRef } from 'react'
import type { EntryType, EntryVisibility } from '../types'

interface QuickInputProps {
  onCreate: (title: string, body: string, tags: string[], type: string, visibility: string) => Promise<void>
}

const TYPE_OPTIONS: { id: EntryType; icon: string; label: string }[] = [
  { id: 'note', icon: '📝', label: 'Nota'   },
  { id: 'task', icon: '✅', label: 'Tarefa' },
  { id: 'code', icon: '💻', label: 'Código' },
  { id: 'link', icon: '🔗', label: 'Link'   },
]

export function QuickInput({ onCreate }: QuickInputProps) {
  const [focused, setFocused] = useState(false)
  const [body, setBody] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<EntryType>('note')
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
      await onCreate(title || body.split('\n')[0].slice(0, 60), body, tags, type, visibility)
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
      {/* Main input */}
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
          {/* Title (optional) */}
          <div className="px-4 pb-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título (opcional, gerado automaticamente se vazio)"
              className="w-full bg-transparent text-zinc-400 text-xs outline-none placeholder-zinc-600 border-b border-[#2a2a2e] pb-1"
            />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-t border-[#2a2a2e]">
            {/* Type selector */}
            <div className="flex gap-1">
              {TYPE_OPTIONS.map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => setType(id)}
                  title={label}
                  className={`text-base px-1.5 py-0.5 rounded transition-colors
                    ${type === id ? 'bg-indigo-600/20 text-indigo-400' : 'text-zinc-600 hover:text-zinc-300'}`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <div className="w-px h-4 bg-[#3f3f46]" />

            {/* Tags */}
            <div className="flex flex-wrap items-center gap-1 flex-1">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-0.5 bg-[#27272a] text-zinc-400 text-[11px] px-1.5 py-0.5 rounded-full">
                  #{t}
                  <button onClick={() => setTags(p => p.filter(x => x !== t))} className="hover:text-white ml-0.5">×</button>
                </span>
              ))}
              <input
                type="text"
                placeholder="#tag"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
                className="bg-transparent text-zinc-400 text-[11px] outline-none placeholder-zinc-600 w-16"
              />
            </div>

            {/* Visibility + Save */}
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setVisibility(v => v === 'private' ? 'shared' : 'private')}
                title={visibility === 'private' ? 'Privado' : 'Compartilhado'}
                className="text-zinc-500 hover:text-zinc-300 text-base transition-colors"
              >
                {visibility === 'private' ? '🔒' : '🌐'}
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
