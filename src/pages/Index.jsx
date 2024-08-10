import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../contexts/AuthContext";

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [mood, setMood] = useState(5); // Default mood value
  const [isTyping, setIsTyping] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo'); // Default model
  const [availableModels, setAvailableModels] = useState([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    // Fetch available models from the API
    const fetchModels = async () => {
      const response = await fetch("/api/models");
      const data = await response.json();
      setAvailableModels(data.models);
    };
    fetchModels();

    // Fetch conversation history from Replit DB
    const fetchConversation = async () => {
      if (user) {
        const conversationHistory = await db.get(`conversation_${user.username}`);
        if (conversationHistory) {
          setMessages(conversationHistory);
        }
      }
    };
    fetchConversation();
  }, [user]);

  const {
     aiResponse,
    refetch: fetchAIResponse,
    isLoading,
  } = useQuery({
    queryKey: ["aiResponse", input, selectedModel, mood, user?.username],
    queryFn: async () => {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          mood,
          username: user?.username || 'guest', // Use guest if user is not logged in
          model: selectedModel,
        }),
      });
      return response.json();
    },
    enabled: false, // The query will not execute until fetchAIResponse is called
  });

  useEffect(() => {
    if (aiResponse) {
      setMessages((prev) => [
        ...prev,
        { text: aiResponse.message, sender: "ai", timestamp: new Date() },
      ]);
      setIsTyping(false);
      if (aiResponse.crisis) {
        toast({
          title: "Crisis Alert",
          description:
            "We've detected signs of a potential crisis. Please seek immediate help.",
          duration: 10000,
        });
      }
    }
  }, [aiResponse, toast]);

  const handleSend = async () => {
    if (input.trim()) {
      setMessages((prev) => [...prev, { text: input, sender: "user", timestamp: new Date() }]);
      setInput("");
      setIsTyping(true);
      await fetchAIResponse();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 p-4">
      <Card className="flex-grow p-6">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">
            Teen Mental Health Support
          </CardTitle>
          <p className="text-center">
            A safe space to express your feelings and get support.
          </p>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTitle>How are you feeling today?</AlertTitle>
            <AlertDescription>
              <Slider
                value={[mood]}
                onValueChange={(value) => setMood(value[0])}
                max={10}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between mt-1">
                <span>Very Bad</span>
                <span>Neutral</span>
                <span>Very Good</span>
              </div>
            </AlertDescription>
          </Alert>
          <div className="mb-4">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {availableModels.map((model) => (
                  <SelectItem key={model} value={model}>
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <ScrollArea className="h-[50vh] mb-4 p-4 border rounded-lg">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={`inline-block p-3 rounded-lg ${message.sender === "user" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"}`}
                >
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
              onKeyPress={(e) =>
                e.key === "Enter" && !isLoading && handleSend()
              }
              placeholder="Type your message here..."
              className="flex-grow mr-2"
            />
            <Button onClick={handleSend} disabled={isLoading}>
              {isLoading ? "Sending..." : "Send"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
