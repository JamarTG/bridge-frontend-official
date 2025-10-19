import { createContext, useState, useContext, type Dispatch, type ReactNode, type SetStateAction } from "react";

const RoomIdContext = createContext<{ roomId: string | null; setRoomId: Dispatch<SetStateAction<string | null>> } | undefined>(undefined);

export const RoomIdProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const [roomId, setRoomId] = useState<string | null>(null);

    return (
        <RoomIdContext.Provider value={{ roomId, setRoomId }}>
            {children}
        </RoomIdContext.Provider>
    );
}

export const useRoomId = () => {
    const context = useContext(RoomIdContext);
    if (context === undefined) {
        throw new Error("useRoomId must be used within a RoomIdProvider");
    }

    return context;
}