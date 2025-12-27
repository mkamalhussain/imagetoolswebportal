import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { forumPosts, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';
import { sanitizeInput, sanitizeHtml } from '@/lib/utils/sanitize';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { title, content, categoryId, images } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    // Get user's location
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const sanitizedTitle = sanitizeInput(title);
    const sanitizedContent = sanitizeHtml(content); // Allow HTML for markdown

    // Create post
    const [post] = await db.insert(forumPosts).values({
      title: sanitizedTitle,
      content: sanitizedContent,
      categoryId: categoryId ? Number(categoryId) : null,
      authorId: userId,
      townId: user.townId || null,
      cityId: user.cityId || null,
    }).returning();

    // Handle image uploads if provided
    if (images && Array.isArray(images)) {
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const { forumPostImages } = await import('@/lib/db/schema');
      for (let i = 0; i < images.length; i++) {
        const imageData = images[i];
        if (imageData && typeof imageData === 'string') {
          const fileName = `post_${post.id}_${i}_${Date.now()}.jpg`;
          const filePath = path.join(uploadDir, fileName);
          const buffer = Buffer.from(imageData, 'base64');
          fs.writeFileSync(filePath, buffer);
          
          await db.insert(forumPostImages).values({
            postId: post.id,
            imagePath: `/uploads/images/${fileName}`,
            order: i,
          });
        }
      }
    }

    res.status(201).json({ post });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

