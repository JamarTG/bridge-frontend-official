import { createContext, useState, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";

interface Message {
  username: string;
  message: string;
  timestamp: string;
  socketId: string;
  isSystem: boolean;
}

interface ChatContextType {
  messages: Message[];
  setMessages: Dispatch<SetStateAction<Message[]>>;
  connected: boolean;
  setConnected: Dispatch<SetStateAction<boolean>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string>>;
  roomId: string;
  setRoomId: Dispatch<SetStateAction<string>>;
  // Instead of storing the function, store the emit function
  emitMessage: ((data: { roomId: string; username: string; message: string }) => void) | null;
  setEmitMessage: Dispatch<SetStateAction<((data: { roomId: string; username: string; message: string }) => void) | null>>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connected, setConnected] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [emitMessage, setEmitMessage] = useState<((data: { roomId: string; username: string; message: string }) => void) | null>(null);

  return (
    <ChatContext.Provider
      value={{
        messages,
        setMessages,
        connected,
        setConnected,
        username,
        setUsername,
        roomId,
        setRoomId,
        emitMessage,
        setEmitMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};