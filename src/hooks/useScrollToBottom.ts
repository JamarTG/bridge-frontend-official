import { useEffect, useRef } from "react";

export const useScrollToBottom = (deps: any[] = []) => {

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, deps);

  return messagesEndRef;
};