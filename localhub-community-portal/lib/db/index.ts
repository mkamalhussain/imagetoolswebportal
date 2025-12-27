import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DATABASE_PATH || './localhub.db';

// Ensure upload directories exist
const uploadDirs = [
  path.join(process.cwd(), 'public', 'uploads'),
  path.join(process.cwd(), 'public', 'uploads', 'proofs'),
  path.join(process.cwd(), 'public', 'uploads', 'images'),
];

uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create database connection
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create FTS5 virtual table for search
sqlite.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS forum_posts_fts USING fts5(
    title,
    content,
    content_rowid='rowid',
    content='forum_posts'
  );
`);

// Create triggers to keep FTS5 in sync
sqlite.exec(`
  CREATE TRIGGER IF NOT EXISTS forum_posts_fts_insert AFTER INSERT ON forum_posts BEGIN
    INSERT INTO forum_posts_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END;

  CREATE TRIGGER IF NOT EXISTS forum_posts_fts_delete AFTER DELETE ON forum_posts BEGIN
    INSERT INTO forum_posts_fts(forum_posts_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
  END;

  CREATE TRIGGER IF NOT EXISTS forum_posts_fts_update AFTER UPDATE ON forum_posts BEGIN
    INSERT INTO forum_posts_fts(forum_posts_fts, rowid, title, content) VALUES('delete', old.id, old.title, old.content);
    INSERT INTO forum_posts_fts(rowid, title, content) VALUES (new.id, new.title, new.content);
  END;
`);

export const db = drizzle(sqlite, { schema });

export default db;

