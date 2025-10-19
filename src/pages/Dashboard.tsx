import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import NavbarLayout from "@/components/features/navbar";
import { Plus, Copy, Check } from "lucide-react";
import { format } from "date-fns";

interface Meeting {
  id: number;
  title: string;
  inviteLink: string;
  createdAt: Date;
}

const Dashboard = () => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);

  const generateMeetingLink = () => {
    const newMeeting: Meeting = {
      id: 1,
      title: "Active Meeting",
      inviteLink: `${window.location.origin}/room/${crypto.randomUUID()}`,
      createdAt: new Date(),
    };
    setMeeting(newMeeting);
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NavbarLayout>
      <div className="flex h-[100vh] flex-col lg:flex-row justify-center items-center w-full px-4 py-6 gap-6">
        <Card className="w-96 h-48 shadow-md border rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              {meeting ? "Create New Meeting" : "Start a Meeting"}
            </CardTitle>
            <CardDescription>
              {meeting ? "This will replace your current active meeting." : "Generate an invite link to share instantly."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={generateMeetingLink}
              variant={meeting ? "outline" : "default"}
              className="flex items-center gap-2 w-32 sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              {meeting ? "New Meeting" : "Generate Link"}
            </Button>
          </CardContent>
        </Card>


        <Card className="w-96 h-48 shadow-md border rounded-2xl flex justify-center items-center">
          {meeting ? (
            <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 w-full">
              <div>
                <p className="font-medium">{meeting.title}</p>
                <p className="text-sm text-muted-foreground">
                  Created {format(meeting.createdAt, "PPP p")}
                </p>
                <a
                  href={meeting.inviteLink}
                  className="text-xs text-blue-600 underline break-all"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {meeting.inviteLink.split("/")[4]}
                </a>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyLink(meeting.inviteLink)}
                className="flex items-center gap-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" /> Copy
                  </>
                )}
              </Button>
            </CardContent>
          ) : (
            <p className="text-sm text-muted-foreground text-center px-4">
              No active meeting. Generate a link to start.
            </p>
          )}
        </Card>


      </div>
    </NavbarLayout>
  );
};

export default Dashboard;
