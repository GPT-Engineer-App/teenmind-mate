import { useState } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      // Simulate AI response
      setTimeout(() => {
        setMessages(prev => [...prev, { text: mockAIResponse(input), sender: 'ai' }]);
      }, 1000);
    }
  };

  const mockAIResponse = (userInput) => {
    // This is a very basic mock response. In a real application, this would be replaced with an actual AI model.
    const responses = [
      "I understand that you're feeling this way. It's important to remember that your feelings are valid.",
      "Have you tried talking to a trusted friend or family member about this?",
      "It might be helpful to practice some relaxation techniques. Would you like me to suggest some?",
      "Remember, it's okay to seek professional help if you're struggling. There's no shame in that.",
      "I'm here to listen whenever you need to talk.",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Teen Mental Health Chatbot</h1>
      <p className="text-center mb-4">A safe space to express your feelings and get support.</p>
      <div className="flex-grow bg-white rounded-lg shadow-md p-4 flex flex-col">
        <ScrollArea className="flex-grow mb-4">
          {messages.map((message, index) => (
            <div key={index} className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {message.text}
              </span>
            </div>
          ))}
        </ScrollArea>
        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your message here..."
            className="flex-grow mr-2"
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
