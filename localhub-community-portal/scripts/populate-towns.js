const Database = require('better-sqlite3');

const dbPath = process.env.DATABASE_PATH || './localhub.db';
const db = new Database(dbPath);

console.log('🌆 Starting town population...');

// Get the default city
const cityQuery = db.prepare('SELECT id, name FROM cities LIMIT 1');
const city = cityQuery.get();

if (!city) {
  console.log('❌ No city found. Run seed script first.');
  db.close();
  return;
}

console.log(`🏙️ Found city: ${city.name} (ID: ${city.id})`);

// Sample towns for different areas
const sampleTowns = [
  { name: 'Downtown District', description: 'The heart of the city with shops, offices, and entertainment.' },
  { name: 'Riverside Neighborhood', description: 'Peaceful residential area along the river with parks and walking trails.' },
  { name: 'Hilltop Estates', description: 'Upscale residential area with beautiful views and modern homes.' },
  { name: 'Old Town Quarter', description: 'Historic district with cobblestone streets and heritage buildings.' },
  { name: 'Industrial Park', description: 'Business district with warehouses, factories, and commercial spaces.' },
  { name: 'University Campus', description: 'Educational area with student housing, libraries, and research facilities.' },
  { name: 'Garden District', description: 'Beautiful residential area known for its gardens, parks, and green spaces.' },
  { name: 'Marina Village', description: 'Waterfront community with docks, boats, and seaside activities.' },
  { name: 'Tech Hub', description: 'Modern business district focused on technology and innovation companies.' },
  { name: 'Cultural Center', description: 'Arts and culture district with theaters, museums, and galleries.' },
  { name: 'Sports Complex', description: 'Recreational area with stadiums, gyms, and sports facilities.' },
  { name: 'Medical District', description: 'Healthcare area with hospitals, clinics, and medical offices.' },
  { name: 'Shopping Mall Area', description: 'Commercial district with shopping centers and retail stores.' },
  { name: 'Suburban Estates', description: 'Family-friendly residential area with schools and community centers.' },
  { name: 'Business Park', description: 'Corporate area with office buildings and professional services.' },
  { name: 'Residential Heights', description: 'High-end residential area with luxury apartments and condos.' },
  { name: 'Creative Quarter', description: 'Arts district with studios, galleries, and creative workspaces.' },
  { name: 'Transit Hub', description: 'Transportation center with train stations, bus terminals, and parking.' },
  { name: 'Farmers Market District', description: 'Agricultural area with markets, farms, and food production.' },
  { name: 'Recreation Zone', description: 'Entertainment area with amusement parks, cinemas, and restaurants.' },
];

const insertTown = db.prepare(`
  INSERT OR IGNORE INTO towns (name, city_id, description, created_at)
  VALUES (?, ?, ?, unixepoch())
`);

console.log(`🏘️ Creating ${sampleTowns.length} towns for ${city.name}...`);

let created = 0;
for (const townData of sampleTowns) {
  try {
    const result = insertTown.run(townData.name, city.id, townData.description);
    if (result.changes > 0) {
      console.log(`✅ Created town: ${townData.name}`);
      created++;
    } else {
      console.log(`⚠️ Town "${townData.name}" already exists, skipping...`);
    }
  } catch (error) {
    console.error(`❌ Failed to create town "${townData.name}":`, error.message);
  }
}

// Count total towns
const countQuery = db.prepare('SELECT COUNT(*) as count FROM towns');
const result = countQuery.get();
console.log(`\n📊 Total towns in database: ${result.count}`);
console.log(`📈 Towns created this run: ${created}`);
console.log('🎉 Town population completed!');

db.close();