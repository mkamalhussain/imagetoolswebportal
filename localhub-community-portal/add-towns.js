const Database = require('better-sqlite3');
const db = new Database('./localhub.db');

// Create towns table
db.exec(`CREATE TABLE IF NOT EXISTS towns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  city_id INTEGER NOT NULL,
  description TEXT,
  created_at INTEGER DEFAULT (unixepoch())
)`);

// Insert sample towns
db.exec(`INSERT INTO towns (name, city_id, description) VALUES
  ('North Town', 1, 'Welcome to North Town!'),
  ('South Town', 1, 'Welcome to South Town!'),
  ('East Town', 1, 'Welcome to East Town!'),
  ('West Town', 1, 'Welcome to West Town!'),
  ('Central Town', 1, 'Welcome to Central Town!')`);

console.log('✅ Towns table created and populated');
db.close();