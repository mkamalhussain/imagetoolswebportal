import { db } from '../lib/db';
import { countries, cities, towns, users, forumCategories } from '../lib/db/schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seed...');

  // Create default country
  const [country] = await db.insert(countries).values({
    name: process.env.DEFAULT_COUNTRY || 'Sampleland',
    code: 'SAM',
  }).returning();
  console.log('✅ Created country:', country.name);

  // Create default city
  const [city] = await db.insert(cities).values({
    name: process.env.DEFAULT_CITY || 'Sample City',
    countryId: country.id,
  }).returning();
  console.log('✅ Created city:', city.name);

  // Towns will be populated by populate-towns.js script
  // For now, create mock town objects for user creation
  const createdTowns = [
    { id: 1, name: 'North Town' },
    { id: 2, name: 'South Town' },
    { id: 3, name: 'East Town' },
    { id: 4, name: 'West Town' },
    { id: 5, name: 'Central Town' },
  ];

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@localhub.example';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const [adminUser] = await db.insert(users).values({
    email: adminEmail,
    password: hashedPassword,
    fullName: 'Admin User',
    townId: createdTowns[0].id,
    cityId: city.id,
    countryId: country.id,
    isAdmin: true,
    isVerified: true,
    verificationStatus: 'approved',
  }).returning();
  console.log('✅ Created admin user:', adminUser.email, '(password: admin123)');

  // Create sample regular users
  const sampleUsers = [
    { name: 'John Doe', email: 'john@example.com', town: createdTowns[0] },
    { name: 'Jane Smith', email: 'jane@example.com', town: createdTowns[1] },
    { name: 'Bob Johnson', email: 'bob@example.com', town: createdTowns[2] },
  ];

  for (const userData of sampleUsers) {
    const password = await bcrypt.hash('password123', 10);
    const [user] = await db.insert(users).values({
      email: userData.email,
      password,
      fullName: userData.name,
      townId: userData.town.id,
      cityId: city.id,
      countryId: country.id,
      isVerified: true,
      verificationStatus: 'approved',
    }).returning();
    console.log('✅ Created user:', user.email);
  }

  // Create forum categories
  const categories = [
    { name: 'General', description: 'General discussion', icon: '💬' },
    { name: 'News', description: 'Local news and announcements', icon: '📰' },
    { name: 'Events', description: 'Community events and gatherings', icon: '🎉' },
    { name: 'Help Wanted', description: 'Requests for help and services', icon: '🙋' },
  ];

  for (const [index, categoryData] of categories.entries()) {
    const [category] = await db.insert(forumCategories).values({
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon,
      order: index,
    }).returning();
    console.log('✅ Created category:', category.name);
  }

  console.log('🎉 Seed completed successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@localhub.example / admin123');
  console.log('Regular users: john@example.com, jane@example.com, bob@example.com / password123');
}

seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed error:', error);
    process.exit(1);
  });