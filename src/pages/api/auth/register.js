import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '../../../utils/email';
import { z } from 'zod';

const prisma = new PrismaClient();

const registerSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, email, password } = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { username },
            { email },
          ],
        },
      });

      if (existingUser) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'user',
          isVerified: false,
        },
      });

      // Generate verification token
      const verificationToken = Math.random().toString(36).substring(2, 15);

      // Save verification token
      await prisma.verificationToken.create({
        data: {
          token: verificationToken,
          userId: user.id,
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Send verification email
      await sendVerificationEmail(email, verificationToken);

      res.status(201).json({ message: 'User registered successfully. Please check your email for verification.' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ error: 'An error occurred during registration' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
