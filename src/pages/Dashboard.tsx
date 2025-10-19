import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { format, isFuture, isToday } from "date-fns";
import NavbarLayout from "@/components/features/navbar";
import { Clock, Users, Video, Calendar as CalendarIcon, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

interface Meeting {
  id: number;
  title: string;
  date: Date;
  participants?: number;
  duration?: number; // in minutes
}

const Dashboard = () => {
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: 1,
      title: "Team Sync",
      date: new Date(),
      participants: 5,
      duration: 30
    },
    {
      id: 2,
      title: "Project Review",
      date: new Date(Date.now() + 86400000), // tomorrow
      participants: 8,
      duration: 60
    }
  ]);

  const startMeeting = () => {
    const newMeeting: Meeting = {
      id: meetings.length + 1,
      title: `Meeting ${meetings.length + 1}`,
      date: new Date(),
      participants: 0,
      duration: 30
    };
    setMeetings([...meetings, newMeeting]);
  };

  return (
    <NavbarLayout>
      <Card className="border-0">

        <CardContent className="flex flex-col gap-4">
          <Button onClick={startMeeting} className="w-32"><Link to={"/call"} className="flex items-center gap-2">
            <Plus />
            <p>Start Meeting</p></Link>
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Meetings</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {meetings.map((m) => (
                  <li key={m.id}>
                    {m.title} - {format(m.date, "PPpp")}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar mode="single" />
        </CardContent>
      </Card>
    </NavbarLayout>
  );
};

export default Dashboard;
