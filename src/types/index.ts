export type EntryVisibility = 'private' | 'shared'

export interface Entry {
  id: number
  title: string
  body: string
  tags: string[]
  visibility: EntryVisibility
  created_at: string
  updated_at: string
}

export interface DateCount {
  date: string
  count: number
}

export interface JournalAPI {
  getAll:    ()                                                                          => Promise<Entry[]>
  getByDate: (date: string)                                                              => Promise<Entry[]>
  getDates:  ()                                                                          => Promise<DateCount[]>
  create:    (title: string, body: string, tags: string[], visibility?: string)         => Promise<Entry>
  update:    (id: number, title: string, body: string, tags: string[], visibility?: string) => Promise<Entry | null>
  delete:    (id: number)                                                                => Promise<void>
  search:    (query: string)                                                             => Promise<Entry[]>
}

declare global {
  interface Window {
    journal: JournalAPI
  }
}
