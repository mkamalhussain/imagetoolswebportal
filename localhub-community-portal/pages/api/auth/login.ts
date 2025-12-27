import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from '@/lib/auth/jwt';
import { sanitizeInput } from '@/lib/utils/sanitize';
import { authLimiter } from '@/lib/utils/rateLimit';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  await new Promise((resolve) => {
    authLimiter(req as any, res as any, resolve);
  });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase());

    // Find user
    const [user] = await db.select().from(users).where(eq(users.email, sanitizedEmail)).limit(1);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is approved
    if (user.verificationStatus !== 'approved') {
      return res.status(403).json({
        error: 'Account pending approval',
        status: user.verificationStatus,
      });
    }

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin || false,
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    // Set cookie
    res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Path=/; Max-Age=604800; SameSite=Strict`);

    res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

