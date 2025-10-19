import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import NavbarLayout from "@/components/features/navbar";
import { Plus, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Meeting {
  id: number;
  title: string;
  inviteLink: string;
  createdAt: Date;
}

const Dashboard = () => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateMeetingLink = async () => {
    setLoading(true);
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No auth token found.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/meetings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${token}`,
        },
        body: JSON.stringify({
          hostId: 0,
          shortTitle: "Round Table ",
          description: "oooooo",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Create meeting error:", result);
        setLoading(false);
        return;
      }

      const newMeeting: Meeting = {
        id: 1,
        title: "Active Meeting",
        inviteLink: `${window.location.origin}/room/${result.meetingUuid}`,
        createdAt: new Date(),
      };
      setMeeting(newMeeting);
    } catch (error) {
      console.error("Create meeting error:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyLink = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NavbarLayout>
      <div className="flex h-[100vh] flex-col lg:flex-row justify-center items-center w-full px-4 py-6 gap-6">
        <Card className="w-72 sm:w-96 h-48 shadow-md border rounded-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-semibold">
              {meeting ? "Create New Meeting" : "Start a Meeting"}
            </CardTitle>
            <CardDescription>
              {meeting
                ? "This will replace your current active meeting."
                : "Generate an invite link to share instantly."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={generateMeetingLink}
              variant={meeting ? "outline" : "default"}
              disabled={loading}
              className="flex items-center gap-2 w-32 sm:w-auto"
            >
              {loading ? (
                <Skeleton className="w-16 h-4 rounded" />
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {meeting ? "New Meeting" : "Generate Link"}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="w-72 sm:w-96 h-48 shadow-md border rounded-2xl flex justify-center items-center">
          {loading ? (
            <div className="flex flex-col space-y-3 w-full px-4">
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-8 w-20 mt-2" />
            </div>
          ) : meeting ? (
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
