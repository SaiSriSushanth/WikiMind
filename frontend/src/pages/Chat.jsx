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

    let assistantMsg = { role: "assistant", content: "" };
    setMessages((prev) => [...prev, assistantMsg]);

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden max-w-6xl mx-auto w-full px-6 py-4 gap-4">
        <aside className="w-56 shrink-0">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 uppercase tracking-wide">Knowledge Bases</h2>
          <div className="space-y-2">
            {kbs.map((kb) => (
              <label key={kb.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedKbs.has(kb.id)}
                  onChange={() => toggleKb(kb.id)}
                  className="rounded text-indigo-600"
                />
                <span className="text-sm text-gray-700">{kb.name}</span>
              </label>
            ))}
            {kbs.length === 0 && <p className="text-xs text-gray-400">No active KBs</p>}
          </div>
        </aside>

        <div className="flex-1 bg-white rounded-xl border flex flex-col overflow-hidden">
          <ChatWindow messages={messages} />
          <form onSubmit={handleSend} className="border-t p-4 flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={streaming}
            />
            <button
              type="submit"
              disabled={streaming || !input.trim() || selectedKbs.size === 0}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {streaming ? "..." : "Send"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
