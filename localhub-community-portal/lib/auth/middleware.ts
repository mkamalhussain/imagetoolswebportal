import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken, JWTPayload } from './jwt';

export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload;
}

export function authMiddleware(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.cookies.token;

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = payload;
    return handler(req, res);
  };
}

export function adminMiddleware(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return authMiddleware(async (req: AuthenticatedRequest, res: NextApiResponse) => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    return handler(req, res);
  });
}

