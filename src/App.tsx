import { useState, useEffect, useCallback } from 'react'
import './types'
import type { Entry } from './types'
import { useEntries } from './hooks/useEntries'
import { NavBar } from './components/NavBar'
import { ContextPanel } from './components/ContextPanel'
import { Feed } from './components/Feed'
import type { NavView } from './components/NavBar'

function App() {
  const { entries, dates, loading, create, update, remove, search, getByDate, getByType } = useEntries()

  const [activeNav, setActiveNav] = useState<NavView>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<string | null>(null)  // entry type
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([])

  // Recompute displayed entries whenever filters change
  useEffect(() => {
    async function compute() {
      if (searchQuery.trim()) {
        setDisplayedEntries(await search(searchQuery))
      } else if (activeDate) {
        setDisplayedEntries(await getByDate(activeDate))
      } else if (activeFilter) {
        setDisplayedEntries(await getByType(activeFilter))
      } else if (activeTag) {
        setDisplayedEntries(entries.filter(e => e.tags.includes(activeTag)))
      } else {
        setDisplayedEntries(entries)
      }
    }
    compute()
  }, [entries, searchQuery, activeDate, activeFilter, activeTag, search, getByDate, getByType])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    setActiveDate(null)
    setActiveFilter(null)
    setActiveTag(null)
  }, [])

  const handleFilterType = useCallback((type: string | null) => {
    setActiveFilter(type)
    setActiveDate(null)
    setActiveTag(null)
    setSearchQuery('')
  }, [])

  const handleFilterDate = useCallback((date: string | null) => {
    setActiveDate(date)
    setActiveFilter(null)
    setActiveTag(null)
    setSearchQuery('')
  }, [])

  const handleFilterTag = useCallback((tag: string | null) => {
    setActiveTag(tag)
    setActiveDate(null)
    setActiveFilter(null)
    setSearchQuery('')
  }, [])

  const handleCreate = useCallback(
    async (title: string, body: string, tags: string[], type: string, visibility: string) => {
      await create(title, body, tags, type, visibility)
    },
    [create]
  )

  const handleSave = useCallback(
    async (id: number, title: string, body: string, tags: string[], type: string, visibility: string) => {
      await update(id, title, body, tags, type, visibility)
    },
    [update]
  )

  const handleDelete = useCallback(async (id: number) => {
    await remove(id)
  }, [remove])

  if (loading) {
    return (
      <div className="flex h-screen bg-[#0c0c0e] items-center justify-center text-zinc-500 text-sm">
        Carregando...
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#0c0c0e] text-zinc-100 overflow-hidden">
      {/* Narrow icon nav */}
      <NavBar active={activeNav} onChange={setActiveNav} />

      {/* Context panel */}
      <ContextPanel
        entries={entries}
        dates={dates}
        activeFilter={activeFilter}
        onFilterType={handleFilterType}
        onFilterDate={handleFilterDate}
        onFilterTag={handleFilterTag}
        activeTag={activeTag}
        activeDate={activeDate}
      />

      {/* Main feed */}
      <Feed
        entries={displayedEntries}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onCreate={handleCreate}
        onSave={handleSave}
        onDelete={handleDelete}
        activeFilter={activeFilter}
        activeDate={activeDate}
        activeTag={activeTag}
      />
    </div>
  )
}

export default App
