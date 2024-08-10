import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "../contexts/AuthContext";

const Resources = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // In a real app, you'd fetch the user's progress from a backend
    const fetchProgress = async () => {
      // Simulating an API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProgress(Math.floor(Math.random() * 100));
    };
    fetchProgress();
  }, [user]);

  const resources = [
    {
      title: "National Suicide Prevention Lifeline",
      description:
        "24/7, free and confidential support for people in distress.",
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
      description:
        "Crisis intervention and suicide prevention services to LGBTQ young people under 25.",
      contact: "1-866-488-7386",
      website: "https://www.thetrevorproject.org/",
    },
    {
      title: "Teen Line",
      description: "A teen-to-teen helpline and community resource.",
      contact: "310-855-4673",
      website: "https://teenlineonline.org/",
    },
    {
      title: "7 Cups",
      description: "Online therapy and free support.",
      contact: "Online chat available",
      website: "https://www.7cups.com/",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">
        Mental Health Resources
      </h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>Track your mental health journey</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={progress} className="w-full" />
          <p className="mt-2 text-center">{progress}% towards your goal</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Contact:</strong> {resource.contact}
              </p>
              <a
                href={resource.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
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
