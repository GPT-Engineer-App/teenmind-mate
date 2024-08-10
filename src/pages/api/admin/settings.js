import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Return current settings
    res.status(200).json({
      azureEndpoint: process.env.AZURE_ENDPOINT,
      azureApiKey: process.env.AZURE_API_KEY,
      emailHost: process.env.EMAIL_HOST,
      emailPort: process.env.EMAIL_PORT,
      emailUser: process.env.EMAIL_USER,
      emailPass: process.env.EMAIL_PASS,
      emailFrom: process.env.EMAIL_FROM,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      availableModels: ['gpt-4', 'gpt-3.5-turbo'], // This should be fetched from Azure in a real implementation
    });
  } else if (req.method === 'POST') {
    // Update settings
    const { azureEndpoint, azureApiKey, emailHost, emailPort, emailUser, emailPass, emailFrom, baseUrl } = req.body;
    
    // Update .env file
    const envPath = path.resolve(process.cwd(), '.env');
    let envContent = `AZURE_ENDPOINT=${azureEndpoint}\n`;
    envContent += `AZURE_API_KEY=${azureApiKey}\n`;
    envContent += `EMAIL_HOST=${emailHost}\n`;
    envContent += `EMAIL_PORT=${emailPort}\n`;
    envContent += `EMAIL_USER=${emailUser}\n`;
    envContent += `EMAIL_PASS=${emailPass}\n`;
    envContent += `EMAIL_FROM=${emailFrom}\n`;
    envContent += `NEXT_PUBLIC_BASE_URL=${baseUrl}\n`;

    fs.writeFileSync(envPath, envContent);

    // Update process.env
    process.env.AZURE_ENDPOINT = azureEndpoint;
    process.env.AZURE_API_KEY = azureApiKey;
    process.env.EMAIL_HOST = emailHost;
    process.env.EMAIL_PORT = emailPort;
    process.env.EMAIL_USER = emailUser;
    process.env.EMAIL_PASS = emailPass;
    process.env.EMAIL_FROM = emailFrom;
    process.env.NEXT_PUBLIC_BASE_URL = baseUrl;

    res.status(200).json({ message: 'Settings updated successfully' });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
