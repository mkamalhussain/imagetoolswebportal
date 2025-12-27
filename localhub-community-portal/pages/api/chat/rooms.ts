import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { chatRooms, chatRoomMembers, users, villages } from '@/lib/db/schema';
import { eq, and, or } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get rooms user is member of or public rooms
    const userRooms = await db.select({
      id: chatRooms.id,
      name: chatRooms.name,
      type: chatRooms.type,
      description: chatRooms.description,
      townId: chatRooms.townId,
      villageName: villages.name,
    })
      .from(chatRooms)
      .leftJoin(villages, eq(chatRooms.villageId, villages.id))
      .leftJoin(chatRoomMembers, eq(chatRooms.id, chatRoomMembers.roomId))
      .where(
        or(
          eq(chatRooms.type, 'public'),
          and(
            eq(chatRoomMembers.userId, userId),
            eq(chatRooms.type, 'private')
          )
        )
      )
      .where(
        or(
          eq(chatRooms.type, 'public'),
          and(
            eq(chatRoomMembers.userId, userId),
            eq(chatRooms.type, 'private')
          )
        )
      )
      .groupBy(chatRooms.id);

    res.status(200).json({ rooms: userRooms });
  } catch (error: any) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

