export interface Entry {
  id: number
  title: string
  body: string
  tags: string[]
  created_at: string
  updated_at: string
}

export interface JournalAPI {
  getAll: () => Promise<Entry[]>
  create: (title: string, body: string, tags: string[]) => Promise<Entry>
  update: (id: number, title: string, body: string, tags: string[]) => Promise<Entry | null>
  delete: (id: number) => Promise<void>
  search: (query: string) => Promise<Entry[]>
}

declare global {
  interface Window {
    journal: JournalAPI
  }
}
