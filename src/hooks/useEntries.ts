import { useState, useEffect, useCallback } from 'react'
import '../types'
import type { Entry, DateCount, EntryType, EntryVisibility } from '../types'

function parseEntry(row: Entry & { tags: string | string[] }): Entry {
  return {
    ...row,
    tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags,
    type: (row.type ?? 'note') as EntryType,
    visibility: (row.visibility ?? 'private') as EntryVisibility,
  }
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [dates, setDates] = useState<DateCount[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const [rows, dateCounts] = await Promise.all([
      window.journal.getAll(),
      window.journal.getDates(),
    ])
    setEntries(rows.map(parseEntry))
    setDates(dateCounts)
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const create = useCallback(
    async (title: string, body: string, tags: string[], type?: string, visibility?: string): Promise<Entry> => {
      const entry = await window.journal.create(title, body, tags, type, visibility)
      await refresh()
      return parseEntry(entry as Entry & { tags: string | string[] })
    },
    [refresh]
  )

  const update = useCallback(
    async (id: number, title: string, body: string, tags: string[], type?: string, visibility?: string) => {
      await window.journal.update(id, title, body, tags, type, visibility)
      await refresh()
    },
    [refresh]
  )

  const remove = useCallback(async (id: number) => {
    await window.journal.delete(id)
    await refresh()
  }, [refresh])

  const search = useCallback(async (query: string): Promise<Entry[]> => {
    if (!query.trim()) return entries
    const rows = await window.journal.search(query)
    return rows.map(parseEntry)
  }, [entries])

  const getByDate = useCallback(async (date: string): Promise<Entry[]> => {
    const rows = await window.journal.getByDate(date)
    return rows.map(parseEntry)
  }, [])

  const getByType = useCallback(async (type: string): Promise<Entry[]> => {
    const rows = await window.journal.getByType(type)
    return rows.map(parseEntry)
  }, [])

  return { entries, dates, loading, create, update, remove, search, getByDate, getByType, refresh }
}
