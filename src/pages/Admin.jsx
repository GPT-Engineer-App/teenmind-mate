import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const Admin = () => {
  const [azureEndpoint, setAzureEndpoint] = useState('');
  const [azureApiKey, setAzureApiKey] = useState('');
  const [availableModels, setAvailableModels] = useState([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch current settings and available models
    const fetchSettings = async () => {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setAzureEndpoint(data.azureEndpoint || '');
      setAzureApiKey(data.azureApiKey || '');
      setAvailableModels(data.availableModels || []);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ azureEndpoint, azureApiKey }),
    });
    if (response.ok) {
      toast({
        title: "Settings updated",
        description: "Azure settings have been successfully updated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== 'admin') {
    return <div>Access denied. Admin only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="azureEndpoint">Azure Endpoint</label>
              <Input
                id="azureEndpoint"
                value={azureEndpoint}
                onChange={(e) => setAzureEndpoint(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="azureApiKey">Azure API Key</label>
              <Input
                id="azureApiKey"
                type="password"
                value={azureApiKey}
                onChange={(e) => setAzureApiKey(e.target.value)}
                required
              />
            </div>
            <Button type="submit">Save Settings</Button>
          </form>
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Available Models</h3>
            <ul>
              {availableModels.map((model, index) => (
                <li key={index}>{model}</li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
