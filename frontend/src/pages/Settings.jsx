import { useEffect, useState } from "react";
import client from "../api/client";
import Navbar from "../components/Navbar";

const FREQUENCIES = ["daily", "weekly", "off"];

export default function Settings() {
  const [kbs, setKbs] = useState([]);
  const [prefs, setPrefs] = useState({});
  const [saving, setSaving] = useState({});
  const [saved, setSaved] = useState({});

  useEffect(() => {
    Promise.all([client.get("/kb"), client.get("/newsletter")]).then(([kbRes, prefRes]) => {
      setKbs(kbRes.data);
      const prefMap = {};
      for (const p of prefRes.data) prefMap[p.kb_id] = p.frequency;
      setPrefs(prefMap);
    });
  }, []);

  const updateFrequency = async (kbId, frequency) => {
    setSaving((prev) => ({ ...prev, [kbId]: true }));
    try {
      await client.put(`/newsletter/${kbId}`, { frequency });
      setPrefs((prev) => ({ ...prev, [kbId]: frequency }));
      setSaved((prev) => ({ ...prev, [kbId]: true }));
      setTimeout(() => setSaved((prev) => ({ ...prev, [kbId]: false })), 1500);
    } finally {
      setSaving((prev) => ({ ...prev, [kbId]: false }));
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10 animate-fade-in">

        <div className="mb-8">
          <p className="wm-label mb-2">Notifications</p>
          <h1 className="font-display text-3xl font-light text-wm-text1">Newsletter Settings</h1>
          <p className="text-wm-text2 text-sm mt-2">
            Choose how often you receive digest emails for each knowledge base.
          </p>
        </div>

        {kbs.length === 0 ? (
          <div className="wm-card p-10 text-center">
            <p className="text-wm-text2 text-sm">No knowledge bases found. Create one first.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {kbs.map((kb) => (
              <div key={kb.id} className="wm-card px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-display text-base font-light text-wm-text1 truncate">{kb.name}</p>
                  <p className="text-xs font-mono text-wm-text3 mt-0.5">digest frequency</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {saved[kb.id] && (
                    <span className="text-xs font-mono text-wm-green animate-fade-in">saved</span>
                  )}
                  <div className="flex gap-1">
                    {FREQUENCIES.map((f) => {
                      const active = (prefs[kb.id] || "off") === f;
                      return (
                        <button
                          key={f}
                          disabled={saving[kb.id]}
                          onClick={() => updateFrequency(kb.id, f)}
                          className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all duration-150 capitalize ${
                            active
                              ? "bg-wm-accent/10 border-wm-accent text-wm-accent"
                              : "bg-transparent border-wm-border text-wm-text2 hover:border-wm-border-light hover:text-wm-text1"
                          } disabled:opacity-40`}
                        >
                          {f}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs font-mono text-wm-text3 mt-6">
          Digests are generated using your document content and sent via Resend.
        </p>
      </div>
    </div>
  );
}
