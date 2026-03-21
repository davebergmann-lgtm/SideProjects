import { useState, useRef } from "react";
import { useStore } from "../store";
import VersionsPanel from "./VersionsPanel";

export default function Toolbar({ onExport }) {
  const { showLabels, toggleLabels, setCameraView, cameraView } = useStore();
  const [showVersions, setShowVersions] = useState(false);

  const viewBtnStyle = (view) => ({
    padding: "6px 14px",
    background: cameraView === view ? "#2563eb" : "#f0f0f0",
    color: cameraView === view ? "#fff" : "#333",
    border: "1px solid " + (cameraView === view ? "#2563eb" : "#ccc"),
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: cameraView === view ? 600 : 400,
  });

  return (
    <div style={{
      height: 54, background: "#1a1a2e", display: "flex", alignItems: "center",
      padding: "0 16px", gap: 10, position: "relative", zIndex: 50,
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
    }}>
      {/* Logo / Title */}
      <div style={{ color: "#fff", fontWeight: 700, fontSize: 16, marginRight: 16, whiteSpace: "nowrap" }}>
        🏠 Patriot Floor Planner
      </div>

      {/* Camera Views */}
      <div style={{ display: "flex", gap: 4, marginRight: 8 }}>
        <span style={{ color: "#aaa", fontSize: 12, alignSelf: "center", marginRight: 4 }}>View:</span>
        <button style={viewBtnStyle("perspective")} onClick={() => setCameraView("perspective")}>3D</button>
        <button style={viewBtnStyle("top")} onClick={() => setCameraView("top")}>Top</button>
        <button style={viewBtnStyle("front")} onClick={() => setCameraView("front")}>Front</button>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: "#444" }} />

      {/* Labels toggle */}
      <button
        onClick={toggleLabels}
        style={{
          padding: "6px 12px", background: showLabels ? "#22c55e" : "#4b5563",
          color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13,
        }}
      >
        {showLabels ? "🏷 Labels On" : "🏷 Labels Off"}
      </button>

      {/* Divider */}
      <div style={{ width: 1, height: 28, background: "#444" }} />

      {/* Versions */}
      <button
        onClick={() => setShowVersions(!showVersions)}
        style={{ padding: "6px 12px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
      >
        💾 Versions
      </button>

      {showVersions && <VersionsPanel onClose={() => setShowVersions(false)} />}

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Export / Print */}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => onExport("png")}
          style={{ padding: "6px 14px", background: "#0891b2", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          📥 PNG
        </button>
        <button
          onClick={() => onExport("pdf")}
          style={{ padding: "6px 14px", background: "#dc2626", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          📄 PDF
        </button>
        <button
          onClick={() => onExport("print")}
          style={{ padding: "6px 14px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          🖨 Print
        </button>
      </div>
    </div>
  );
}
