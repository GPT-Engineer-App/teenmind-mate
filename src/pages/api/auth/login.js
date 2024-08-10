import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, password } = loginSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { username } });

      if (!user) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid username or password' });
      }

      if (!user.isVerified) {
        return res.status(400).json({ error: 'Please verify your email before logging in' });
      }

      // Here you would typically create a session or JWT token
      // For simplicity, we're just returning the user object (excluding the password)
      const { password: _, ...userWithoutPassword } = user;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'An error occurred during login' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
