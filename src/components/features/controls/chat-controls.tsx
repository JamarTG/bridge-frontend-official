import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Hand, Mic, MicOff, Phone, Video, VideoOff, MicVocal } from "lucide-react";
import { SheetPanel } from "../panel/panel-sheet";

interface ChatControlsProps {
  meetingStartTime: string;
  isAudioMuted: boolean;
  isVideoMuted: boolean;
  isScreenSharing: boolean;
  isTranscribing: boolean;
  isSpeaking: boolean;
  connected: boolean;
  toggleAudio: () => void;
  toggleVideo: () => void;
  toggleScreenShare: () => void;
  toggleTranscription: () => void;
}

const ChatControls = ({ 
  // meetingStartTime,
  isAudioMuted,
  isVideoMuted,
  // isScreenSharing,
  isTranscribing,
  isSpeaking,
  connected,
  toggleAudio,
  toggleVideo,
  // toggleScreenShare,
  toggleTranscription
}: ChatControlsProps) => {
  const [handRaised, setHandRaised] = useState(false);
  // const [elapsed, setElapsed] = useState(Date.now() - new Date(meetingStartTime).getTime());

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setElapsed(Date.now() - new Date(meetingStartTime).getTime());
  //   }, 1000);

  //   return () => clearInterval(interval);
  // }, [meetingStartTime]);

  // const formatTime = (ms: number) => {
  //   const totalSeconds = Math.floor(ms / 1000);
  //   const h = Math.floor(totalSeconds / 3600).toString().padStart(2, "0");
  //   const m = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, "0");
  //   const s = (totalSeconds % 60).toString().padStart(2, "0");
  //   return `${h}:${m}:${s}`;
  // };

  return (
    <div className="fixed border-t bottom-0 left-0 right-0 h-16 border-border bg-card flex items-center justify-between px-8">
      <div className="hidden sm:flex items-center gap-2">
        {/* <span className="text-sm text-muted-foreground">{formatTime(elapsed)}</span> */}
        {/* {!connected && (
          <span className="text-xs text-destructive ml-2">● Disconnected</span>
        )} */}
        {isTranscribing && isSpeaking && (
          <span className="text-xs text-green-500 ml-2">● Speaking</span>
        )}
      </div>

      <div className="w-full flex items-center justify-center gap-3">
      
        <SheetPanel/>

        <Button 
          size="lg" 
          variant="outline" 
          className="cursor-pointer rounded-full" 
          onClick={toggleAudio}
          title={isAudioMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isAudioMuted ? (
            <MicOff className="w-5 h-5 text-destructive" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        <Button 
          size="lg" 
          variant="outline" 
          className="cursor-pointer rounded-full" 
          onClick={toggleVideo}
          title={isVideoMuted ? "Turn on camera" : "Turn off camera"}
        >
          {isVideoMuted ? (
            <VideoOff className="w-5 h-5 text-muted-foreground" />
          ) : (
            <Video className="w-5 h-5" />
          )}
        </Button>

        {/* <Button 
          size="lg" 
          variant="outline" 
          className={`cursor-pointer rounded-full ${isScreenSharing ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}`}
          onClick={toggleScreenShare}
          title={isScreenSharing ? "Stop screen sharing" : "Share screen"}
        >
          {isScreenSharing ? (
            <MonitorOff className="w-5 h-5" />
          ) : (
            <Monitor className="w-5 h-5" />
          )}
        </Button> */}

        <Button
          size="lg"
          variant="outline"
          className={`cursor-pointer rounded-full relative ${
            isTranscribing 
              ? 'bg-purple-500 text-white hover:bg-purple-600' 
              : 'hover:bg-purple-100'
          }`}
          onClick={toggleTranscription}
          disabled={!connected}
          title={isTranscribing ? "Stop transcription" : "Start transcription"}
        >
          <MicVocal className={`w-5 h-5 ${isTranscribing ? 'text-black' : 'text-green-500'}`} />
          {isTranscribing && isSpeaking && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white" />
          )}
        </Button>

        <Button
          size="lg"
          variant="outline"
          className={`cursor-pointer rounded-full border-hand transition-colors duration-200 ${
            handRaised 
              ? "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" 
              : "bg-transparent text-hand hover:bg-blue-100 active:bg-blue-300"
          }`}
          onClick={() => setHandRaised(!handRaised)}
          title={handRaised ? "Lower hand" : "Raise hand"}
        >
          <Hand className={`${handRaised ? "text-black" : "text-blue-500"} w-5 h-5`} />
        </Button>

        <Button 
          size="lg" 
        
          className="flex justify-center gap-1 bg-red-500 hover:bg-red-500/95 cursor-pointer rounded-full px-1 transition-transform duration-200 hover:scale-105 active:scale-95"
          onClick={() => window.location.href = '/'}
          title="Leave meeting"
        >
          <Phone className="w-8 h-8 mr-1" />
        </Button>
      </div>
    </div>
  );
};

export default ChatControls;