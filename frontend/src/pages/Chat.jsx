import { useEffect, useState } from "react";
import client from "../api/client";
import Navbar from "../components/Navbar";
import ChatWindow from "../components/ChatWindow";
import { useSSE } from "../hooks/useSSE";

export default function Chat() {
  const [kbs, setKbs] = useState([]);
  const [selectedKbs, setSelectedKbs] = useState(new Set());
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const { streaming, sendMessage } = useSSE();

  useEffect(() => {
    client.get("/kb").then((res) => {
      const active = res.data.filter((kb) => kb.is_active);
      setKbs(active);
      setSelectedKbs(new Set(active.map((kb) => kb.id)));
    });
  }, []);

  const toggleKb = (id) => {
    setSelectedKbs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || streaming || selectedKbs.size === 0) return;

    const query = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await sendMessage(
      query,
      [...selectedKbs],
      (token) => {
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            ...updated[updated.length - 1],
            content: updated[updated.length - 1].content + token,
          };
          return updated;
        });
      },
      null
    );
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full px-6 py-4 gap-4">

        {/* Sidebar */}
        <aside className="w-52 shrink-0 flex flex-col gap-4">
          <div>
            <p className="wm-label mb-3">Sources</p>
            <div className="space-y-1.5">
              {kbs.map((kb) => (
                <label
                  key={kb.id}
                  className={`flex items-center gap-2.5 cursor-pointer px-3 py-2 rounded-lg border transition-all duration-150 ${
                    selectedKbs.has(kb.id)
                      ? "border-wm-accent/40 bg-wm-accent/5 text-wm-text1"
                      : "border-wm-border bg-wm-surface text-wm-text2 hover:border-wm-border-light"
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${
                    selectedKbs.has(kb.id) ? "bg-wm-accent border-wm-accent" : "border-wm-border"
                  }`}>
                    {selectedKbs.has(kb.id) && (
                      <svg className="w-2.5 h-2.5 text-wm-bg" fill="currentColor" viewBox="0 0 12 12">
                        <path d="M10 3L5 8.5 2 5.5" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedKbs.has(kb.id)}
                    onChange={() => toggleKb(kb.id)}
                    className="hidden"
                  />
                  <span className="text-xs truncate">{kb.name}</span>
                </label>
              ))}
              {kbs.length === 0 && (
                <p className="text-xs font-mono text-wm-text3 px-1">No active bases</p>
              )}
            </div>
          </div>

          {selectedKbs.size > 0 && (
            <p className="text-xs font-mono text-wm-text3">
              {selectedKbs.size} source{selectedKbs.size !== 1 ? "s" : ""} selected
            </p>
          )}
        </aside>

        {/* Chat panel */}
        <div className="flex-1 wm-card flex flex-col overflow-hidden">
          <ChatWindow messages={messages} />

          <div className="border-t border-wm-border p-4">
            <form onSubmit={handleSend} className="flex gap-3 items-end">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
                }}
                onKeyDown={handleKeyDown}
                placeholder={selectedKbs.size === 0 ? "Select a source to start chatting…" : "Ask a question… (Enter to send)"}
                disabled={streaming || selectedKbs.size === 0}
                className="flex-1 wm-input resize-none overflow-hidden min-h-[42px] leading-relaxed disabled:opacity-50"
                style={{ height: "42px" }}
              />
              <button
                type="submit"
                disabled={streaming || !input.trim() || selectedKbs.size === 0}
                className="wm-btn-primary shrink-0 h-[42px] px-4"
              >
                {streaming ? (
                  <span className="flex gap-1 items-center">
                    <span className="w-1 h-1 rounded-full bg-wm-bg animate-pulse" />
                    <span className="w-1 h-1 rounded-full bg-wm-bg animate-pulse" style={{ animationDelay: "150ms" }} />
                    <span className="w-1 h-1 rounded-full bg-wm-bg animate-pulse" style={{ animationDelay: "300ms" }} />
                  </span>
                ) : "Send"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
