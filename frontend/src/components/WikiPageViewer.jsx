import ReactMarkdown from "react-markdown";

export default function WikiPageViewer({ content }) {
  return (
    <div className="prose prose-invert max-w-none
      prose-headings:font-display prose-headings:font-light
      prose-h1:text-wm-text1
      prose-h2:text-wm-text1 prose-h2:border-b prose-h2:border-wm-border prose-h2:pb-2
      prose-h3:text-wm-text1
      prose-p:text-wm-text1 prose-p:leading-relaxed
      prose-li:text-wm-text1
      prose-strong:text-wm-text1 prose-strong:font-semibold
      prose-a:text-wm-accent prose-a:no-underline hover:prose-a:underline
      prose-code:text-wm-accent prose-code:bg-wm-surface2 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
      prose-blockquote:border-l-wm-accent prose-blockquote:text-wm-text2
      prose-hr:border-wm-border">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
