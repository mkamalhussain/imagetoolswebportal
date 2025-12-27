import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { users, towns, cities, countries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { adminMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const pendingUsers = await db.select({
      id: users.id,
      email: users.email,
      fullName: users.fullName,
      townId: users.townId,
      cityId: users.cityId,
      countryId: users.countryId,
      verificationStatus: users.verificationStatus,
      proofOfResidence: users.proofOfResidence,
      identityProof: users.identityProof,
      verificationNotes: users.verificationNotes,
      createdAt: users.createdAt,
      town: towns.name,
      city: cities.name,
      country: countries.name,
    })
      .from(users)
      .leftJoin(towns, eq(users.townId, towns.id))
      .leftJoin(cities, eq(users.cityId, cities.id))
      .leftJoin(countries, eq(users.countryId, countries.id))
      .where(eq(users.verificationStatus, 'pending'));

    res.status(200).json({ users: pendingUsers });
  } catch (error: any) {
    console.error('Get pending users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default adminMiddleware(handler);

