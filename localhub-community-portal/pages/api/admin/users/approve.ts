import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { adminMiddleware, AuthenticatedRequest } from '@/lib/auth/middleware';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, action, notes } = req.body; // action: 'approve' or 'reject'

    if (!userId || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (action !== 'approve' && action !== 'reject') {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (action === 'approve') {
      await db.update(users)
        .set({
          verificationStatus: 'approved',
          isVerified: true,
          verificationNotes: notes || null,
        })
        .where(eq(users.id, userId));

      // TODO: Send approval email notification
    } else {
      await db.update(users)
        .set({
          verificationStatus: 'rejected',
          verificationNotes: notes || null,
        })
        .where(eq(users.id, userId));

      // TODO: Send rejection email notification
    }

    res.status(200).json({ message: `User ${action}d successfully` });
  } catch (error: any) {
    console.error('Approve user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

export default adminMiddleware(handler);

