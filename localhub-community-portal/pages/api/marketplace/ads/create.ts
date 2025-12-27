import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { marketplaceAds, users, marketplaceAdImages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';
import { sanitizeInput } from '@/lib/utils/sanitize';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, description, price, category, images } = req.body;

    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);

    // Create ad
    const [ad] = await db.insert(marketplaceAds).values({
      title: sanitizedTitle,
      description: sanitizedDescription,
      price: Math.round(Number(price) * 100), // Convert to cents
      category: sanitizeInput(category),
      sellerId: userId,
      townId: user.townId || null,
      cityId: user.cityId || null,
      isPremium: user.isPremium || false,
    }).returning();

    // Handle image uploads
    if (images && Array.isArray(images)) {
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        if (imageData && typeof imageData === 'string') {
          const fileName = `ad_${ad.id}_${i}_${Date.now()}.jpg`;
          const filePath = path.join(uploadDir, fileName);
          const buffer = Buffer.from(imageData, 'base64');
          fs.writeFileSync(filePath, buffer);
          
          await db.insert(marketplaceAdImages).values({
            adId: ad.id,
            imagePath: `/uploads/images/${fileName}`,
            order: i,
          });
        }
      }
    }

    res.status(201).json({ ad });
  } catch (error: any) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

