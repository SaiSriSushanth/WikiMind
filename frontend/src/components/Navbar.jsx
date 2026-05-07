import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-wm-bg/90 backdrop-blur-md border-b border-wm-border">
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link to="/" className="font-display italic font-light text-xl text-wm-accent tracking-tight">
          WikiMind
        </Link>

        <div className="flex items-center gap-1">
          {[
            { path: "/", label: "Bases" },
            { path: "/chat", label: "Chat" },
            { path: "/settings", label: "Settings" },
          ].map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${
                isActive(path)
                  ? "text-wm-accent bg-wm-accent-dim"
                  : "text-wm-text2 hover:text-wm-text1 hover:bg-wm-surface2"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-wm-surface2 border border-wm-border flex items-center justify-center">
            <span className="text-xs font-mono text-wm-accent">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </span>
          </div>
          <button
            onClick={signOut}
            className="text-xs text-wm-text2 hover:text-wm-red transition-colors duration-150 font-mono"
          >
            sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
