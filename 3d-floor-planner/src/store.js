import { create } from "zustand";
import { persist } from "zustand/middleware";
import { defaultRooms } from "./floorPlanData";

const createVersion = (label, rooms, placedFurniture) => ({
  id: Date.now().toString(),
  label,
  createdAt: new Date().toISOString(),
  rooms: JSON.parse(JSON.stringify(rooms)),
  placedFurniture: JSON.parse(JSON.stringify(placedFurniture)),
});

export const useStore = create(
  persist(
    (set, get) => ({
      rooms: defaultRooms,
      placedFurniture: [],
      selectedRoom: null,
      selectedFurniture: null,
      versions: [],
      showLabels: true,
      cameraView: "perspective",
      isDraggingFurniture: false,

      setIsDraggingFurniture: (val) => set({ isDraggingFurniture: val }),

      setRoomColor: (roomId, type, color) =>
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, [type === "wall" ? "wallColor" : "floorColor"]: color } : r
          ),
        })),

      setRoomLabel: (roomId, name) =>
        set((state) => ({
          rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, name } : r)),
        })),

      setSelectedRoom: (roomId) => set({ selectedRoom: roomId, selectedFurniture: null }),

      setSelectedFurniture: (furnitureId) => set({ selectedFurniture: furnitureId, selectedRoom: null }),

      addFurniture: (item, roomId) => {
        const room = get().rooms.find((r) => r.id === roomId);
        if (!room) return;
        const placed = {
          instanceId: Date.now().toString() + Math.random(),
          ...item,
          roomId,
          // position center of room
          posX: room.x + room.width / 2,
          posZ: room.y + room.depth / 2,
          rotation: 0,
          color: item.color,
        };
        set((state) => ({ placedFurniture: [...state.placedFurniture, placed] }));
        return placed.instanceId;
      },

      removeFurniture: (instanceId) =>
        set((state) => ({
          placedFurniture: state.placedFurniture.filter((f) => f.instanceId !== instanceId),
          selectedFurniture: state.selectedFurniture === instanceId ? null : state.selectedFurniture,
        })),

      moveFurniture: (instanceId, posX, posZ) =>
        set((state) => ({
          placedFurniture: state.placedFurniture.map((f) =>
            f.instanceId === instanceId ? { ...f, posX, posZ } : f
          ),
        })),

      rotateFurniture: (instanceId, delta) =>
        set((state) => ({
          placedFurniture: state.placedFurniture.map((f) =>
            f.instanceId === instanceId ? { ...f, rotation: (f.rotation + delta) % (Math.PI * 2) } : f
          ),
        })),

      setFurnitureColor: (instanceId, color) =>
        set((state) => ({
          placedFurniture: state.placedFurniture.map((f) =>
            f.instanceId === instanceId ? { ...f, color } : f
          ),
        })),

      toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),

      setCameraView: (view) => set({ cameraView: view }),

      saveVersion: (label) => {
        const { rooms, placedFurniture, versions } = get();
        const version = createVersion(label, rooms, placedFurniture);
        set({ versions: [...versions, version] });
        return version.id;
      },

      loadVersion: (versionId) => {
        const version = get().versions.find((v) => v.id === versionId);
        if (version) {
          set({
            rooms: version.rooms,
            placedFurniture: version.placedFurniture,
            selectedRoom: null,
            selectedFurniture: null,
          });
        }
      },

      deleteVersion: (versionId) =>
        set((state) => ({ versions: state.versions.filter((v) => v.id !== versionId) })),

      resetToDefault: () =>
        set({ rooms: defaultRooms, placedFurniture: [], selectedRoom: null, selectedFurniture: null }),
    }),
    {
      name: "floor-planner-storage",
    }
  )
);
