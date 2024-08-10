import { getUserInfo } from '@replit/repl-auth';
import { useAuth } from '../../../contexts/AuthContext'; // Adjust path if needed

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { replitLogin } = useAuth(); // Get the replitLogin function from AuthContext
      const success = await replitLogin(req);
      if (success) {
        res.redirect('/'); // Redirect to home page after successful login
      } else {
        res.status(401).json({ error: 'Replit login failed' });
      }
    } catch (error) {
      console.error('Replit login error:', error);
      res.status(500).json({ error: 'An error occurred during Replit login' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
