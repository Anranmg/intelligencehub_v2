import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

const dataDir = path.resolve('data');
fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'intelligence.db'));

const requiredColumns = {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  content: 'TEXT NOT NULL DEFAULT ""',
  image_data: 'TEXT',
  structured_json: 'TEXT NOT NULL DEFAULT "{}"',
  summary: 'TEXT NOT NULL DEFAULT ""',
  contributor_name: 'TEXT',
  is_public: 'INTEGER NOT NULL DEFAULT 1',
  created_at: 'TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP'
};

function migrate() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS intelligence (
      id INTEGER PRIMARY KEY AUTOINCREMENT
    )
  `);

  const existing = db.prepare('PRAGMA table_info(intelligence)').all().map((row) => row.name);

  for (const [name, definition] of Object.entries(requiredColumns)) {
    if (!existing.includes(name)) {
      db.exec(`ALTER TABLE intelligence ADD COLUMN ${name} ${definition}`);
    }
  }
}

migrate();

export default db;
