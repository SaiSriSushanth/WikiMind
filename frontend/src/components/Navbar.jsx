import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Navbar() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const linkClass = (path) =>
    `text-sm font-medium ${location.pathname === path ? "text-indigo-600" : "text-gray-600 hover:text-indigo-600"}`;

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-indigo-600">
        WikiMind
      </Link>
      <div className="flex items-center gap-6">
        <Link to="/" className={linkClass("/")}>Dashboard</Link>
        <Link to="/chat" className={linkClass("/chat")}>Chat</Link>
        <Link to="/settings" className={linkClass("/settings")}>Settings</Link>
        <div className="flex items-center gap-3 ml-4">
          <span className="text-sm text-gray-500">{user?.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
