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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Knowledge Bases</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
          >
            + New KB
          </button>
        </div>

        {showForm && (
          <form onSubmit={createKB} className="bg-white rounded-xl border p-5 mb-6 space-y-3">
            <input
              type="text"
              placeholder="Name"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Description (optional)"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : kbs.length === 0 ? (
          <p className="text-gray-500">No knowledge bases yet. Create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {kbs.map((kb) => (
              <KBCard key={kb.id} kb={kb} onUpdate={handleUpdate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
