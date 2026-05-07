import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
      {messages.length === 0 && (
        <div className="h-full flex flex-col items-center justify-center text-center py-16">
          <div className="w-12 h-12 rounded-full bg-wm-surface2 border border-wm-border flex items-center justify-center mb-4">
            <span className="font-display italic text-wm-accent text-xl">W</span>
          </div>
          <p className="text-wm-text1 font-display text-lg font-light mb-1">Ask anything</p>
          <p className="text-wm-text2 text-xs max-w-xs">
            Select knowledge bases from the sidebar, then ask a question about your documents.
          </p>
        </div>
      )}
      {messages.map((msg, i) => (
        <MessageBubble key={i} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
