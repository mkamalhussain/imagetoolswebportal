import { db } from '../lib/db';
import { towns, cities } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function populateTowns() {
  console.log('Starting town population...');

  // Get the default city
  const [city] = await db.select().from(cities).limit(1);

  if (!city) {
    console.log('No city found. Run seed script first.');
    return;
  }

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

  console.log(`Creating ${sampleTowns.length} towns for ${city.name}...`);

  for (const townData of sampleTowns) {
    try {
      // Check if town already exists
      const existing = await db.select()
        .from(towns)
        .where(eq(towns.name, townData.name))
        .limit(1);

      if (existing.length > 0) {
        console.log(`Town "${townData.name}" already exists, skipping...`);
        continue;
      }

      const [town] = await db.insert(towns).values({
        name: townData.name,
        cityId: city.id,
        description: townData.description,
      }).returning();

      console.log(`Created town: ${town.name}`);
    } catch (error) {
      console.error(`Failed to create town "${townData.name}":`, error);
    }
  }

  // Count total towns
  const totalTowns = await db.select().from(towns);
  console.log(`Total towns in database: ${totalTowns.length}`);
  console.log('Town population completed!');
}

populateTowns()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Town population error:', error);
    process.exit(1);
  });

