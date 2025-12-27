import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { users, towns, cities, countries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user with related data
    const [user] = await db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      bio: users.bio,
      profilePic: users.profilePic,
      townId: users.townId,
      cityId: users.cityId,
      countryId: users.countryId,
      isVerified: users.isVerified,
      isAdmin: users.isAdmin,
      isPremium: users.isPremium,
      visibleToOtherCities: users.visibleToOtherCities,
      visibleToOtherVillages: users.visibleToOtherVillages,
      createdAt: users.createdAt,
      town: towns.name,
      city: cities.name,
      country: countries.name,
    })
      .from(users)
      .leftJoin(towns, eq(users.townId, towns.id))
      .leftJoin(cities, eq(users.cityId, cities.id))
      .leftJoin(countries, eq(users.countryId, countries.id))
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error: any) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

