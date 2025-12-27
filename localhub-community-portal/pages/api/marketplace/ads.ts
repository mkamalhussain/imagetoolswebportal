import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { marketplaceAds, users, villages } from '@/lib/db/schema';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { category, minPrice, maxPrice, villageId, search } = req.query;

    const conditions = [eq(marketplaceAds.status, 'active')];

    if (category) {
      conditions.push(eq(marketplaceAds.category, String(category)));
    }

    if (villageId) {
      conditions.push(eq(marketplaceAds.townId, Number(villageId)));
    }

    if (minPrice) {
      conditions.push(gte(marketplaceAds.price, Number(minPrice) * 100)); // Convert to cents
    }

    if (maxPrice) {
      conditions.push(lte(marketplaceAds.price, Number(maxPrice) * 100));
    }

    let ads = await db.select({
      id: marketplaceAds.id,
      title: marketplaceAds.title,
      description: marketplaceAds.description,
      price: marketplaceAds.price,
      category: marketplaceAds.category,
      sellerId: marketplaceAds.sellerId,
      sellerName: users.fullName,
      villageName: villages.name,
      isPremium: marketplaceAds.isPremium,
      createdAt: marketplaceAds.createdAt,
    })
      .from(marketplaceAds)
      .leftJoin(users, eq(marketplaceAds.sellerId, users.id))
      .leftJoin(villages, eq(marketplaceAds.villageId, villages.id))
      .where(and(...conditions))
      .orderBy(desc(marketplaceAds.isPremium), desc(marketplaceAds.createdAt))
      .limit(50);

    // Filter by search if provided
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      ads = ads.filter((ad) =>
        ad.title?.toLowerCase().includes(searchLower) ||
        ad.description?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ ads });
  } catch (error: any) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

