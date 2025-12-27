const Database = require('better-sqlite3');
const db = new Database('./localhub.db');

try {
  // Check if towns table exists
  const tables = db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all();
  const hasTowns = tables.some(t => t.name === 'towns');

  if (!hasTowns) {
    console.log('Creating towns table...');

    // Create towns table
    db.exec(`CREATE TABLE towns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      city_id INTEGER NOT NULL,
      description TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`);

    // Insert sample towns
    db.exec(`INSERT INTO towns (name, city_id, description) VALUES
      ('North Town', 1, 'Welcome to North Town! A vibrant community.'),
      ('South Town', 1, 'Welcome to South Town! A vibrant community.'),
      ('East Town', 1, 'Welcome to East Town! A vibrant community.'),
      ('West Town', 1, 'Welcome to West Town! A vibrant community.'),
      ('Central Town', 1, 'Welcome to Central Town! A vibrant community.')`);

    console.log('✅ Towns table created and populated');
  } else {
    const count = db.prepare('SELECT COUNT(*) as count FROM towns').get();
    console.log(`✅ Towns table exists with ${count.count} towns`);
  }

} catch (error) {
  console.error('❌ Database setup error:', error.message);
}

db.close();
