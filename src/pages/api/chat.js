import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const crisisKeywords = ['suicide', 'kill myself', 'want to die', 'end my life'];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message, mood, username } = req.body;
      const isCrisis = crisisKeywords.some(keyword => message.toLowerCase().includes(keyword));

      const completion = await openai.createCompletion({
        model: "text-davinci-002",
        prompt: generatePrompt(message, mood, username, isCrisis),
        max_tokens: 200,
        temperature: 0.6,
      });

      const aiResponse = completion.data.choices[0].text.trim();

      res.status(200).json({ 
        message: aiResponse,
        crisis: isCrisis
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function generatePrompt(message, mood, username, isCrisis) {
  let prompt = `You are a supportive and empathetic AI assistant designed to help teenagers with mental health concerns. 
  The user's name is ${username} and their current mood is ${mood}/10 (where 1 is very bad and 10 is very good).
  
  Respond to the following message from ${username}:

User: ${message}

AI Assistant:`;

  if (isCrisis) {
    prompt += `

IMPORTANT: This message contains signs of a potential crisis. Provide immediate support and encourage the user to seek professional help. Include the contact information for the National Suicide Prevention Lifeline (1-800-273-8255) in your response.`;
  }

  return prompt;
}
