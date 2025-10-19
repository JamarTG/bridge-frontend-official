import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import MessageItem from "../message-item";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import ChatButton from "./chat-button";
import PanelLayout from "./layout";

interface Message {
  username: string;
  message: string;
  timestamp: string;
  socketId: string;
  isSystem?: boolean;
}

interface ChatTabProps {
  messages: Message[];
  messageInput: string;
  setMessageInput: (value: string) => void;
  sendMessage: (e: React.FormEvent) => void;
  connected: boolean;
}

const ChatTab = ({ 
  messages, 
  messageInput, 
  setMessageInput, 
  sendMessage, 
  connected 
}: ChatTabProps) => {
  const messagesEndRef = useScrollToBottom([messages]);

  return (
    <PanelLayout>
      <ScrollArea className="flex-1 w-[95%] border rounded-md">
        <div className="px-8 flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {messages.length === 0 ? (
            <div className="text-center w-full py-8 text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            messages.map((msg, index) => (
              <MessageItem
                key={`${msg.socketId}-${msg.timestamp}-${index}`}
                name={msg.username}
                time={new Date(msg.timestamp).toLocaleTimeString()}
                message={msg.message}
                originalLangCode={msg.isSystem ? "SYSTEM" : "EN"}
                isSystem={msg.isSystem}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatButton 
        Icon={Send}
        placeholder="Type a message..." 
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onSubmit={sendMessage}
        disabled={!connected}
      />
    </PanelLayout>
  );
};

export default ChatTab;