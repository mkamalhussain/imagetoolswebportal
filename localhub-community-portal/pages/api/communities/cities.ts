import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { cities, countries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { countryId } = req.query;

    if (!countryId) {
      return res.status(400).json({ error: 'Country ID required' });
    }

    // Get cities for the specified country
    const cityList = await db.select({
      id: cities.id,
      name: cities.name,
      countryId: cities.countryId,
      countryName: countries.name,
    })
      .from(cities)
      .leftJoin(countries, eq(cities.countryId, countries.id))
      .where(eq(cities.countryId, Number(countryId)))
      .orderBy(cities.name);

    res.status(200).json({ cities: cityList });
  } catch (error: any) {
    console.error('Get cities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

