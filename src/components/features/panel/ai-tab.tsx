import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { Bot, Loader2 } from "lucide-react";
import ChatButton from "./chat-button";
import PanelLayout from "./layout";
import { toast } from "sonner";

interface Source {
  collection: string;
  score: number;
  content: string;
  metadata: Record<string, any>;
  meeting_id?: string;
  timestamp?: string;
}

interface RagResponse {
  answer: string;
  sources: Source[];
  query: string;
  total_results: number;
  processing_time_ms: number;
}

interface Message {
  sender: "user" | "ai";
  message: string;
  time: string;
  sources?: Source[];
}

interface AITabProps {
  meetingId: string | null;
}

const AITab = ({ meetingId }: AITabProps) => {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useScrollToBottom([conversation]);

  const formatTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    const timestamp = formatTime();

    // Add user message to conversation
    setConversation(prev => [...prev, {
      sender: "user",
      message: userMessage,
      time: timestamp
    }]);

    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('https://r5m2o3uxbfo3sr-8010.proxy.runpod.net/api/rag/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage,
          filters: {
            meeting_id: meetingId
          },
          top_k: 5,
          include_sources: true
        })
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: RagResponse = await response.json();

      // Add AI response to conversation
      setConversation(prev => [...prev, {
        sender: "ai",
        message: data.answer,
        time: formatTime(),
        sources: data.sources
      }]);

    } catch (error) {
      console.error('RAG search error:', error);
      
      toast.error("Failed to get response", {
        description: error instanceof Error ? error.message : 'Could not process your query.'
      });

      // Add error message to conversation
      setConversation(prev => [...prev, {
        sender: "ai",
        message: "Sorry, I encountered an error processing your request. Please try again.",
        time: formatTime()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PanelLayout className="flex justify-center items-center w-full">
      <ScrollArea className="flex-1 w-80 sm:w-[95%] border rounded-md">
        <div className="h-120 px-4 flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {conversation.length === 0 ? (
            <div className="w-full text-center py-8 text-muted-foreground text-sm">
              Ask me anything about this meeting or uploaded documents!
            </div>
          ) : (
            conversation.map((msg, i) => (
              <div key={i} className={`w-96 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] p-2 rounded-lg text-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <div>{msg.message}</div>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 text-xs opacity-80">
                      <div className="font-semibold mb-1">Sources ({msg.sources.length}):</div>
                      {msg.sources.slice(0, 3).map((source, idx) => (
                        <div key={idx} className="mb-1">
                          • {source.collection} {source.timestamp && `(${source.timestamp})`}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="w-96 flex justify-start">
              <div className="max-w-[70%] p-2 rounded-lg text-sm bg-muted text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatButton 
        placeholder="Ask about the meeting or documents..." 
        Icon={Bot}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onSubmit={() => handleSendMessage()}
        disabled={isLoading}
      />
    </PanelLayout>
  );
};

export default AITab;