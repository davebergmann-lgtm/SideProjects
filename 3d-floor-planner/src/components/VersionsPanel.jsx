import { useState } from "react";
import { useStore } from "../store";

export default function VersionsPanel({ onClose }) {
  const { versions, saveVersion, loadVersion, deleteVersion, resetToDefault } = useStore();
  const [newLabel, setNewLabel] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const label = newLabel.trim() || `Version ${versions.length + 1}`;
    saveVersion(label);
    setNewLabel("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{
      position: "absolute", top: 60, right: 16, width: 320, background: "#fff",
      borderRadius: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.18)", zIndex: 100,
      border: "1px solid #e0e0e0",
    }}>
      <div style={{ padding: "14px 16px", borderBottom: "1px solid #e8e8e8", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Saved Versions</span>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#888" }}>×</button>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            type="text"
            placeholder="Version name..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSave()}
            style={{ flex: 1, padding: "7px 10px", border: "1px solid #ccc", borderRadius: 6, fontSize: 13 }}
          />
          <button
            onClick={handleSave}
            style={{ padding: "7px 14px", background: saved ? "#22c55e" : "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
          >
            {saved ? "Saved!" : "Save"}
          </button>
        </div>

        {versions.length === 0 ? (
          <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
            No saved versions yet. Save your current design!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 300, overflowY: "auto" }}>
            {versions.map((v) => (
              <div key={v.id} style={{ padding: "10px 12px", border: "1px solid #e8e8e8", borderRadius: 8, background: "#fafafa" }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{v.label}</div>
                <div style={{ fontSize: 11, color: "#aaa", marginBottom: 8 }}>
                  {new Date(v.createdAt).toLocaleString()}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => loadVersion(v.id)}
                    style={{ flex: 1, padding: "5px 0", background: "#2563eb", color: "#fff", border: "none", borderRadius: 5, cursor: "pointer", fontSize: 12 }}
                  >
                    Load
                  </button>
                  <button
                    onClick={() => deleteVersion(v.id)}
                    style={{ padding: "5px 10px", background: "#fee2e2", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 5, cursor: "pointer", fontSize: 12 }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #e8e8e8" }}>
          <button
            onClick={() => { if (confirm("Reset to default floor plan? This will discard unsaved changes.")) resetToDefault(); }}
            style={{ width: "100%", padding: "7px 0", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 6, cursor: "pointer", color: "#6b7280", fontSize: 12 }}
          >
            Reset to Default
          </button>
        </div>
      </div>
    </div>
  );
}
