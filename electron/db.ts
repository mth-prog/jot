import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

const dbPath = path.join(app.getPath('userData'), 'work-journal.db')
const db = new Database(dbPath)

db.pragma('journal_mode = WAL')

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    tags       TEXT NOT NULL DEFAULT '[]',
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

export interface EntryRow {
  id: number
  title: string
  body: string
  tags: string
  created_at: string
  updated_at: string
}

export const entryDb = {
  getAll(): EntryRow[] {
    return db.prepare('SELECT * FROM entries ORDER BY updated_at DESC').all() as EntryRow[]
  },

  getById(id: number): EntryRow | undefined {
    return db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as EntryRow | undefined
  },

  create(title: string, body: string, tags: string[]): EntryRow {
    const result = db
      .prepare('INSERT INTO entries (title, body, tags) VALUES (?, ?, ?)')
      .run(title, body, JSON.stringify(tags))
    return this.getById(result.lastInsertRowid as number)!
  },

  update(id: number, title: string, body: string, tags: string[]): EntryRow | null {
    db.prepare(
      'UPDATE entries SET title = ?, body = ?, tags = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).run(title, body, JSON.stringify(tags), id)
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
