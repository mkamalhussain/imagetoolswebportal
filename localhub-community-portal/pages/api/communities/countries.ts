import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { countries } from '@/lib/db/schema';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    // Get all countries
    const countryList = await db.select().from(countries).orderBy(countries.name);

    res.status(200).json({ countries: countryList });
  } catch (error: any) {
    console.error('Get countries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

