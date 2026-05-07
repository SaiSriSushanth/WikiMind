import { useEffect, useState } from "react";
import client from "../api/client";
import Navbar from "../components/Navbar";

const FREQUENCIES = ["daily", "weekly", "off"];

export default function Settings() {
  const [kbs, setKbs] = useState([]);
  const [prefs, setPrefs] = useState({});
  const [saving, setSaving] = useState({});

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
    } finally {
      setSaving((prev) => ({ ...prev, [kbId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Newsletter Settings</h1>
        {kbs.length === 0 ? (
          <p className="text-gray-500 text-sm">No knowledge bases found.</p>
        ) : (
          <div className="space-y-3">
            {kbs.map((kb) => (
              <div key={kb.id} className="bg-white rounded-xl border px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{kb.name}</p>
                  <p className="text-xs text-gray-400">Digest frequency</p>
                </div>
                <select
                  value={prefs[kb.id] || "off"}
                  onChange={(e) => updateFrequency(kb.id, e.target.value)}
                  disabled={saving[kb.id]}
                  className="border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {FREQUENCIES.map((f) => (
                    <option key={f} value={f}>
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
