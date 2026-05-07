import { Link } from "react-router-dom";
import client from "../api/client";

export default function KBCard({ kb, onUpdate }) {
  const toggle = async () => {
    try {
      const res = await client.patch(`/kb/${kb.id}/toggle`);
      onUpdate(res.data);
    } catch {}
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">{kb.name}</h3>
          {kb.description && <p className="text-sm text-gray-500 mt-1">{kb.description}</p>}
        </div>
        <button
          onClick={toggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            kb.is_active ? "bg-indigo-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              kb.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      <Link
        to={`/kb/${kb.id}`}
        className="text-sm text-indigo-600 hover:underline mt-auto"
      >
        View documents & wiki
      </Link>
    </div>
  );
}
