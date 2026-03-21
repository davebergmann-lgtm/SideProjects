import { useRef, useState } from "react";
import { Text } from "@react-three/drei";
import { useStore } from "../store";

export default function Furniture3D({ item }) {
  const { selectedFurniture, setSelectedFurniture, showLabels } = useStore();
  const isSelected = selectedFurniture === item.instanceId;
  const [hovered, setHovered] = useState(false);

  return (
    <group
      position={[item.posX, 0, item.posZ]}
      rotation={[0, item.rotation, 0]}
      onClick={(e) => { e.stopPropagation(); setSelectedFurniture(item.instanceId); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = "grab"; }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = "default"; }}
    >
      <mesh position={[0, item.height / 2, 0]}>
        <boxGeometry args={[item.width, item.height, item.depth]} />
        <meshStandardMaterial
          color={item.color}
          roughness={0.7}
          metalness={0.1}
          emissive={isSelected ? "#4444ff" : hovered ? "#333333" : "#000000"}
          emissiveIntensity={isSelected ? 0.3 : hovered ? 0.1 : 0}
          transparent={true}
          opacity={0.92}
        />
      </mesh>
      {/* Top face accent */}
      <mesh position={[0, item.height + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[item.width * 0.9, item.depth * 0.9]} />
        <meshStandardMaterial
          color={item.color}
          roughness={0.5}
          transparent
          opacity={0.6}
        />
      </mesh>
      {showLabels && (
        <Text
          position={[0, item.height + 0.8, 0]}
          fontSize={0.8}
          color="#333"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#ffffff"
        >
          {item.name}
        </Text>
      )}
      {isSelected && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[Math.max(item.width, item.depth) / 2, Math.max(item.width, item.depth) / 2 + 0.2, 32]} />
          <meshBasicMaterial color="#2563eb" />
        </mesh>
      )}
    </group>
  );
}
