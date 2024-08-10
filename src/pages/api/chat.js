import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { z } from 'zod';
import Client from '@replit/database';

const endpoint = process.env.AZURE_ENDPOINT;
const apiKey = process.env.AZURE_API_KEY;
const db = new Client();

const crisisKeywords = ['suicide', 'kill myself', 'want to die', 'end my life'];

const chatSchema = z.object({
  message: z.string(),
  mood: z.number().min(1).max(10),
  username: z.string(),
  model: z.string(),
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message, mood, username, model } = chatSchema.parse(req.body);
      const isCrisis = crisisKeywords.some(keyword => message.toLowerCase().includes(keyword));

      if (!endpoint || !apiKey) {
        throw new Error('Azure configuration is missing');
      }

      const client = new ModelClient(endpoint, new AzureKeyCredential(apiKey));

      const response = await client.path("/chat/completions").post({
        body: {
          messages: [
            { role: "system", content: generateSystemPrompt(mood, username, isCrisis) },
            { role: "user", content: message }
          ],
          model: model,
          temperature: 0.6,
          max_tokens: 200
        }
      });

      if (response.status !== "200") {
        throw new Error(response.body.error || 'Unknown error occurred');
      }

      const aiResponse = response.body.choices[0].message.content.trim();

      // Store conversation data in Replit DB
      await db.set(`conversation_${username}`, [
        ...(await db.get(`conversation_${username}`) || []),
        { text: message, sender: 'user', timestamp: new Date() },
        { text: aiResponse, sender: 'ai', timestamp: new Date() },
      ]);

      res.status(200).json({ 
        message: aiResponse,
        crisis: isCrisis
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error('Chat API error:', error);
      res.status(500).json({ error: 'An error occurred while processing your request.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

function generateSystemPrompt(mood, username, isCrisis) {
  let prompt = `You are a supportive and empathetic AI assistant designed to help teenagers with mental health concerns. 
  The user's name is ${username} and their current mood is ${mood}/10 (where 1 is very bad and 10 is very good). 
  Always respond in a way that is appropriate for a teenager. 
  Avoid giving medical advice. 
  If the user expresses thoughts of self-harm or suicide, encourage them to seek help from a trusted adult or a crisis hotline.`;

  if (isCrisis) {
    prompt += `\n\nIMPORTANT: The user's message contains signs of a potential crisis. Provide immediate support and encourage the user to seek professional help. Include the contact information for the National Suicide Prevention Lifeline (1-800-273-8255) in your response.`;
  }

  return prompt;
}
