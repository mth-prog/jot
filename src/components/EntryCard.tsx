import { useState } from 'react'
import MDEditor from '@uiw/react-md-editor'
import type { Entry, EntryVisibility } from '../types'

interface EntryCardProps {
  entry: Entry
  onSave: (id: number, title: string, body: string, tags: string[], visibility: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}m atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d atrás`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

export function EntryCard({ entry, onSave, onDelete }: EntryCardProps) {
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
    <article className="bg-[#18181b] border border-[#2a2a2e] rounded-xl mb-3 overflow-hidden transition-shadow hover:shadow-lg hover:shadow-black/30">
      {editing ? (
        <div data-color-mode="dark">
          {/* Edit header */}
          <div className="flex items-center gap-2 px-4 pt-4 pb-2">
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Título..."
              className="flex-1 bg-transparent text-white font-semibold text-sm outline-none placeholder-zinc-600"
            />
            <button
              onClick={() => setVisibility(v => v === 'private' ? 'shared' : 'private')}
              title={visibility === 'private' ? 'Privado' : 'Compartilhado'}
              className="text-zinc-500 hover:text-zinc-300 text-base transition-colors"
            >
              {visibility === 'private' ? '🔒' : '🌐'}
            </button>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2">
            {tags.map(t => (
              <span key={t} className="flex items-center gap-1 bg-[#27272a] text-zinc-300 text-[11px] px-2 py-0.5 rounded-full">
                #{t}
                <button onClick={() => setTags(prev => prev.filter(x => x !== t))} className="text-zinc-500 hover:text-white ml-0.5">×</button>
              </span>
            ))}
            <input
              type="text" placeholder="+ tag" value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) } }}
              className="bg-transparent text-zinc-400 text-[11px] outline-none placeholder-zinc-600 w-16"
            />
          </div>

          <div className="border-t border-[#2a2a2e]">
            <MDEditor value={body} onChange={val => setBody(val ?? '')} height={300} preview="live" style={{ borderRadius: 0 }} />
          </div>

          <div className="flex justify-end gap-2 px-4 py-3 border-t border-[#2a2a2e] bg-[#111113]">
            <button onClick={handleCancel} className="text-zinc-500 hover:text-zinc-300 text-sm px-3 py-1 rounded transition-colors">Cancelar</button>
            <button
              onClick={handleSave} disabled={saving || !title.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm px-4 py-1.5 rounded-lg transition-colors"
            >
              {saving ? 'Salvando...' : '💾 Salvar'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-3 px-4 pt-4 pb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-zinc-100 font-semibold text-sm truncate flex-1">
                  {entry.title || <span className="text-zinc-600 italic">Sem título</span>}
                </h3>
                <span title={entry.visibility === 'private' ? 'Privado' : 'Compartilhado'} className="text-xs text-zinc-600">
                  {entry.visibility === 'private' ? '🔒' : '🌐'}
                </span>
                <span className="text-[11px] text-zinc-600 whitespace-nowrap">{timeAgo(entry.updated_at)}</span>
              </div>
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.tags.map(t => (
                    <span key={t} className="text-[10px] bg-[#27272a] text-zinc-400 px-1.5 py-0.5 rounded-full">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {entry.body && (
            <div
              className="px-4 pb-3 cursor-pointer"
              onClick={() => setExpanded(e => !e)}
            >
              {/* Markdown sempre renderizado — só a altura varia */}
              <div
                data-color-mode="dark"
                style={{
                  maxHeight: expanded ? '9999px' : '7.5rem', // ~5 linhas colapsado
                  overflow: 'hidden',
                  transition: 'max-height 0.25s ease',
                }}
              >
                <MDEditor.Markdown
                  source={entry.body}
                  style={{ background: 'transparent', fontSize: 13, color: '#a1a1aa', lineHeight: 1.6 }}
                />
              </div>
              {/* Fade gradient quando colapsado e há conteúdo longo */}
              {!expanded && entry.body.length > 200 && (
                <div className="h-6 -mt-6 bg-gradient-to-t from-[#18181b] to-transparent pointer-events-none" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-2 border-t border-[#27272a]">
            <button onClick={() => setExpanded(e => !e)} className="text-[11px] text-zinc-600 hover:text-zinc-400 transition-colors">
              {expanded ? '▲ Recolher' : '▼ Expandir'}
            </button>
            <div className="flex gap-3">
              <button onClick={() => setEditing(true)} className="text-[11px] text-zinc-500 hover:text-indigo-400 transition-colors">✏️ Editar</button>
              <button onClick={() => onDelete(entry.id)} className="text-[11px] text-zinc-600 hover:text-red-400 transition-colors">🗑️ Excluir</button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}
