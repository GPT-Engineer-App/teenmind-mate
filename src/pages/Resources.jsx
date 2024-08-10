import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

const Resources = () => {
  const resources = [
    {
      title: "National Suicide Prevention Lifeline",
      description: "24/7, free and confidential support for people in distress.",
      contact: "1-800-273-8255",
      website: "https://suicidepreventionlifeline.org/",
    },
    {
      title: "Crisis Text Line",
      description: "Text HOME to 741741 to connect with a Crisis Counselor.",
      contact: "Text HOME to 741741",
      website: "https://www.crisistextline.org/",
    },
    {
      title: "The Trevor Project",
      description: "Crisis intervention and suicide prevention services to LGBTQ young people under 25.",
      contact: "1-866-488-7386",
      website: "https://www.thetrevorproject.org/",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Mental Health Resources</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p><strong>Contact:</strong> {resource.contact}</p>
              <a href={resource.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Visit Website
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Resources;
