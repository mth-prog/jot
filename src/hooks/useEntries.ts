import { useState, useEffect, useCallback } from 'react'
import '../types'
import type { Entry } from '../types'

function parseEntry(row: Entry & { tags: string | string[] }): Entry {
  return {
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
  }
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const rows = await window.journal.getAll()
    setEntries(rows.map(parseEntry))
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const create = useCallback(
    async (title: string, body: string, tags: string[]): Promise<Entry> => {
      const entry = await window.journal.create(title, body, tags)
      await refresh()
      return parseEntry(entry as Entry & { tags: string | string[] })
    },
    [refresh]
  )

  const update = useCallback(
    async (id: number, title: string, body: string, tags: string[]) => {
      await window.journal.update(id, title, body, tags)
      await refresh()
    },
    [refresh]
  )

  const remove = useCallback(
    async (id: number) => {
      await window.journal.delete(id)
      await refresh()
    },
    [refresh]
  )

  const search = useCallback(
    async (query: string): Promise<Entry[]> => {
      if (!query.trim()) return entries
      const rows = await window.journal.search(query)
      return rows.map(parseEntry)
    },
    [entries]
  )

  return { entries, loading, create, update, remove, search, refresh }
}
