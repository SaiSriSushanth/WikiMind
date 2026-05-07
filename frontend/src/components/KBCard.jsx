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
    <div className="wm-card group flex flex-col gap-4 p-5 hover:border-wm-border-light transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-light text-wm-text1 leading-snug truncate">{kb.name}</h3>
          {kb.description && (
            <p className="text-xs text-wm-text2 mt-1 leading-relaxed line-clamp-2">{kb.description}</p>
          )}
        </div>

        {/* Toggle */}
        <button
          onClick={toggle}
          title={kb.is_active ? "Active — click to deactivate" : "Inactive — click to activate"}
          className={`relative shrink-0 w-9 h-5 rounded-full border transition-all duration-200 ${
            kb.is_active
              ? "bg-wm-accent/20 border-wm-accent"
              : "bg-wm-surface2 border-wm-border"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full transition-all duration-200 ${
              kb.is_active
                ? "left-[18px] bg-wm-accent"
                : "left-0.5 bg-wm-text3"
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between mt-auto pt-2 border-t border-wm-border">
        <span className={`text-xs font-mono ${kb.is_active ? "text-wm-green" : "text-wm-text3"}`}>
          {kb.is_active ? "● active" : "○ inactive"}
        </span>
        <Link
          to={`/kb/${kb.id}`}
          className="text-xs text-wm-text2 hover:text-wm-accent transition-colors duration-150 font-mono"
        >
          open →
        </Link>
      </div>
    </div>
  );
}
