import type { Entry } from '../types'

interface SidebarProps {
  entries: Entry[]
  selectedId: number | null
  onSelect: (entry: Entry) => void
  onNew: () => void
  searchQuery: string
  onSearch: (q: string) => void
}

const TAG_COLORS: Record<string, string> = {
  bug: 'bg-red-700 text-red-100',
  feature: 'bg-blue-700 text-blue-100',
  meeting: 'bg-yellow-700 text-yellow-100',
  daily: 'bg-green-700 text-green-100',
  review: 'bg-purple-700 text-purple-100',
  deploy: 'bg-orange-700 text-orange-100',
}

function tagColor(tag: string) {
  return TAG_COLORS[tag.toLowerCase()] ?? 'bg-zinc-600 text-zinc-100'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function Sidebar({ entries, selectedId, onSelect, onNew, searchQuery, onSearch }: SidebarProps) {
  return (
    <aside className="w-72 min-w-[18rem] bg-zinc-900 border-r border-zinc-700 flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
        <span className="text-white font-semibold text-lg tracking-tight">📓 Work Journal</span>
        <button
          onClick={onNew}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm px-3 py-1 rounded-md transition-colors"
          title="Nova anotação"
        >
          + Novo
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-zinc-700">
        <input
          type="text"
          placeholder="Buscar anotações..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
          className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 text-sm rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Entry List */}
      <div className="flex-1 overflow-y-auto">
        {entries.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center mt-8 px-4">
            {searchQuery ? 'Nenhum resultado encontrado.' : 'Nenhuma anotação ainda. Crie uma!'}
          </p>
        ) : (
          entries.map((entry) => (
            <button
              key={entry.id}
              onClick={() => onSelect(entry)}
              className={`w-full text-left px-4 py-3 border-b border-zinc-800 hover:bg-zinc-800 transition-colors ${
                selectedId === entry.id ? 'bg-zinc-800 border-l-2 border-l-indigo-500' : ''
              }`}
            >
              <p className="text-zinc-100 text-sm font-medium truncate">{entry.title || 'Sem título'}</p>
              <p className="text-zinc-500 text-xs mt-0.5">{formatDate(entry.updated_at)}</p>
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded ${tagColor(tag)}`}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-zinc-700">
        <p className="text-zinc-600 text-xs text-center">{entries.length} anotações</p>
      </div>
    </aside>
  )
}
