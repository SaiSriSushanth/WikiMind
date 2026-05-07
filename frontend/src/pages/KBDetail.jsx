import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import Navbar from "../components/Navbar";
import DocumentUpload from "../components/DocumentUpload";
import WikiPageViewer from "../components/WikiPageViewer";

const STATUS = {
  pending:    { label: "pending",    cls: "text-wm-amber bg-wm-amber/10 border-wm-amber/20" },
  processing: { label: "processing", cls: "text-wm-blue  bg-wm-blue/10  border-wm-blue/20" },
  done:       { label: "done",       cls: "text-wm-green bg-wm-green/10 border-wm-green/20" },
  failed:     { label: "failed",     cls: "text-wm-red   bg-wm-red/10   border-wm-red/20"   },
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
    client.get(`/kb`).then((res) => setKb(res.data.find((k) => k.id === kbId)));
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
        if (!updated.data.some((d) => d.status === "pending" || d.status === "processing")) {
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
        if (!updated.data.some((d) => d.status === "pending" || d.status === "processing")) {
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
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-10 animate-fade-in">

        {/* Breadcrumb */}
        <Link to="/" className="text-xs font-mono text-wm-text2 hover:text-wm-accent transition-colors mb-6 block">
          ← knowledge bases
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="wm-label mb-2">Knowledge Base</p>
          <h1 className="font-display text-3xl font-light text-wm-text1">
            {kb?.name || <span className="animate-pulse text-wm-text3">Loading…</span>}
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b border-wm-border mb-6">
          {["documents", "wiki"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setSelectedWiki(null); }}
              className={`px-4 py-2.5 text-sm font-medium capitalize transition-all duration-150 border-b-2 -mb-px ${
                tab === t
                  ? "border-wm-accent text-wm-accent"
                  : "border-transparent text-wm-text2 hover:text-wm-text1"
              }`}
            >
              {t}
              {t === "documents" && docs.length > 0 && (
                <span className="ml-2 text-xs font-mono text-wm-text3">{docs.length}</span>
              )}
              {t === "wiki" && wikiPages.length > 0 && (
                <span className="ml-2 text-xs font-mono text-wm-text3">{wikiPages.length}</span>
              )}
            </button>
          ))}
        </div>

        {/* Documents tab */}
        {tab === "documents" && (
          <div className="animate-fade-in">
            <div className="mb-6">
              <DocumentUpload kbId={kbId} onUploaded={handleUploaded} />
            </div>
            {docs.length === 0 ? (
              <div className="wm-card p-10 text-center">
                <p className="text-wm-text2 text-sm">No documents yet — upload one to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {docs.map((doc) => {
                  const s = STATUS[doc.status] || STATUS.pending;
                  return (
                    <div key={doc.id} className="wm-card px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xs font-mono text-wm-text3 uppercase">
                          {doc.file_type}
                        </span>
                        <span className="text-sm text-wm-text1 truncate">{doc.filename}</span>
                      </div>
                      <span className={`shrink-0 text-xs font-mono px-2.5 py-1 rounded-full border ${s.cls}`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Wiki list */}
        {tab === "wiki" && !selectedWiki && (
          <div className="animate-fade-in">
            {wikiPages.length === 0 ? (
              <div className="wm-card p-10 text-center">
                <p className="text-wm-text2 text-sm">No wiki pages yet — upload a document to auto-generate one</p>
              </div>
            ) : (
              <div className="space-y-2">
                {wikiPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => loadWikiPage(page.id)}
                    className="w-full text-left wm-card-hover px-5 py-4 group"
                  >
                    <p className="font-display text-base font-light text-wm-text1 group-hover:text-wm-accent transition-colors">
                      {page.title}
                    </p>
                    <p className="text-xs font-mono text-wm-text3 mt-1">
                      updated {new Date(page.updated_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Wiki viewer */}
        {tab === "wiki" && selectedWiki && (
          <div className="animate-fade-in">
            <button
              onClick={() => setSelectedWiki(null)}
              className="text-xs font-mono text-wm-text2 hover:text-wm-accent transition-colors mb-6 block"
            >
              ← back to wiki list
            </button>
            <div className="wm-card p-8">
              <WikiPageViewer content={selectedWiki.content_md} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
