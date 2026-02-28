import type { Entry } from '../types'
import { EntryCard } from './EntryCard'
import { QuickInput } from './QuickInput'

interface FeedProps {
  entries: Entry[]
  searchQuery: string
  onSearch: (q: string) => void
  onCreate: (title: string, body: string, tags: string[], visibility: string) => Promise<void>
  onSave: (id: number, title: string, body: string, tags: string[], visibility: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  activeFilter: string | null
  activeDate: string | null
  activeTag: string | null
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.099zm-5.242 1.656a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11z"/>
  </svg>
)

export function Feed({
  entries,
  searchQuery,
  onSearch,
  onCreate,
  onSave,
  onDelete,
  activeFilter,
  activeDate,
  activeTag,
}: FeedProps) {
  const activeLabel = activeDate
    ? new Date(activeDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })
    : activeFilter
    ? activeFilter
    : activeTag
    ? `#${activeTag}`
    : null

  return (
    <main
      className="flex-1 flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--c-base)' }}
    >
      {/* Search header */}
      <div
        className="flex items-center gap-3 px-6 py-3 shrink-0"
        style={{ borderBottom: '1px solid var(--c-border)' }}
      >
        <div className="flex-1 relative">
          <span
            className="absolute top-1/2 -translate-y-1/2"
            style={{ left: 12, color: 'var(--c-text-3)', pointerEvents: 'none' }}
          >
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar anotações..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="w-full outline-none font-mono-j"
            style={{
              background: 'var(--c-surface)',
              border: `1px solid ${searchQuery ? 'var(--c-accent)' : 'var(--c-border)'}`,
              borderRadius: 8,
              paddingLeft: 36, paddingRight: 14,
              paddingTop: 7, paddingBottom: 7,
              fontSize: 13,
              color: 'var(--c-text)',
              transition: 'border-color 0.15s',
            }}
          />
        </div>
        <span
          className="font-mono-j whitespace-nowrap"
          style={{ fontSize: 10, color: 'var(--c-text-3)' }}
        >
          {entries.length} resultado{entries.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Active filter badge */}
        {activeLabel && (
          <div className="mb-5 flex items-center gap-2">
            <span
              className="font-mono-j"
              style={{
                fontSize: 10,
                padding: '3px 10px',
                borderRadius: 9999,
                border: '1px solid var(--c-accent)',
                background: 'var(--c-accent-dim)',
                color: 'var(--c-accent)',
              }}
            >
              {activeLabel}
            </span>
            <button
              onClick={() => {
                if (activeDate) onSearch('')
                if (activeTag) onSearch('')
              }}
              className="font-mono-j"
              style={{ color: 'var(--c-text-3)', fontSize: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              ×
            </button>
          </div>
        )}

        {/* Quick input */}
        {!activeDate && !activeFilter && !activeTag && !searchQuery && (
          <QuickInput onCreate={onCreate} />
        )}

        {/* Entry list */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24" style={{ color: 'var(--c-text-3)' }}>
            <div
              className="font-display"
              style={{ fontSize: 36, color: 'var(--c-border-hi)', marginBottom: 12, fontStyle: 'italic' }}
            >
              {searchQuery ? '∅' : '✦'}
            </div>
            <p style={{ fontSize: 13, color: 'var(--c-text-3)' }}>
              {searchQuery ? 'Nenhum resultado encontrado.' : 'Nenhuma anotação aqui ainda.'}
            </p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onSave={onSave}
              onDelete={onDelete}
              animDelay={i * 40}
            />
          ))
        )}
      </div>
    </main>
  )
}
