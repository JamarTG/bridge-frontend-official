import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TranscriptTab from "./transcript-tab";
import DocsTab from "./doc-tab";

import ChatTab from "./chat-tab";
import { Bot, FileText, Folder, MessageSquare } from "lucide-react";
import AITab from "./ai-tab";
import { useRoomId } from "@/context/RoomIDContext";

interface PanelProps {
  isMobileVersion: boolean;
}

const Panel: React.FC<PanelProps> = ({ isMobileVersion = false }: { isMobileVersion?: boolean }) => {
  const classes = isMobileVersion
    ? "w-full h-full flex-col flex justify-center items-center"
    : "hidden md:block w-md h-lg border-border bg-surface flex-col";

  const { roomId } = useRoomId();
  return (
    <div className={classes}>
      <Tabs defaultValue="ai" className="flex-1 flex flex-col justify-center">
        <TabsList className="mt-4 grid w-[95%] grid-cols-4">
          <TabsTrigger className="gap-1 cursor-pointer" value="chat">
            <MessageSquare className="w-4 h-4 mr-1" /> <p className="hidden md:inline">Chat</p>
          </TabsTrigger>
          <TabsTrigger className="gap-1 cursor-pointer" value="ai">
            <Bot className="w-4 h-4 mr-1" /> <p className="hidden md:inline">AI</p>
          </TabsTrigger>
          <TabsTrigger className="gap-1 cursor-pointer" value="docs">
            <Folder className="w-4 h-4 mr-1" /> <p className="hidden md:inline">Doc</p>
          </TabsTrigger>
          <TabsTrigger className="gap-1 cursor-pointer" value="transcript">
            <FileText className="w-4 h-4 mr-1" /> <p className="hidden md:inline">Transcript</p>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 flex flex-col">
          <TabsContent value="chat" className="flex-1 h-full w-full">
            <ChatTab />
          </TabsContent>
          <TabsContent value="ai" className="flex-1 h-full w-full">
            <AITab meetingId={roomId} />
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
  );
};

export default Panel;
