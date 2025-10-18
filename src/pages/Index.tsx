
import { Users, MessageSquare, Bot, FileText, SettingsIcon,  LogOutIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DynamicVideoGrid from "@/components/features/video/video-grid";
import ChatControls from "@/components/features/controls/chat-controls";
import ChatTab from "@/components/features/panel/chat-tab";
import AITab from "@/components/features/panel/ai-tab";
import { useNavigate } from "react-router-dom";
import DocsTab from "@/components/features/panel/doc-tab";
import TranscriptTab from "@/components/features/panel/transcript-tab";

const videoTileData = [
  {
    isSpeaking: true,
    name: "Jamari McFarlane",
    hasHandRaised: true,
    hasVideoOn: false,
    isMicOff: true
  },
  // {
  //   isSpeaking: false,
  //   name: "Micheal Webb",
  //   hasHandRaised: false,
  //   hasVideoOn: false,
  //   isMicOff: false
  // },
  {
    isSpeaking: false,
    name: "Jordan Campbell",
    hasHandRaised: false,
    hasVideoOn: false,
    isMicOff: false
  }, {
    isSpeaking: false,
    name: "Cleon Mullings",
    hasHandRaised: true,
    hasVideoOn: false,
    isMicOff: true
  }
]

const startTimestamp = new Date("2025-10-17T01:00:00").getTime();


const Index = () => {
  

  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="h-16 border-b border-border bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <h1 className="text-xl font-bold">Bridge</h1>
          </div>

        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 cursor-default">
            <Users className="w-3 " />
            <span className="sm:text-md text-xs">12</span>
          </Badge>
          <Button className="cursor-pointer" variant="ghost">
            <SettingsIcon className="w-1/2 h-1/2" />
          </Button>
           <Button onClick={() => navigate("/login")} className="cursor-pointer" variant="ghost">
            <LogOutIcon className="w-1/2 h-1/2" />
          </Button>
           
        </div>
      </header>

      <div className="relative h-screen flex-1 flex overflow-hidden pb-20">
        <div className="flex-1 flex flex-col p-1 gap-4">
          <DynamicVideoGrid videoTileData={videoTileData} />
        </div>

        <div className="hidden md:block w-md h-lg border-l border-border bg-surface flex-col">
          <Tabs defaultValue="ai" className="h-full flex-1 flex flex-col">
            <TabsList className=" mx-4 mt-4 grid w-[calc(100%-2rem)] grid-cols-4">
              <TabsTrigger className="gap-1 cursor-pointer" value="chat">
                <MessageSquare className="w-4 h-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger className="gap-1 cursor-pointer" value="ai">
                <Bot className="w-4 h-4 mr-1" />
                AI
              </TabsTrigger>
              <TabsTrigger className="gap-1 cursor-pointer" value="docs">
                <FileText className="w-4 h-4 mr-1" />
                Docs
              </TabsTrigger>
              <TabsTrigger className="gap-1 cursor-pointer" value="transcript">
                <FileText className="w-4 h-4 mr-1" />
                Transcript
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 flex flex-col">
              <TabsContent value="chat" className="flex-1 h-full w-full">
                <ChatTab />
              </TabsContent>
              <TabsContent value="ai" className="flex-1 h-full w-full">
                <AITab />
              </TabsContent>
              <TabsContent value="docs" className="flex-1 h-full w-full">
                <DocsTab />
              </TabsContent>
              <TabsContent value="transcript" className="flex-1 h-full w-full">
                <TranscriptTab />
              </TabsContent>
            </div>

          </Tabs>
        </div>
      </div>

      <ChatControls meetingStartTime={startTimestamp} />
    </div>
  );
};

export default Index;