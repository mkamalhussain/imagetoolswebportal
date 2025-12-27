import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { countries, cities, towns } from '@/lib/db/schema';
import { adminMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const allCountries = await db.select().from(countries);
    const allCities = await db.select().from(cities);
    const allTowns = await db.select().from(towns);

    // Build hierarchical structure
    const hierarchy = allCountries.map((country) => ({
      ...country,
      cities: allCities
        .filter((city) => city.countryId === country.id)
        .map((city) => ({
          ...city,
          towns: allTowns.filter((town) => town.cityId === city.id),
        })),
    }));

    res.status(200).json({ hierarchy });
  } catch (error: any) {
    console.error('List communities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default adminMiddleware(handler);

