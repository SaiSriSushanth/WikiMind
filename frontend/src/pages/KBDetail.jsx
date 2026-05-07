import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import Navbar from "../components/Navbar";
import DocumentUpload from "../components/DocumentUpload";
import WikiPageViewer from "../components/WikiPageViewer";

const STATUS_COLOR = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export default function KBDetail() {
  const { kbId } = useParams();
  const [kb, setKb] = useState(null);
  const [docs, setDocs] = useState([]);
  const [wikiPages, setWikiPages] = useState([]);
  const [selectedWiki, setSelectedWiki] = useState(null);
  const [tab, setTab] = useState("documents");
  const pollRef = useRef(null);

  useEffect(() => {
    client.get(`/kb`).then((res) => {
      const found = res.data.find((k) => k.id === kbId);
      setKb(found);
    });
    fetchDocs();
    client.get(`/kb/${kbId}/wiki`).then((res) => setWikiPages(res.data));
    return () => clearInterval(pollRef.current);
  }, [kbId]);

  const fetchDocs = async () => {
    const res = await client.get(`/kb/${kbId}/documents`);
    setDocs(res.data);
    const hasPending = res.data.some((d) => d.status === "pending" || d.status === "processing");
    if (hasPending) {
      clearInterval(pollRef.current);
      pollRef.current = setInterval(async () => {
        const updated = await client.get(`/kb/${kbId}/documents`);
        setDocs(updated.data);
        const stillPending = updated.data.some((d) => d.status === "pending" || d.status === "processing");
        if (!stillPending) {
          clearInterval(pollRef.current);
          client.get(`/kb/${kbId}/wiki`).then((r) => setWikiPages(r.data));
        }
      }, 5000);
    }
  };

  const handleUploaded = (doc) => {
    setDocs((prev) => [...prev, doc]);
    if (!pollRef.current) {
      pollRef.current = setInterval(async () => {
        const updated = await client.get(`/kb/${kbId}/documents`);
        setDocs(updated.data);
        const stillPending = updated.data.some((d) => d.status === "pending" || d.status === "processing");
        if (!stillPending) {
          clearInterval(pollRef.current);
          pollRef.current = null;
          client.get(`/kb/${kbId}/wiki`).then((r) => setWikiPages(r.data));
        }
      }, 5000);
    }
  };

  const loadWikiPage = async (pageId) => {
    const res = await client.get(`/kb/${kbId}/wiki/${pageId}`);
    setSelectedWiki(res.data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <Link to="/" className="text-sm text-indigo-600 hover:underline mb-4 block">
          &larr; Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 mb-6">{kb?.name || "Loading..."}</h1>

        <div className="flex gap-4 border-b mb-6">
          {["documents", "wiki"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelectedWiki(null); }}
              className={`pb-2 text-sm font-medium capitalize border-b-2 -mb-px ${
                tab === t ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "documents" && (
          <div>
            <div className="mb-4">
              <DocumentUpload kbId={kbId} onUploaded={handleUploaded} />
            </div>
            {docs.length === 0 ? (
              <p className="text-gray-500 text-sm">No documents yet.</p>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-lg border px-4 py-3 flex items-center justify-between">
                    <span className="text-sm text-gray-700">{doc.filename}</span>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_COLOR[doc.status] || ""}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "wiki" && !selectedWiki && (
          <div>
            {wikiPages.length === 0 ? (
              <p className="text-gray-500 text-sm">No wiki pages yet. Upload a document to generate one.</p>
            ) : (
              <div className="space-y-2">
                {wikiPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => loadWikiPage(page.id)}
                    className="w-full text-left bg-white rounded-lg border px-4 py-3 hover:border-indigo-300 transition"
                  >
                    <p className="font-medium text-gray-800">{page.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated {new Date(page.updated_at).toLocaleDateString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "wiki" && selectedWiki && (
          <div>
            <button
              onClick={() => setSelectedWiki(null)}
              className="text-sm text-indigo-600 hover:underline mb-4 block"
            >
              &larr; Back to wiki list
            </button>
            <WikiPageViewer content={selectedWiki.content_md} />
          </div>
        )}
      </div>
    </div>
  );
}
