import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function useSSE() {
  const [streaming, setStreaming] = useState(false);

  const sendMessage = useCallback(async (query, kbIds, onToken, onDone) => {
    setStreaming(true);
    const token = localStorage.getItem("wm_token");

    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ query, kb_ids: kbIds }),
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            setStreaming(false);
            onDone?.();
            return;
          }
          onToken(data);
        }
      }
    }
    setStreaming(false);
    onDone?.();
  }, []);

  return { streaming, sendMessage };
}
