import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { token } = req.query;

    try {
      const verificationToken = await prisma.verificationToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verificationToken) {
        return res.status(400).json({ error: 'Invalid or expired verification token' });
      }

      if (verificationToken.expires < new Date()) {
        return res.status(400).json({ error: 'Verification token has expired' });
      }

      // Update user as verified
      await prisma.user.update({
        where: { id: verificationToken.userId },
        data: { isVerified: true },
      });

      // Delete the used verification token
      await prisma.verificationToken.delete({
        where: { id: verificationToken.id },
      });

      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({ error: 'An error occurred during email verification' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
