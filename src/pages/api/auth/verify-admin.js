import { z } from 'zod';

const verifyAdminSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { username, password } = verifyAdminSchema.parse(req.body);

      // Verify additional information
      const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      // Check if at least 3 of the following match
      let matchCount = 0;

      if (clientIp === '75.72.92.252' || clientIp.startsWith('2601:444:781:3a70:')) matchCount++;
      if (userAgent.includes('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)')) matchCount++;
      if (userAgent.includes('AppleWebKit/537.36')) matchCount++;
      if (userAgent.includes('Chrome/128.0.0.0')) matchCount++;
      if (userAgent.includes('Safari/537.36')) matchCount++;

      if (matchCount >= 3) {
        res.status(200).json({ message: 'Admin verified successfully' });
      } else {
        res.status(401).json({ error: 'Unauthorized' });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Admin verification error:', error);
      res.status(500).json({ error: 'An error occurred during admin verification' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
