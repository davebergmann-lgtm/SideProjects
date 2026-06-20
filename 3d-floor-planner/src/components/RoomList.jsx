import { useStore } from "../store";

export default function RoomList() {
  const { rooms, selectedRoom, setSelectedRoom } = useStore();

  const mainRooms = rooms.filter((r) => !r.isNextGen);
  const nextGenRooms = rooms.filter((r) => r.isNextGen);

  const RoomItem = ({ room }) => (
    <button
      onClick={() => setSelectedRoom(room.id === selectedRoom ? null : room.id)}
      style={{
        width: "100%", padding: "8px 12px", display: "flex", alignItems: "center",
        gap: 10, border: "none", borderRadius: 6, cursor: "pointer", textAlign: "left",
        background: selectedRoom === room.id ? "#eff6ff" : "transparent",
        borderLeft: selectedRoom === room.id ? "3px solid #2563eb" : "3px solid transparent",
        marginBottom: 2,
      }}
      onMouseOver={(e) => { if (selectedRoom !== room.id) e.currentTarget.style.background = "#f8f8f8"; }}
      onMouseOut={(e) => { if (selectedRoom !== room.id) e.currentTarget.style.background = "transparent"; }}
    >
      <div style={{ width: 14, height: 14, borderRadius: 3, background: room.floorColor, border: "1px solid #ccc", flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {room.name}
        </div>
        {room.dimensions && <div style={{ fontSize: 10, color: "#aaa" }}>{room.dimensions}</div>}
      </div>
    </button>
  );

  return (
    <div style={{ width: 200, background: "#fafafa", borderRight: "1px solid #e8e8e8", overflowY: "auto", padding: "12px 8px" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#888", textTransform: "uppercase", letterSpacing: 1, padding: "0 4px 8px" }}>
        Main Home
      </div>
      {mainRooms.map((r) => <RoomItem key={r.id} room={r} />)}

      <div style={{ fontSize: 11, fontWeight: 700, color: "#4a7bb5", textTransform: "uppercase", letterSpacing: 1, padding: "12px 4px 8px" }}>
        Next Gen Suite
      </div>
      {nextGenRooms.map((r) => <RoomItem key={r.id} room={r} />)}
    </div>
  );
}
