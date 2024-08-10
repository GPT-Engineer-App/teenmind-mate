import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query"

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const { data: aiResponse, refetch: fetchAIResponse, isLoading } = useQuery({
    queryKey: ['aiResponse', input],
    queryFn: () => fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input })
    }).then(res => res.json()),
    enabled: false
  });

  useEffect(() => {
    if (aiResponse) {
      setMessages(prev => [...prev, { text: aiResponse.message, sender: 'ai' }]);
      setIsTyping(false);
    }
  }, [aiResponse]);

  const handleSend = async () => {
    if (input.trim()) {
      setMessages(prev => [...prev, { text: input, sender: 'user' }]);
      setInput('');
      setIsTyping(true);
      await fetchAIResponse();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-4">
      <Card className="flex-grow p-6">
        <h1 className="text-3xl font-bold mb-4 text-center">Teen Mental Health Support</h1>
        <p className="text-center mb-6">A safe space to express your feelings and get support.</p>
        <ScrollArea className="h-[60vh] mb-4 p-4 border rounded-lg">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-3 rounded-lg ${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {message.text}
              </span>
            </div>
          ))}
          {isTyping && (
            <div className="text-left">
              <span className="inline-block p-3 rounded-lg bg-gray-200 text-black">
                Typing...
              </span>
            </div>
          )}
        </ScrollArea>
        <div className="flex">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
            placeholder="Type your message here..."
            className="flex-grow mr-2"
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Index;
