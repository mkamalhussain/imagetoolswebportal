import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { countries, cities, towns } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { adminMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';
import { sanitizeInput } from '@/lib/utils/sanitize';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { type, name, parentId, description } = req.body; // type: 'country', 'city', 'town'

    if (!type || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sanitizedName = sanitizeInput(name);
    const sanitizedDescription = description ? sanitizeInput(description) : null;

    if (type === 'country') {
      const [country] = await db.insert(countries).values({
        name: sanitizedName,
        code: sanitizedName.substring(0, 3).toUpperCase(),
      }).returning();
      return res.status(201).json({ country });
    }

    if (type === 'city') {
      if (!parentId) {
        return res.status(400).json({ error: 'Country ID required for city' });
      }
      const [city] = await db.insert(cities).values({
        name: sanitizedName,
        countryId: parentId,
      }).returning();
      return res.status(201).json({ city });
    }

    if (type === 'town') {
      if (!parentId) {
        return res.status(400).json({ error: 'City ID required for town' });
      }
      const [town] = await db.insert(towns).values({
        name: sanitizedName,
        cityId: parentId,
        description: sanitizedDescription,
      }).returning();
      return res.status(201).json({ town });
    }

    return res.status(400).json({ error: 'Invalid type' });
  } catch (error: any) {
    console.error('Create community error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default adminMiddleware(handler);

