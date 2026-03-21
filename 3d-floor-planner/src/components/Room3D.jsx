import { useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useStore } from "../store";
import * as THREE from "three";

export default function Room3D({ room }) {
  const meshRef = useRef();
  const { selectedRoom, setSelectedRoom, showLabels } = useStore();
  const isSelected = selectedRoom === room.id;
  const [hovered, setHovered] = useState(false);

  const cx = room.x + room.width / 2;
  const cy = room.y + room.depth / 2;
  const h = room.wallHeight || 9;

  const wallThickness = 0.5;

  return (
    <group position={[cx, 0, cy]}>
      {/* Floor */}
      <mesh
        position={[0, 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={(e) => { e.stopPropagation(); setSelectedRoom(room.id); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
      >
        <planeGeometry args={[room.width, room.depth]} />
        <meshStandardMaterial
          color={room.floorColor}
          roughness={0.6}
          metalness={0.1}
          emissive={isSelected ? "#ffffff" : hovered ? "#eeeeee" : "#000000"}
          emissiveIntensity={isSelected ? 0.15 : hovered ? 0.05 : 0}
        />
      </mesh>

      {/* Walls - North */}
      <mesh position={[0, h / 2, -room.depth / 2 + wallThickness / 2]}>
        <boxGeometry args={[room.width, h, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.8} />
      </mesh>
      {/* South */}
      <mesh position={[0, h / 2, room.depth / 2 - wallThickness / 2]}>
        <boxGeometry args={[room.width, h, wallThickness]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.8} />
      </mesh>
      {/* West */}
      <mesh position={[-room.width / 2 + wallThickness / 2, h / 2, 0]}>
        <boxGeometry args={[wallThickness, h, room.depth]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.8} />
      </mesh>
      {/* East */}
      <mesh position={[room.width / 2 - wallThickness / 2, h / 2, 0]}>
        <boxGeometry args={[wallThickness, h, room.depth]} />
        <meshStandardMaterial color={room.wallColor} roughness={0.8} />
      </mesh>

      {/* Ceiling (subtle) */}
      <mesh position={[0, h - 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[room.width, room.depth]} />
        <meshStandardMaterial color="#f0efe8" roughness={1} side={THREE.BackSide} />
      </mesh>

      {/* Room label */}
      {showLabels && (
        <group position={[0, h * 0.6, 0]}>
          <Text
            fontSize={Math.min(room.width, room.depth) * 0.12}
            color="#1a1a1a"
            anchorX="center"
            anchorY="middle"
            maxWidth={room.width * 0.9}
            textAlign="center"
            outlineWidth={0.05}
            outlineColor="#ffffff"
          >
            {room.name}
            {room.dimensions ? `\n${room.dimensions}` : ""}
          </Text>
        </group>
      )}

      {/* Selection border highlight */}
      {isSelected && (
        <lineSegments position={[0, 0.05, 0]}>
          <edgesGeometry args={[new THREE.BoxGeometry(room.width, 0.1, room.depth)]} />
          <lineBasicMaterial color="#2563eb" linewidth={2} />
        </lineSegments>
      )}
    </group>
  );
}
