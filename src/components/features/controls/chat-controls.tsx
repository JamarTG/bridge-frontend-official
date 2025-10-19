import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Hand, Mic, MicOff, Phone, Video, VideoOff } from "lucide-react";
import { SheetPanel } from "../panel/panel-sheet";

interface ChatControlsProps {
  meetingStartTime: string;
}

const ChatControls = ({ meetingStartTime }: ChatControlsProps) => {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [elapsed, setElapsed] = useState(Date.now() - new Date(meetingStartTime).getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(Date.now() - new Date(meetingStartTime).getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [meetingStartTime]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
    const s = (totalSeconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="fixed border-t bottom-0 left-0 right-0 h-16  border-border bg-card flex items-center justify-between px-8">
      <div className="hidden sm:flex items-center gap-2">
        <span className="text-sm text-muted-foreground">{formatTime(elapsed)}</span>
      </div>

      <div className="w-full flex items-center justify-center gap-3">
      
        <SheetPanel/>

        <Button size="lg" variant="outline" className="cursor-pointer rounded-full" onClick={() => setMicOn(!micOn)}>
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-muted-foreground" />}
        </Button>

        <Button size="lg" variant="outline" className="cursor-pointer rounded-full" onClick={() => setVideoOn(!videoOn)}>
          {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-muted-foreground" />}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className={`cursor-pointer rounded-full border-hand transition-colors duration-200 ${handRaised ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" : "bg-transparent text-hand hover:bg-blue-100 active:bg-blue-300"
            }`}
          onClick={() => setHandRaised(!handRaised)}
        >
          <Hand className={`${handRaised ? "text-white" : "text-hand"} w-5 h-5`} />
        </Button>

        <Button size="lg" variant="destructive" className="flex justify-center gap-1 cursor-pointer rounded-full px-1 transition-transform duration-200 hover:scale-105 active:scale-95">
          <Phone className="w-8 h-8 mr-1" />
        </Button>

      </div>
    </div>
  );
};

export default ChatControls;
