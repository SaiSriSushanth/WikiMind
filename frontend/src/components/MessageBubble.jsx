import ReactMarkdown from "react-markdown";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[72%] bg-wm-surface2 border border-wm-border-light rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-wm-text1 leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-3">
      <div className="shrink-0 w-7 h-7 rounded-full bg-wm-accent/10 border border-wm-accent/30 flex items-center justify-center mt-0.5">
        <span className="text-xs font-display italic text-wm-accent">W</span>
      </div>
      <div className="max-w-[80%] bg-wm-surface border border-wm-border rounded-2xl rounded-tl-sm px-4 py-3">
        {message.content ? (
          <div className="prose prose-invert prose-sm max-w-none
            prose-p:text-wm-text2 prose-p:text-sm prose-p:leading-relaxed prose-p:my-1
            prose-headings:text-wm-text1 prose-headings:font-display prose-headings:font-light
            prose-code:text-wm-accent prose-code:bg-wm-surface2 prose-code:px-1 prose-code:rounded prose-code:text-xs
            prose-strong:text-wm-text1
            prose-li:text-wm-text2 prose-li:text-sm
            prose-a:text-wm-accent">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex gap-1 py-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-wm-text3 animate-pulse"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
