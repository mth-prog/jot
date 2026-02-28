import type { Entry } from '../types'
import { EntryCard } from './EntryCard'
import { QuickInput } from './QuickInput'

interface FeedProps {
  entries: Entry[]
  searchQuery: string
  onSearch: (q: string) => void
  onCreate: (title: string, body: string, tags: string[], type: string, visibility: string) => Promise<void>
  onSave: (id: number, title: string, body: string, tags: string[], type: string, visibility: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  activeFilter: string | null
  activeDate: string | null
  activeTag: string | null
}

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
    ? `📅 ${new Date(activeDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}`
    : activeFilter
    ? `Filtro: ${activeFilter}`
    : activeTag
    ? `#${activeTag}`
    : null

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#0c0c0e]">
      {/* Feed header / search */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[#2a2a2e] shrink-0">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar em todas as anotações..."
            value={searchQuery}
            onChange={e => onSearch(e.target.value)}
            className="w-full bg-[#18181b] border border-[#2a2a2e] text-zinc-200 placeholder-zinc-600 text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <span className="text-zinc-600 text-xs whitespace-nowrap">{entries.length} resultado{entries.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Scrollable area */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {/* Active filter badge */}
        {activeLabel && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-xs bg-indigo-600/20 text-indigo-400 px-3 py-1 rounded-full border border-indigo-600/30">
              {activeLabel}
            </span>
          </div>
        )}

        {/* Quick input (only when no date/type filter) */}
        {!activeDate && !activeFilter && !activeTag && !searchQuery && (
          <QuickInput onCreate={onCreate} />
        )}

        {/* Entry list */}
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <span className="text-4xl mb-3">📭</span>
            <p className="text-sm">
              {searchQuery ? 'Nenhum resultado encontrado.' : 'Nenhuma anotação aqui ainda.'}
            </p>
          </div>
        ) : (
          entries.map(entry => (
            <EntryCard
              key={entry.id}
              entry={entry}
              onSave={onSave}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </main>
  )
}
