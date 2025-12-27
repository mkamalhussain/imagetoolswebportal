import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { chatMessages, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { authMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  try {
    const { roomId } = req.query;
    if (!roomId) {
      return res.status(400).json({ error: 'Room ID required' });
    }

    const messages = await db.select({
      id: chatMessages.id,
      content: chatMessages.content,
      senderId: chatMessages.senderId,
      senderName: users.fullName,
      createdAt: chatMessages.createdAt,
    })
      .from(chatMessages)
      .leftJoin(users, eq(chatMessages.senderId, users.id))
      .where(and(
        eq(chatMessages.roomId, Number(roomId)),
        eq(chatMessages.isDeleted, false)
      ))
      .orderBy(desc(chatMessages.createdAt))
      .limit(100);

    res.status(200).json({ messages: messages.reverse() }); // Reverse to show oldest first
  } catch (error: any) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default authMiddleware(handler);

