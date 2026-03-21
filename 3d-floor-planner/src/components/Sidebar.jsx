import { useState } from "react";
import { useStore } from "../store";
import { furnitureItems } from "../floorPlanData";

const ColorPicker = ({ label, value, onChange }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
    <label style={{ fontSize: 13, flex: 1, color: "#555" }}>{label}</label>
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: 36, height: 28, padding: 0, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}
      />
      <span style={{ fontSize: 11, color: "#888", fontFamily: "monospace" }}>{value}</span>
    </div>
  </div>
);

function RoomPanel() {
  const { rooms, selectedRoom, setRoomColor, setRoomLabel } = useStore();
  const room = rooms.find((r) => r.id === selectedRoom);
  if (!room) return <p style={{ color: "#888", fontSize: 13 }}>Click a room to edit it.</p>;

  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 15, color: "#1a1a2e" }}>{room.name}</div>
      {room.dimensions && (
        <div style={{ fontSize: 12, color: "#888", marginBottom: 12 }}>{room.dimensions}</div>
      )}
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: "#444", display: "block", marginBottom: 4 }}>Room Name</label>
        <input
          type="text"
          value={room.name}
          onChange={(e) => setRoomLabel(room.id, e.target.value)}
          style={{ width: "100%", padding: "6px 8px", border: "1px solid #ccc", borderRadius: 6, fontSize: 13, boxSizing: "border-box" }}
        />
      </div>
      <div style={{ marginBottom: 6, fontWeight: 600, fontSize: 12, color: "#444" }}>Colors</div>
      <ColorPicker label="Wall Color" value={room.wallColor} onChange={(c) => setRoomColor(room.id, "wall", c)} />
      <ColorPicker label="Floor Color" value={room.floorColor} onChange={(c) => setRoomColor(room.id, "floor", c)} />

      <div style={{ marginTop: 12, padding: "8px 10px", background: "#f0f4ff", borderRadius: 6, fontSize: 12, color: "#555" }}>
        <strong>Quick Presets</strong>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
          {[
            { label: "Cream", wall: "#f8f6f0", floor: "#d4c5a9" },
            { label: "Sky Blue", wall: "#e0eef8", floor: "#b8cce0" },
            { label: "Sage", wall: "#e8f0e8", floor: "#c0d0b8" },
            { label: "Warm Gray", wall: "#e8e4e0", floor: "#c0b8b0" },
            { label: "White", wall: "#ffffff", floor: "#eeeeee" },
            { label: "Terracotta", wall: "#f5e8df", floor: "#c8a080" },
            { label: "SW Rhythmic Blue", wall: "#ccdbe5", floor: "#b0c8d4", sw: "SW 6806" },
            { label: "SW Moonmist", wall: "#c9d9e0", floor: "#b0c4cc", sw: "SW 9144" },
            { label: "SW Wishful Blue", wall: "#d8dde6", floor: "#c0c8d4", sw: "SW 6813" },
          ].map((p) => (
            <button
              key={p.label}
              onClick={() => { setRoomColor(room.id, "wall", p.wall); }}
              title={p.sw ? `${p.label} · ${p.sw}` : p.label}
              style={{ fontSize: 11, padding: "3px 8px", border: "1px solid #ccc", borderRadius: p.sw ? 6 : 12, cursor: "pointer", background: p.wall, color: "#333", lineHeight: 1.3 }}
            >
              {p.label}
              {p.sw && <div style={{ fontSize: 9, color: "#666", marginTop: 1 }}>{p.sw}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FurniturePanel() {
  const { rooms, addFurniture, selectedRoom, selectedFurniture, placedFurniture, removeFurniture, rotateFurniture, setFurnitureColor } = useStore();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", "Living", "Dining", "Bedroom", "Kitchen", "Office", "Other"];
  const categoryMap = {
    Living: ["sofa", "loveseat", "coffee-table", "armchair", "tv-stand", "bookshelf", "rug", "plant"],
    Dining: ["dining-table", "dining-chair"],
    Bedroom: ["king-bed", "queen-bed", "twin-bed", "dresser", "nightstand"],
    Kitchen: ["kitchen-island"],
    Office: ["desk", "office-chair"],
    Other: ["bathtub", "toilet", "sink"],
  };

  const filtered = furnitureItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || (categoryMap[activeCategory] || []).includes(item.id);
    return matchesSearch && matchesCat;
  });

  const selectedFurnitureItem = placedFurniture.find((f) => f.instanceId === selectedFurniture);

  return (
    <div>
      {selectedFurnitureItem && (
        <div style={{ marginBottom: 12, padding: 10, background: "#f0f4ff", borderRadius: 8, border: "1px solid #c0d0ff" }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8 }}>
            {selectedFurnitureItem.name} — Selected
          </div>
          <div style={{ marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: "#666" }}>Furniture Color</label>
            <input
              type="color"
              value={selectedFurnitureItem.color}
              onChange={(e) => setFurnitureColor(selectedFurnitureItem.instanceId, e.target.value)}
              style={{ marginLeft: 8, width: 32, height: 24, padding: 0, border: "1px solid #ccc", borderRadius: 3, cursor: "pointer" }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => rotateFurniture(selectedFurnitureItem.instanceId, Math.PI / 4)}
              style={btnStyle("#6c757d")}
            >
              ↻ Rotate 45°
            </button>
            <button
              onClick={() => removeFurniture(selectedFurnitureItem.instanceId)}
              style={btnStyle("#dc3545")}
            >
              🗑 Remove
            </button>
          </div>
        </div>
      )}

      {!selectedRoom && !selectedFurnitureItem && (
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>
          Click a room first, then add furniture to it.
        </p>
      )}

      {selectedRoom && (
        <p style={{ fontSize: 12, color: "#2563eb", marginBottom: 8 }}>
          Adding to: <strong>{rooms.find((r) => r.id === selectedRoom)?.name}</strong>
        </p>
      )}

      <input
        type="text"
        placeholder="Search furniture..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ width: "100%", padding: "6px 10px", border: "1px solid #ccc", borderRadius: 6, fontSize: 12, marginBottom: 8, boxSizing: "border-box" }}
      />

      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              fontSize: 11, padding: "3px 8px", borderRadius: 12, cursor: "pointer",
              background: activeCategory === cat ? "#2563eb" : "#f0f0f0",
              color: activeCategory === cat ? "#fff" : "#333",
              border: "1px solid " + (activeCategory === cat ? "#2563eb" : "#ccc"),
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {filtered.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              if (!selectedRoom) { alert("Click a room in the 3D view first, then add furniture."); return; }
              addFurniture(item, selectedRoom);
            }}
            style={{
              padding: "8px 6px", border: "1px solid #ddd", borderRadius: 8,
              cursor: "pointer", background: "#fff", textAlign: "center",
              fontSize: 11, color: "#333",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = "#f0f4ff")}
            onMouseOut={(e) => (e.currentTarget.style.background = "#fff")}
          >
            <div style={{ fontSize: 20, marginBottom: 2 }}>{item.icon}</div>
            <div style={{ fontWeight: 500 }}>{item.name}</div>
            <div style={{ color: "#aaa", fontSize: 10 }}>{item.width}' × {item.depth}'</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function btnStyle(bg) {
  return {
    padding: "5px 10px", background: bg, color: "#fff",
    border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, flex: 1,
  };
}

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("rooms");

  const tabs = [
    { id: "rooms", label: "Rooms" },
    { id: "furniture", label: "Furniture" },
  ];

  return (
    <div style={{ width: 280, background: "#fff", borderRight: "1px solid #e0e0e0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <div style={{ display: "flex", borderBottom: "1px solid #e0e0e0" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "12px 0", border: "none", background: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              color: activeTab === tab.id ? "#2563eb" : "#666",
              borderBottom: activeTab === tab.id ? "2px solid #2563eb" : "2px solid transparent",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
        {activeTab === "rooms" ? <RoomPanel /> : <FurniturePanel />}
      </div>
    </div>
  );
}
