import { useState } from "react";
import client from "../api/client";

export default function DocumentUpload({ kbId, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await client.post(`/kb/${kbId}/documents`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUploaded(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div>
      <label className={`inline-flex items-center gap-2 cursor-pointer wm-btn-primary ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}>
        <span className="text-base leading-none">{uploading ? "↑" : "+"}</span>
        <span>{uploading ? "Uploading…" : "Upload Document"}</span>
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
      <p className="text-xs font-mono text-wm-text3 mt-2">PDF · DOCX · TXT — max 20 MB</p>
      {error && (
        <p className="text-wm-red text-xs font-mono bg-wm-red/10 border border-wm-red/20 rounded px-3 py-2 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}
