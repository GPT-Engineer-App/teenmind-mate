import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

const endpoint = process.env.AZURE_ENDPOINT;
const apiKey = process.env.AZURE_API_KEY;

const crisisKeywords = ['suicide', 'kill myself', 'want to die', 'end my life'];

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { message, mood, username, model } = req.body;
      const isCrisis = crisisKeywords.some(keyword => message.toLowerCase().includes(keyword));

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
        throw response.body.error;
      }

      const aiResponse = response.body.choices[0].message.content.trim();

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

function generateSystemPrompt(mood, username, isCrisis) {
  let prompt = `You are a supportive and empathetic AI assistant designed to help teenagers with mental health concerns. 
  The user's name is ${username} and their current mood is ${mood}/10 (where 1 is very bad and 10 is very good).`;

  if (isCrisis) {
    prompt += `\n\nIMPORTANT: The user's message contains signs of a potential crisis. Provide immediate support and encourage the user to seek professional help. Include the contact information for the National Suicide Prevention Lifeline (1-800-273-8255) in your response.`;
  }

  return prompt;
}
