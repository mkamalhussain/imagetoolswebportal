const Database = require('better-sqlite3');
const db = new Database('./localhub.db');

// Create towns table
db.exec(`CREATE TABLE IF NOT EXISTS towns (
  id INTEGER PRIMARY KEY,
  name TEXT,
  city_id INTEGER,
  description TEXT
)`);

// Insert sample towns
db.exec(`INSERT OR IGNORE INTO towns (id, name, city_id, description)
VALUES
  (1, 'North Town', 1, 'Sample town'),
  (2, 'South Town', 1, 'Sample town'),
  (3, 'East Town', 1, 'Sample town'),
  (4, 'West Town', 1, 'Sample town'),
  (5, 'Central Town', 1, 'Sample town')`);

console.log('✅ Towns table created and populated');
db.close();