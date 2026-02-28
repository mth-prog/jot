import { app, BrowserWindow, ipcMain } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";
const require$1 = createRequire(import.meta.url);
const Database = require$1("better-sqlite3");
const dbPath = path.join(app.getPath("userData"), "work-journal.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    body       TEXT NOT NULL DEFAULT '',
    tags       TEXT NOT NULL DEFAULT '[]',
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
`);
const existingCols = db.prepare("PRAGMA table_info(entries)").all().map((c) => c.name);
if (!existingCols.includes("visibility")) db.exec("ALTER TABLE entries ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private'");
const entryDb = {
  getAll() {
    return db.prepare("SELECT * FROM entries ORDER BY created_at DESC").all();
  },
  getById(id) {
    return db.prepare("SELECT * FROM entries WHERE id = ?").get(id);
  },
  getByDate(date) {
    return db.prepare(
      "SELECT * FROM entries WHERE DATE(created_at) = ? ORDER BY created_at DESC"
    ).all(date);
  },
  getDatesWithEntries() {
    return db.prepare(
      "SELECT DATE(created_at) as date, COUNT(*) as count FROM entries GROUP BY DATE(created_at)"
    ).all();
  },
  create(title, body, tags, visibility = "private") {
    const result = db.prepare("INSERT INTO entries (title, body, tags, visibility) VALUES (?, ?, ?, ?)").run(title, body, JSON.stringify(tags), visibility);
    return this.getById(result.lastInsertRowid);
  },
  update(id, title, body, tags, visibility) {
    const current = this.getById(id);
    if (!current) return null;
    db.prepare(
      "UPDATE entries SET title=?, body=?, tags=?, visibility=?, updated_at=CURRENT_TIMESTAMP WHERE id=?"
    ).run(title, body, JSON.stringify(tags), visibility ?? current.visibility, id);
    return this.getById(id) ?? null;
  },
  delete(id) {
    db.prepare("DELETE FROM entries WHERE id = ?").run(id);
  },
  search(query) {
    return db.prepare(
      `SELECT e.* FROM entries e
         JOIN entries_fts fts ON fts.rowid = e.id
         WHERE entries_fts MATCH ?
         ORDER BY rank`
    ).all(query + "*");
  }
};
const __dirname$1 = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname$1, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "electron-vite.svg"),
    webPreferences: {
      preload: path.join(__dirname$1, "preload.mjs")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(() => {
  registerIpcHandlers();
  createWindow();
});
function registerIpcHandlers() {
  ipcMain.handle("entries:getAll", () => entryDb.getAll());
  ipcMain.handle("entries:getByDate", (_e, date) => entryDb.getByDate(date));
  ipcMain.handle("entries:getDates", () => entryDb.getDatesWithEntries());
  ipcMain.handle("entries:getByType", (_e, type) => entryDb.getByType(type));
  ipcMain.handle(
    "entries:create",
    (_e, title, body, tags, type, visibility) => entryDb.create(title, body, tags, type, visibility)
  );
  ipcMain.handle(
    "entries:update",
    (_e, id, title, body, tags, type, visibility) => entryDb.update(id, title, body, tags, type, visibility)
  );
  ipcMain.handle("entries:delete", (_e, id) => entryDb.delete(id));
  ipcMain.handle("entries:search", (_e, query) => entryDb.search(query));
}
export {
  MAIN_DIST,
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
