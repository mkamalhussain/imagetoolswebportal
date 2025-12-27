import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { forumPosts, users, towns, forumCategories } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';
import { sanitizeInput } from '@/lib/utils/sanitize';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const userId = req.user?.userId;
    const { categoryId, villageId, search } = req.query;

    // Build query conditions
    const conditions = [eq(forumPosts.isDeleted, false)];

    if (categoryId) {
      conditions.push(eq(forumPosts.categoryId, Number(categoryId)));
    }

    if (villageId) {
      conditions.push(eq(forumPosts.townId, Number(villageId)));
    } else if (userId) {
      // Get user's town if not specified
      const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user?.townId) {
        conditions.push(eq(forumPosts.townId, user.townId));
      }
    }

    let posts = await db.select({
      id: forumPosts.id,
      title: forumPosts.title,
      content: forumPosts.content,
      categoryId: forumPosts.categoryId,
      authorId: forumPosts.authorId,
      views: forumPosts.views,
      likes: forumPosts.likes,
      isPinned: forumPosts.isPinned,
      createdAt: forumPosts.createdAt,
      authorName: users.fullName,
      categoryName: forumCategories.name,
      townName: towns.name,
    })
      .from(forumPosts)
      .leftJoin(users, eq(forumPosts.authorId, users.id))
      .leftJoin(forumCategories, eq(forumPosts.categoryId, forumCategories.id))
      .leftJoin(towns, eq(forumPosts.townId, towns.id))
      .where(and(...conditions))
      .orderBy(desc(forumPosts.isPinned), desc(forumPosts.createdAt))
      .limit(50);

    // Filter by search if provided
    if (search && typeof search === 'string') {
      const searchLower = search.toLowerCase();
      posts = posts.filter((post) =>
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower)
      );
    }

    res.status(200).json({ posts });
  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

