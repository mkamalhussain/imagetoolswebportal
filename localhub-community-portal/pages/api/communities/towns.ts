import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { towns, cities, countries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { cityId } = req.query;

    if (!cityId) {
      return res.status(400).json({ error: 'City ID required' });
    }

    // Get towns for the specified city
    const townList = await db.select({
      id: towns.id,
      name: towns.name,
      description: towns.description,
      cityId: towns.cityId,
      cityName: cities.name,
      countryName: countries.name,
    })
      .from(towns)
      .leftJoin(cities, eq(towns.cityId, cities.id))
      .leftJoin(countries, eq(cities.countryId, countries.id))
      .where(eq(towns.cityId, Number(cityId)))
      .orderBy(towns.name);

    res.status(200).json({ towns: townList });
  } catch (error: any) {
    console.error('Get towns error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

