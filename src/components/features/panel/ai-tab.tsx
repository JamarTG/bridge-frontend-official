import { ScrollArea } from "@/components/ui/scroll-area";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import { Bot } from "lucide-react";
import ChatButton from "./chat-button";
import PanelLayout from "./layout";

const aiConversation = [
  {
    sender: "user",
    message: "Hey, what can you do?",
    time: "10:15 AM",
  },
  {
    sender: "ai",
    message: "Hi! I can answer questions, help with code, or explain concepts clearly.",
    time: "10:15 AM",
  },
  {
    sender: "user",
    message: "Can you summarize a paragraph for me?",
    time: "10:16 AM",
  },
  {
    sender: "ai",
    message: "Of course! Just paste the paragraph and I'll summarize it concisely.",
    time: "10:16 AM",
  },
  {
    sender: "user",
    message: "How do I create a React component?",
    time: "10:17 AM",
  },
  {
    sender: "ai",
    message:
      "You can create one with: `function MyComponent() { return <div>Hello</div> }`. Want a TypeScript version?",
    time: "10:17 AM",
  },
  {
    sender: "user",
    message: "How do I create a React component?",
    time: "10:17 AM",
  },
  {
    sender: "ai",
    message:
      "You can create one with: `function MyComponent() { return <div>Hello</div> }`. Want a TypeScript version?",
    time: "10:17 AM",
  },
];

const AITab = () => {

  const messagesEndRef = useScrollToBottom([]);

  return (
    <PanelLayout className="flex justify-center items-center w-full">
      <ScrollArea className="flex-1 w-80 sm:w-[95%] border rounded-md">
        <div className="h-120 px-4 flex flex-col items-start justify-start space-y-2 pl-2 py-4">
          {aiConversation.map((msg, i) => (
            <div key={i} className={`w-96 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[70%] p-2 rounded-lg text-sm ${msg.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
                  }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <ChatButton placeholder="Type a message..." Icon={Bot} />
    </PanelLayout>
  )
}

export default AITab;
