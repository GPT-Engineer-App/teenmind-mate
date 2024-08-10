import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message } = req.body;
      const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: generatePrompt(message),
        max_tokens: 150,
        temperature: 0.6,
      });
      res.status(200).json({ message: completion.data.choices[0].text.trim() });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function generatePrompt(message) {
  return `You are a supportive and empathetic AI assistant designed to help teenagers with mental health concerns. Respond to the following message from a teenager:

User: ${message}

AI Assistant:`;
}
