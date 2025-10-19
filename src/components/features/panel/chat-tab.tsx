import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import MessageItem from "../message-item";
import ChatButton from "./chat-button";
import PanelLayout from "./layout";

interface Message {
  username: string;
  message: string;
  timestamp: string;
  socketId: string;
  isSystem: boolean;
}

interface ChatTabProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  connected: boolean;
  username: string;
  emit: any; // Socket emit function
  userLanguage?: string; // User's preferred language
}

interface MessageTranslation {
  [messageId: string]: {
    text: string;
    isLoading: boolean;
  };
}

const ChatTab = ({ 
  messages, 
  onSendMessage, 
  connected, 
  username,
  emit,
  userLanguage = "en"
}: ChatTabProps) => {
  const [messageInput, setMessageInput] = useState("");
  const [translations, setTranslations] = useState<MessageTranslation>({});

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = messageInput.trim();
    if (!text || !connected) return;

    onSendMessage(text);
    setMessageInput("");
  };

  const handleTranslate = (messageId: string, originalText: string) => {
    if (!emit || !connected) {
      console.error("Socket not available");
      return;
    }

    console.log(`🌐 Requesting translation for message ${messageId} to ${userLanguage}`);

    // Mark as loading
    setTranslations(prev => ({
      ...prev,
      [messageId]: { text: "", isLoading: true }
    }));

    // Request translation
    emit(
      "translate-chat-message",
      {
        messageText: originalText,
        targetLanguage: userLanguage,
        messageId
      },
      (response: { success?: boolean; translatedText?: string; error?: string; messageId?: string }) => {
        console.log('Translation response:', response);
        
        if (response.success && response.translatedText) {
          console.log(`✅ Translation received: ${response.translatedText}`);
          setTranslations(prev => ({
            ...prev,
            [messageId]: { 
              text: response.translatedText!, 
              isLoading: false 
            }
          }));
        } else {
          console.error("❌ Translation failed:", response.error);
          // Remove loading state on error
          setTranslations(prev => {
            const newTranslations = { ...prev };
            delete newTranslations[messageId];
            return newTranslations;
          });
        }
      }
    );
  };

  const getMessageId = (msg: Message, index: number) => 
    `${msg.socketId}-${msg.timestamp}-${index}`;

  return (
    <PanelLayout className="flex justify-center items-center w-full">
      <ScrollArea className="flex-1 w-80 sm:w-[95%] border rounded-md">
        <div className="h-120 px-4 flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {messages.length === 0 ? (
            <div className="h-full flex justify-center items-center text-center w-full py-8 text-muted-foreground text-sm">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const messageId = getMessageId(msg, index);
              const translationData = translations[messageId];

              return (
                <MessageItem
                  key={messageId}
                  name={msg.username}
                  time={new Date(msg.timestamp).toLocaleTimeString()}
                  message={msg.message}
                  originalLangCode={msg.isSystem ? "SYSTEM" : "EN"}
                  messageId={messageId}
                  onTranslate={handleTranslate}
                  translation={translationData?.text}
                  isTranslating={translationData?.isLoading}
                />
              );
            })
          )}
        </div>
      </ScrollArea>

      <ChatButton
        Icon={Send}
        placeholder="Type a message..."
        value={messageInput}
        onChange={(e) => setMessageInput(e.target.value)}
        onSubmit={handleSendMessage}
        disabled={!connected}
      />
    </PanelLayout>
  );
};

export default ChatTab;