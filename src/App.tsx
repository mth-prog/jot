import { useState, useEffect } from 'react'
import './types'
import type { Entry } from './types'
import { useEntries } from './hooks/useEntries'
import { Sidebar } from './components/Sidebar'
import { Editor } from './components/Editor'

function App() {
  const { entries, loading, create, update, remove, search } = useEntries()
  const [selected, setSelected] = useState<Entry | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([])

  useEffect(() => {
    setDisplayedEntries(entries)
  }, [entries])

  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (!q.trim()) {
      setDisplayedEntries(entries)
    } else {
      const results = await search(q)
      setDisplayedEntries(results)
    }
  }

  const handleNew = () => {
    setSelected({ id: 0, title: '', body: '', tags: [], created_at: '', updated_at: '' })
    setIsNew(true)
  }

  const handleSelect = (entry: Entry) => {
    setSelected(entry)
    setIsNew(false)
  }

  const handleSave = async (title: string, body: string, tags: string[]) => {
    if (isNew || !selected || selected.id === 0) {
      const created = await create(title, body, tags)
      setSelected(created)
      setIsNew(false)
    } else {
      await update(selected.id, title, body, tags)
      setSelected({ ...selected, title, body, tags })
    }
  }

  const handleDelete = async (id: number) => {
    await remove(id)
    setSelected(null)
    setIsNew(false)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-zinc-950 items-center justify-center text-zinc-400">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-100 overflow-hidden">
      <Sidebar
        entries={displayedEntries}
        selectedId={selected?.id ?? null}
        onSelect={handleSelect}
        onNew={handleNew}
        searchQuery={searchQuery}
        onSearch={handleSearch}
      />
      {selected ? (
        <Editor entry={selected} onSave={handleSave} onDelete={handleDelete} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-3">
          <span className="text-5xl">📓</span>
          <p className="text-lg font-medium text-zinc-400">Work Journal</p>
          <p className="text-sm">Selecione uma anotação ou clique em <strong>+ Novo</strong></p>
        </div>
      )}
    </div>
  )
}

export default App
