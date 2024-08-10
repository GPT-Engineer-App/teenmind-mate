import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const [azureEndpoint, setAzureEndpoint] = useState("");
  const [azureApiKey, setAzureApiKey] = useState("");
  const [availableModels, setAvailableModels] = useState([]);
  const [emailHost, setEmailHost] = useState("");
  const [emailPort, setEmailPort] = useState("");
  const [emailUser, setEmailUser] = useState("");
  const [emailPass, setEmailPass] = useState("");
  const [emailFrom, setEmailFrom] = useState("");
  const [baseUrl, setBaseUrl] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Fetch current settings and available models
    const fetchSettings = async () => {
      const response = await fetch("/api/admin/settings");
      const data = await response.json();
      setAzureEndpoint(data.azureEndpoint || "");
      setAzureApiKey(data.azureApiKey || "");
      setAvailableModels(data.availableModels || []);
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        azureEndpoint,
        azureApiKey,
        emailHost,
        emailPort,
        emailUser,
        emailPass,
        emailFrom,
        baseUrl,
      }),
    });
    if (response.ok) {
      toast({
        title: "Settings updated",
        description: "All settings have been successfully updated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update settings.",
        variant: "destructive",
      });
    }
  };

  if (user?.role !== "admin") {
    return <div>Access denied. Admin only.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="azure">
            <TabsList>
              <TabsTrigger value="azure">Azure Settings</TabsTrigger>
              <TabsTrigger value="email">Email Settings</TabsTrigger>
              <TabsTrigger value="general">General Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="azure">
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
                <Button type="submit">Save Azure Settings</Button>
              </form>
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-2">Available Models</h3>
                <ul>
                  {availableModels.map((model, index) => (
                    <li key={index}>{model}</li>
                  ))}
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="email">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="emailHost">Email Host</label>
                  <Input
                    id="emailHost"
                    value={emailHost}
                    onChange={(e) => setEmailHost(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emailPort">Email Port</label>
                  <Input
                    id="emailPort"
                    value={emailPort}
                    onChange={(e) => setEmailPort(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emailUser">Email User</label>
                  <Input
                    id="emailUser"
                    value={emailUser}
                    onChange={(e) => setEmailUser(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emailPass">Email Password</label>
                  <Input
                    id="emailPass"
                    type="password"
                    value={emailPass}
                    onChange={(e) => setEmailPass(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="emailFrom">Email From</label>
                  <Input
                    id="emailFrom"
                    value={emailFrom}
                    onChange={(e) => setEmailFrom(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Save Email Settings</Button>
              </form>
            </TabsContent>
            <TabsContent value="general">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="baseUrl">Base URL</label>
                  <Input
                    id="baseUrl"
                    value={baseUrl}
                    onChange={(e) => setBaseUrl(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit">Save General Settings</Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;
