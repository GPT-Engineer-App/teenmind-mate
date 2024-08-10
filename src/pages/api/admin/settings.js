export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return current settings
    res.status(200).json({
      azureEndpoint: process.env.AZURE_ENDPOINT,
      azureApiKey: process.env.AZURE_API_KEY,
      availableModels: ['gpt-4', 'gpt-3.5-turbo'], // This should be fetched from Azure in a real implementation
    });
  } else if (req.method === 'POST') {
    // Update settings
    const { azureEndpoint, azureApiKey } = req.body;
    
    // In a real implementation, you would update these in a secure way, possibly using a database
    process.env.AZURE_ENDPOINT = azureEndpoint;
    process.env.AZURE_API_KEY = azureApiKey;

    res.status(200).json({ message: 'Settings updated successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
