import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { services, users, villages, serviceReviews } from '@/lib/db/schema';
import { eq, and, desc, avg } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { category, villageId } = req.query;

    const conditions = [eq(services.status, 'active')];

    if (category) {
      conditions.push(eq(services.category, String(category)));
    }

    if (villageId) {
      conditions.push(eq(services.townId, Number(villageId)));
    }

    const serviceList = await db.select({
      id: services.id,
      title: services.title,
      description: services.description,
      category: services.category,
      providerId: services.providerId,
      providerName: users.fullName,
      villageName: villages.name,
      rateType: services.rateType,
      rateAmount: services.rateAmount,
      isPremium: services.isPremium,
      createdAt: services.createdAt,
    })
      .from(services)
      .leftJoin(users, eq(services.providerId, users.id))
      .leftJoin(villages, eq(services.villageId, villages.id))
      .where(and(...conditions))
      .orderBy(desc(services.isPremium), desc(services.createdAt))
      .limit(50);

    // Get average ratings for each service
    const servicesWithRatings = await Promise.all(
      serviceList.map(async (service) => {
        const [rating] = await db
          .select({ avgRating: avg(serviceReviews.rating) })
          .from(serviceReviews)
          .where(eq(serviceReviews.serviceId, service.id));
        
        return {
          ...service,
          averageRating: rating?.avgRating || 0,
        };
      })
    );

    res.status(200).json({ services: servicesWithRatings });
  } catch (error: any) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

