import ReactMarkdown from "react-markdown";

export default function WikiPageViewer({ content }) {
  return (
    <div className="prose prose-indigo max-w-none">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
