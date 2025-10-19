import NavbarLayout from "@/components/features/navbar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ChatControls from "@/components/features/controls/chat-controls";
import ChatTab from "@/components/features/panel/chat-tab";
import AITab from "@/components/features/panel/ai-tab";
import DocsTab from "@/components/features/panel/doc-tab";
import TranscriptTab from "@/components/features/panel/transcript-tab";
import { Bot, FileText, MessageCircle } from "lucide-react";
import DynamicVideoGrid from "@/components/features/video/video-grid";

const videoTileData = [
  { name: "Jamari McFarlane", hasHandRaised: true, hasVideoOn: false, isSpeaking: false, isMicOff: false },
  { name: "Micheal Webb", hasHandRaised: false, hasVideoOn: false, isSpeaking: true, isMicOff: true },
  { name: "Jordan Campbell", hasHandRaised: false, hasVideoOn: true, isSpeaking: false, isMicOff: false },
 

];

const startTimestamp = "2025-10-17T01:00:00";

const Index = () => (
  <NavbarLayout>
    <div className="relative flex-1 flex overflow-hidden">
      <div className="flex-1 flex flex-col p-1 gap-4">
        <DynamicVideoGrid videoTileData={videoTileData} />
      </div>

      <div className="hidden md:block w-md h-lg border-l border-border bg-surface flex-col">
        <Tabs defaultValue="ai" className="h-full flex-1 flex flex-col">
          <TabsList className="mx-4 mt-4 grid w-[calc(100%-2rem)] grid-cols-4">
            <TabsTrigger value="chat"><MessageCircle />Chat</TabsTrigger>
            <TabsTrigger value="ai"><Bot /> AI</TabsTrigger>
            <TabsTrigger value="docs"><FileText /> Docs</TabsTrigger>
            <TabsTrigger value="transcript">Transcript</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col">
            <TabsContent value="chat"><ChatTab /></TabsContent>
            <TabsContent value="ai"><AITab /></TabsContent>
            <TabsContent value="docs"><DocsTab /></TabsContent>
            <TabsContent value="transcript"><TranscriptTab /></TabsContent>
          </div>
        </Tabs>
      </div>
    </div>

    <ChatControls meetingStartTime={startTimestamp} />
  </NavbarLayout>
);

export default Index;
