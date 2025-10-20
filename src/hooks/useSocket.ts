import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type IoOpts = Parameters<typeof io>[1];

export function useSocket(url: string, opts?: IoOpts) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(url, {
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelayMax: 3000,
      timeout: 10000,
      autoConnect: true,
      ...opts,
    });
    socketRef.current = socket;

    const onConnect = () => {
      console.log("Socket connected");
      setConnected(true);
    };
    
    const onDisconnect = () => {
      console.log("Socket disconnected");
      setConnected(false);
    };
    
    const onError = (err: any) => console.error("Socket error:", err);
    
    const onConnectError = (err: any) =>
      console.error("Connect error:", err?.message || err);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("error", onError);
    socket.on("connect_error", onConnectError);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("error", onError);
      socket.off("connect_error", onConnectError);
      socket.disconnect();
    };
  }, [url]);

  const emit = (event: string, payload?: any, callback?: (...args: any[]) => void) => {
    if (callback) {
      socketRef.current?.emit(event, payload, callback);
    } else {
      socketRef.current?.emit(event, payload);
    }
  };

  const on = (event: string, handler: (...args: any[]) => void) =>
    socketRef.current?.on(event, handler);
  
  const off = (event: string, handler: (...args: any[]) => void) =>
    socketRef.current?.off(event, handler);

  return { socket: socketRef.current, connected, emit, on, off };
}