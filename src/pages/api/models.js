export default async function handler(req, res) {
  if (req.method === 'GET') {
    // In a real implementation, this list should be fetched from Azure
    const models = ['gpt-4', 'gpt-3.5-turbo'];
    res.status(200).json({ models });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
