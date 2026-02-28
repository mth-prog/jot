import { useState, useEffect, useCallback } from 'react'
import './types'
import type { Entry } from './types'
import { useEntries } from './hooks/useEntries'
import { NavBar } from './components/NavBar'
import { ContextPanel } from './components/ContextPanel'
import { Feed } from './components/Feed'
import type { NavView } from './components/NavBar'

function App() {
  const { entries, dates, loading, create, update, remove, search, getByDate } = useEntries()

  const [activeNav, setActiveNav] = useState<NavView>('feed')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeDate, setActiveDate] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [displayedEntries, setDisplayedEntries] = useState<Entry[]>([])

  useEffect(() => {
    async function compute() {
      if (searchQuery.trim()) {
        setDisplayedEntries(await search(searchQuery))
      } else if (activeDate) {
        setDisplayedEntries(await getByDate(activeDate))
      } else if (activeTag) {
        setDisplayedEntries(entries.filter(e => e.tags.includes(activeTag)))
      } else {
        setDisplayedEntries(entries)
      }
    }
    compute()
  }, [entries, searchQuery, activeDate, activeTag, search, getByDate])

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    setActiveDate(null)
    setActiveTag(null)
  }, [])

  const handleFilterDate = useCallback((date: string | null) => {
    setActiveDate(date)
    setActiveTag(null)
    setSearchQuery('')
  }, [])

  const handleFilterTag = useCallback((tag: string | null) => {
    setActiveTag(tag)
    setActiveDate(null)
    setSearchQuery('')
  }, [])

  const handleCreate = useCallback(
    async (title: string, body: string, tags: string[], visibility: string) => {
      await create(title, body, tags, visibility)
    },
    [create]
  )

  const handleSave = useCallback(
    async (id: number, title: string, body: string, tags: string[], visibility: string) => {
      await update(id, title, body, tags, visibility)
    },
    [update]
  )

  const handleDelete = useCallback(async (id: number) => {
    await remove(id)
  }, [remove])

  if (loading) {
    return (
      <div
        className="flex h-screen items-center justify-center flex-col gap-3"
        style={{ background: 'var(--c-base)' }}
      >
        <div className="font-display" style={{ color: 'var(--c-accent)', fontSize: 32, fontStyle: 'italic', fontWeight: 700 }}>J</div>
        <p className="font-mono-j" style={{ color: 'var(--c-text-3)', fontSize: 11 }}>a carregar…</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--c-base)', color: 'var(--c-text)' }}>
      <NavBar active={activeNav} onChange={setActiveNav} />

      <ContextPanel
        entries={entries}
        dates={dates}
        onFilterDate={handleFilterDate}
        onFilterTag={handleFilterTag}
        activeTag={activeTag}
        activeDate={activeDate}
      />

      <Feed
        entries={displayedEntries}
        searchQuery={searchQuery}
        onSearch={handleSearch}
        onCreate={handleCreate}
        onSave={handleSave}
        onDelete={handleDelete}
        activeFilter={null}
        activeDate={activeDate}
        activeTag={activeTag}
      />
    </div>
  )
}

export default App
