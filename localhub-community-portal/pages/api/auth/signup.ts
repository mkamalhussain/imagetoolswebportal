import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users, villages, cities, countries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
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
    const { email, password, fullName, townId, proofOfResidence, identityProof } = req.body;

    // Validation
    if (!email || !password || !fullName || !townId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase());
    const sanitizedFullName = sanitizeInput(fullName);

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, sanitizedEmail)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Verify town exists and get city/country
    const town = await db.select().from(towns).where(eq(towns.id, townId)).limit(1);
    if (town.length === 0) {
      return res.status(400).json({ error: 'Invalid town' });
    }

    const city = await db.select().from(cities).where(eq(cities.id, town[0].cityId)).limit(1);
    if (city.length === 0) {
      return res.status(400).json({ error: 'Invalid city' });
    }

    const country = await db.select().from(countries).where(eq(countries.id, city[0].countryId)).limit(1);
    if (country.length === 0) {
      return res.status(400).json({ error: 'Invalid country' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle file uploads (proofs are base64 encoded in request)
    let proofOfResidencePath = null;
    let identityProofPath = null;

    if (proofOfResidence) {
      // Save proof file (simplified - in production, use proper file handling)
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'proofs');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const fileName = `proof_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(proofOfResidence, 'base64');
      fs.writeFileSync(filePath, buffer);
      proofOfResidencePath = `/uploads/proofs/${fileName}`;
    }

    if (identityProof) {
      const fs = require('fs');
      const path = require('path');
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'proofs');
      const fileName = `identity_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(identityProof, 'base64');
      fs.writeFileSync(filePath, buffer);
      identityProofPath = `/uploads/proofs/${fileName}`;
    }

    // Create user (pending verification)
    const [newUser] = await db.insert(users).values({
      email: sanitizedEmail,
      password: hashedPassword,
      fullName: sanitizedFullName,
      townId,
      cityId: city[0].id,
      countryId: country[0].id,
      verificationStatus: 'pending',
      proofOfResidence: proofOfResidencePath,
      identityProof: identityProofPath,
      isVerified: false,
      isAdmin: false,
    }).returning();

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      message: 'Account created successfully. Awaiting admin approval.',
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

