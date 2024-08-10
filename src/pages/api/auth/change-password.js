import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const prisma = new PrismaClient();

const changePasswordSchema = z.object({
  userId: z.number(),
  currentPassword: z.string(),
  newPassword: z.string().min(8),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { userId, currentPassword, newPassword } = changePasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { 
          password: hashedNewPassword,
          isDefaultPassword: false
        },
      });

      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Change password error:', error);
      res.status(500).json({ error: 'An error occurred while changing the password' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
