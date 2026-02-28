import { createRequire } from 'node:module'
import { app } from 'electron'
import path from 'node:path'

const require = createRequire(import.meta.url)
// Load native module at runtime (not bundled by Vite)
const Database = require('better-sqlite3') as typeof import('better-sqlite3')

const dbPath = path.join(app.getPath('userData'), 'work-journal.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    tags       TEXT NOT NULL DEFAULT '[]',
    type       TEXT NOT NULL DEFAULT 'note',
    visibility TEXT NOT NULL DEFAULT 'private',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE VIRTUAL TABLE IF NOT EXISTS entries_fts USING fts5(
    title, body,
    content='entries',
    content_rowid='id'
  );

  CREATE TRIGGER IF NOT EXISTS entries_ai AFTER INSERT ON entries BEGIN
    INSERT INTO entries_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
  END;

  CREATE TRIGGER IF NOT EXISTS entries_ad AFTER DELETE ON entries BEGIN
    INSERT INTO entries_fts(entries_fts, rowid, title, body) VALUES('delete', old.id, old.title, old.body);
  END;

  CREATE TRIGGER IF NOT EXISTS entries_au AFTER UPDATE ON entries BEGIN
    INSERT INTO entries_fts(entries_fts, rowid, title, body) VALUES('delete', old.id, old.title, old.body);
    INSERT INTO entries_fts(rowid, title, body) VALUES (new.id, new.title, new.body);
  END;
`)

// Migrate existing DB: add new columns if they don't exist yet
const existingCols = (db.prepare("PRAGMA table_info(entries)").all() as { name: string }[]).map(c => c.name)
if (!existingCols.includes('type'))       db.exec("ALTER TABLE entries ADD COLUMN type TEXT NOT NULL DEFAULT 'note'")
if (!existingCols.includes('visibility')) db.exec("ALTER TABLE entries ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'")

export interface EntryRow {
  id: number
  title: string
  body: string
  tags: string
  type: string
  visibility: string
  created_at: string
  updated_at: string
}

export const entryDb = {
  getAll(): EntryRow[] {
    return db.prepare('SELECT * FROM entries ORDER BY created_at DESC').all() as EntryRow[]
  },

  getById(id: number): EntryRow | undefined {
    return db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as EntryRow | undefined
  },

  getByDate(date: string): EntryRow[] {
    return db.prepare(
      "SELECT * FROM entries WHERE DATE(created_at) = ? ORDER BY created_at DESC"
    ).all(date) as EntryRow[]
  },

  getDatesWithEntries(): { date: string; count: number }[] {
    return db.prepare(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM entries GROUP BY DATE(created_at)"
    ).all() as { date: string; count: number }[]
  },

  getByType(type: string): EntryRow[] {
    return db.prepare(
      'SELECT * FROM entries WHERE type = ? ORDER BY created_at DESC'
    ).all(type) as EntryRow[]
  },

  create(title: string, body: string, tags: string[], type = 'note', visibility = 'private'): EntryRow {
    const result = db
      .prepare('INSERT INTO entries (title, body, tags, type, visibility) VALUES (?, ?, ?, ?, ?)')
      .run(title, body, JSON.stringify(tags), type, visibility)
    return this.getById(result.lastInsertRowid as number)!
  },

  update(id: number, title: string, body: string, tags: string[], type?: string, visibility?: string): EntryRow | null {
    const current = this.getById(id)
    if (!current) return null
    db.prepare(
      'UPDATE entries SET title=?, body=?, tags=?, type=?, visibility=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    ).run(title, body, JSON.stringify(tags), type ?? current.type, visibility ?? current.visibility, id)
    return this.getById(id) ?? null
  },

  delete(id: number): void {
    db.prepare('DELETE FROM entries WHERE id = ?').run(id)
  },

  search(query: string): EntryRow[] {
    return db
      .prepare(
        `SELECT e.* FROM entries e
         JOIN entries_fts fts ON fts.rowid = e.id
         WHERE entries_fts MATCH ?
         ORDER BY rank`
      )
      .all(query + '*') as EntryRow[]
  },
}

export default db

