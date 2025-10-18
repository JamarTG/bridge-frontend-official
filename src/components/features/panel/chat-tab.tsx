import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import MessageItem from "../message-item";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import ChatButton from "./chat-button";
import PanelLayout from "./layout";

const transcriptMessages = [
  { name: "Jamari McFarlane", message: "We need to do the homework", originalLanguageCode: "FR", time: "2:34 PM" },
  { name: "Jordan Campbell", message: "Yes I agree", originalLanguageCode: "FR", time: "2:34 PM" },
  { name: "Micheal Webb", message: "No, we do not have time", originalLanguageCode: "EN", time: "2:35 PM" },
];

const ChatTab = () => {
  const messagesEndRef = useScrollToBottom(transcriptMessages);

  return (
    <PanelLayout>
      <ScrollArea className="flex-1  w-[95%] border rounded-md">
        <div className=" px-8 flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {transcriptMessages.map((msg, index) => (
            <MessageItem
              key={index}
              name={msg.name}
              time={msg.time}
              message={msg.message}
              originalLangCode={msg.originalLanguageCode}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatButton placeholder="Type a message..." Icon={Send} />
    </PanelLayout>
  );
};

export default ChatTab;

