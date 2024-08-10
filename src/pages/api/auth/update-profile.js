import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

const updateProfileSchema = z.object({
  userId: z.number(),
  name: z.string().min(2).max(50),
  age: z.number().min(13).max(19),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say']),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, name, age, gender } = updateProfileSchema.parse(req.body);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, age, gender },
      });

      const { password: _, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'An error occurred while updating the profile' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
