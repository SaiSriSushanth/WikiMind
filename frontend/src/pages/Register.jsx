import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const { signUp } = useAuth();
  const [form, setForm] = useState({ email: "", password: "", full_name: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signUp(form.email, form.password, form.full_name);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-wm-surface border-r border-wm-border p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, #26262C 1px, transparent 1px), linear-gradient(to bottom, #26262C 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="relative z-10">
          <span className="font-display italic text-2xl text-wm-accent font-light">WikiMind</span>
        </div>
        <div className="relative z-10 space-y-6">
          <div className="w-12 h-px bg-wm-accent" />
          <h2 className="font-display text-4xl font-light leading-tight text-wm-text1">
            Build your second<br />
            <em className="text-wm-accent">brain today.</em>
          </h2>
          <p className="text-wm-text2 text-sm leading-relaxed max-w-xs">
            Upload PDFs, docs, and notes. WikiMind ingests them, generates wiki pages, and lets you query everything with AI.
          </p>
        </div>
        <div className="relative z-10 flex gap-8">
          {["Free to start", "No card required", "Instant setup"].map((f) => (
            <div key={f} className="text-xs font-mono text-wm-text3 uppercase tracking-widest">{f}</div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-slide-up">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-light text-wm-text1 mb-2">Create account</h1>
            <p className="text-wm-text2 text-sm">Start building your knowledge base</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="wm-label block mb-1.5">Full Name <span className="normal-case not-italic">(optional)</span></label>
              <input
                type="text"
                className="wm-input"
                placeholder="Your name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="wm-label block mb-1.5">Email</label>
              <input
                type="email"
                className="wm-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="wm-label block mb-1.5">Password</label>
              <input
                type="password"
                className="wm-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            {error && (
              <p className="text-wm-red text-xs font-mono bg-wm-red/10 border border-wm-red/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading} className="wm-btn-primary w-full mt-2">
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="text-center mt-6 text-sm text-wm-text2">
            Already have an account?{" "}
            <Link to="/login" className="text-wm-accent hover:underline underline-offset-2">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
