import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { username, email, password } = req.body;

    try {
      // Check if admin already exists
      const existingAdmin = await prisma.user.findFirst({
        where: {
          role: 'admin',
        },
      });

      if (existingAdmin) {
        return res.status(400).json({ error: 'Admin account already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create admin user
      const admin = await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          role: 'admin',
          isVerified: true,
        },
      });

      res.status(201).json({ message: 'Admin account created successfully' });
    } catch (error) {
      console.error('Admin creation error:', error);
      res.status(500).json({ error: 'An error occurred during admin account creation' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
