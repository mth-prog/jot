import { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import type { Entry } from '../types'

interface EditorProps {
  entry: Entry | null
  onSave: (title: string, body: string, tags: string[]) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const SUGGESTED_TAGS = ['bug', 'feature', 'meeting', 'daily', 'review', 'deploy', 'idea', 'fix']

export function Editor({ entry, onSave, onDelete }: EditorProps) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (entry) {
      setTitle(entry.title)
      setBody(entry.body)
      setTags(entry.tags)
    } else {
      setTitle('')
      setBody('')
      setTags([])
    }
    setDirty(false)
    setTagInput('')
  }, [entry])

  const handleSave = async () => {
    if (!title.trim()) return
    setSaving(true)
    try {
      await onSave(title, body, tags)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setTags([...tags, t])
      setDirty(true)
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
    setDirty(true)
  }

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    }
  }

  if (!entry && entry !== null) {
    return (
      <div className="flex-1 flex items-center justify-center text-zinc-500">
        <p>Selecione ou crie uma anotação</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950" data-color-mode="dark">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-zinc-700 bg-zinc-900">
        <input
          type="text"
          placeholder="Título da anotação..."
          value={title}
          onChange={(e) => { setTitle(e.target.value); setDirty(true) }}
          className="flex-1 bg-transparent text-white text-xl font-semibold outline-none placeholder-zinc-600 mr-4"
        />
        <div className="flex gap-2">
          {entry && (
            <button
              onClick={() => onDelete(entry.id)}
              className="text-red-400 hover:text-red-300 text-sm px-3 py-1 rounded-md border border-red-800 hover:border-red-600 transition-colors"
            >
              Excluir
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-4 py-1.5 rounded-md transition-colors"
          >
            {saving ? 'Salvando...' : dirty ? '💾 Salvar' : '✓ Salvo'}
          </button>
        </div>
      </div>

      {/* Tags */}
      <div className="flex items-center gap-2 px-6 py-2 border-b border-zinc-800 bg-zinc-900 flex-wrap">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 bg-zinc-700 text-zinc-200 text-xs px-2 py-0.5 rounded-full"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="text-zinc-400 hover:text-white ml-0.5 leading-none"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          placeholder="Adicionar tag..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          className="bg-transparent text-zinc-300 text-xs outline-none placeholder-zinc-600 w-28"
        />
        <div className="flex gap-1 ml-auto">
          {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).slice(0, 4).map((t) => (
            <button
              key={t}
              onClick={() => addTag(t)}
              className="text-[10px] text-zinc-500 hover:text-zinc-300 border border-zinc-700 hover:border-zinc-500 px-1.5 py-0.5 rounded transition-colors"
            >
              +{t}
            </button>
          ))}
        </div>
      </div>

      {/* Markdown Editor */}
      <div className="flex-1 overflow-hidden">
        <MDEditor
          value={body}
          onChange={(val) => { setBody(val ?? ''); setDirty(true) }}
          height="100%"
          preview="live"
          style={{ height: '100%', borderRadius: 0 }}
        />
      </div>
    </div>
  )
}
