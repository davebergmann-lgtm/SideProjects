import { useRef, useCallback } from "react";
import Scene3D from "./components/Scene3D";
import Sidebar from "./components/Sidebar";
import Toolbar from "./components/Toolbar";
import RoomList from "./components/RoomList";
import { useStore } from "./store";
import jsPDF from "jspdf";

export default function App() {
  const canvasRef = useRef(null);

  const handleExport = useCallback(async (format) => {
    const canvas = document.querySelector("canvas");
    if (!canvas) { alert("Canvas not found."); return; }

    if (format === "print") {
      const dataUrl = canvas.toDataURL("image/png");
      const win = window.open("", "_blank");
      const { rooms: currentRooms, placedFurniture: currentFurniture } = useStore.getState();

      win.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Patriot Floor Plan</title>
          <style>
            body { margin: 0; padding: 20px; font-family: sans-serif; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .subtitle { font-size: 14px; color: #666; margin-bottom: 16px; }
            img { max-width: 100%; border: 1px solid #ddd; border-radius: 8px; }
            .footer { margin-top: 16px; font-size: 11px; color: #999; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
            th { background: #1a1a2e; color: #fff; padding: 6px 10px; text-align: left; }
            td { padding: 5px 10px; border-bottom: 1px solid #eee; }
            tr:nth-child(even) { background: #f8f8f8; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>Patriot — 3D Floor Plan</h1>
          <div class="subtitle">4 bd · 3 ba · 1 half ba · 3,004 ft² | Generated: ${new Date().toLocaleString()}</div>
          <img src="${dataUrl}" />
          <table>
            <thead><tr><th>Room</th><th>Dimensions</th><th>Wall Color</th><th>Floor Color</th></tr></thead>
            <tbody>
              ${currentRooms.map((r) => `
                <tr>
                  <td>${r.name}</td>
                  <td>${r.dimensions || "—"}</td>
                  <td><span style="display:inline-block;width:12px;height:12px;background:${r.wallColor};border:1px solid #ccc;margin-right:5px;vertical-align:middle"></span>${r.wallColor}</td>
                  <td><span style="display:inline-block;width:12px;height:12px;background:${r.floorColor};border:1px solid #ccc;margin-right:5px;vertical-align:middle"></span>${r.floorColor}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
          ${currentFurniture.length > 0 ? `
            <h3 style="margin-top:20px;">Furniture Placed (${currentFurniture.length} items)</h3>
            <table>
              <thead><tr><th>Item</th><th>Room</th><th>Dimensions</th><th>Color</th></tr></thead>
              <tbody>
                ${currentFurniture.map((f) => {
                  const room = currentRooms.find((r) => r.id === f.roomId);
                  return `<tr>
                    <td>${f.name}</td>
                    <td>${room ? room.name : "—"}</td>
                    <td>${f.width}' × ${f.depth}'</td>
                    <td><span style="display:inline-block;width:12px;height:12px;background:${f.color};border:1px solid #ccc;margin-right:5px;vertical-align:middle"></span>${f.color}</td>
                  </tr>`;
                }).join("")}
              </tbody>
            </table>
          ` : ""}
          <div class="footer">Patriot Floor Planner · Exported ${new Date().toLocaleDateString()}</div>
          <script>window.onload = () => window.print();<\/script>
        </body>
        </html>
      `);
      win.document.close();
      return;
    }

    const dataUrl = canvas.toDataURL("image/png");

    if (format === "png") {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `patriot-floor-plan-${Date.now()}.png`;
      link.click();
      return;
    }

    if (format === "pdf") {
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = 297;
      const pageH = 210;

      pdf.setFillColor(26, 26, 46);
      pdf.rect(0, 0, pageW, 18, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("Patriot — 3D Floor Plan", 10, 12);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      pdf.text(`4 bd · 3 ba · 1 half ba · 3,004 ft²  |  ${new Date().toLocaleString()}`, 10, 16.5);

      const imgX = 10;
      const imgY = 22;
      const imgW = pageW - 140;
      const imgH = pageH - 34;
      pdf.addImage(dataUrl, "PNG", imgX, imgY, imgW, imgH);

      const tableX = imgX + imgW + 6;
      const tableW = pageW - tableX - 6;
      pdf.setFillColor(240, 244, 255);
      pdf.rect(tableX, imgY, tableW, 7, "F");
      pdf.setTextColor(26, 26, 46);
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "bold");
      pdf.text("Room", tableX + 1, imgY + 5);
      pdf.text("Dimensions", tableX + 30, imgY + 5);

      const { rooms: currentRooms, placedFurniture: currentFurniture } = useStore.getState();
      let rowY = imgY + 12;
      currentRooms.forEach((room, i) => {
        if (rowY > pageH - 14) return;
        if (i % 2 === 0) {
          pdf.setFillColor(248, 248, 248);
          pdf.rect(tableX, rowY - 4, tableW, 6, "F");
        }
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(50, 50, 50);
        pdf.text(room.name.substring(0, 18), tableX + 1, rowY);
        pdf.text(room.dimensions || "—", tableX + 30, rowY);
        rowY += 6;
      });

      pdf.setFillColor(240, 240, 240);
      pdf.rect(0, pageH - 10, pageW, 10, "F");
      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(7);
      pdf.text(`Patriot Floor Planner · ${new Date().toLocaleDateString()} · ${currentFurniture.length} furniture items placed`, 10, pageH - 3);

      pdf.save(`patriot-floor-plan-${Date.now()}.pdf`);
    }
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <Toolbar onExport={handleExport} />
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <RoomList />
        <div style={{ flex: 1, position: "relative" }}>
          <Scene3D canvasRef={canvasRef} />
          <div style={{
            position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.6)", color: "#fff", padding: "8px 16px",
            borderRadius: 20, fontSize: 12, pointerEvents: "none", whiteSpace: "nowrap",
          }}>
            Drag to orbit · Scroll to zoom · Click room to select · Right-click to pan
          </div>
        </div>
        <Sidebar />
      </div>
    </div>
  );
}
