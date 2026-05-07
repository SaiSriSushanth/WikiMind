import { useEffect, useState } from "react";
import client from "../api/client";
import KBCard from "../components/KBCard";
import Navbar from "../components/Navbar";

export default function Dashboard() {
  const [kbs, setKbs] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/kb").then((res) => {
      setKbs(res.data);
      setLoading(false);
    });
  }, []);

  const createKB = async (e) => {
    e.preventDefault();
    const res = await client.post("/kb", form);
    setKbs([...kbs, res.data]);
    setForm({ name: "", description: "" });
    setShowForm(false);
  };

  const handleUpdate = (updated) => {
    setKbs(kbs.map((kb) => (kb.id === updated.id ? updated : kb)));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10 animate-fade-in">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="wm-label mb-2">Your workspace</p>
            <h1 className="font-display text-3xl font-light text-wm-text1">Knowledge Bases</h1>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className={showForm ? "wm-btn-ghost" : "wm-btn-primary"}
          >
            {showForm ? "Cancel" : "+ New Base"}
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={createKB}
            className="wm-card p-5 mb-6 space-y-4 animate-slide-up border-wm-accent/30"
          >
            <p className="wm-label">New knowledge base</p>
            <input
              type="text"
              placeholder="Name your knowledge base…"
              className="wm-input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
            <input
              type="text"
              placeholder="Short description (optional)"
              className="wm-input"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="wm-btn-primary">Create</button>
              <button type="button" onClick={() => setShowForm(false)} className="wm-btn-ghost">Cancel</button>
            </div>
          </form>
        )}

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="wm-card p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : kbs.length === 0 ? (
          <div className="wm-card p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-wm-surface2 border border-wm-border flex items-center justify-center mx-auto mb-4">
              <span className="text-wm-accent text-xl font-display italic">W</span>
            </div>
            <p className="text-wm-text1 font-display text-lg font-light mb-1">No knowledge bases yet</p>
            <p className="text-wm-text2 text-sm mb-6">Create your first base and start uploading documents</p>
            <button onClick={() => setShowForm(true)} className="wm-btn-primary">
              Create your first base
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kbs.map((kb) => (
              <KBCard key={kb.id} kb={kb} onUpdate={handleUpdate} />
            ))}
          </div>
        )}

        {/* Stats bar */}
        {kbs.length > 0 && (
          <div className="mt-8 flex gap-6 text-xs font-mono text-wm-text3">
            <span>{kbs.length} base{kbs.length !== 1 ? "s" : ""}</span>
            <span>{kbs.filter((k) => k.is_active).length} active</span>
          </div>
        )}
      </div>
    </div>
  );
}
