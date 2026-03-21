import { useRef, useState, useCallback } from "react";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useStore } from "../store";
import * as THREE from "three";

const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export default function Furniture3D({ item }) {
  const { selectedFurniture, setSelectedFurniture, showLabels, moveFurniture, setIsDraggingFurniture } = useStore();
  const isSelected = selectedFurniture === item.instanceId;
  const [hovered, setHovered] = useState(false);
  const { camera, gl } = useThree();
  const isDragging = useRef(false);

  const handlePointerDown = useCallback(
    (e) => {
      e.stopPropagation();
      if (!isSelected) {
        setSelectedFurniture(item.instanceId);
        return;
      }
      // Already selected — start drag
      isDragging.current = true;
      setIsDraggingFurniture(true);
      document.body.style.cursor = "grabbing";

      const raycaster = new THREE.Raycaster();
      const intersectTarget = new THREE.Vector3();

      const onMove = (moveEvent) => {
        if (!isDragging.current) return;
        const rect = gl.domElement.getBoundingClientRect();
        const x = ((moveEvent.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((moveEvent.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera({ x, y }, camera);
        if (raycaster.ray.intersectPlane(floorPlane, intersectTarget)) {
          moveFurniture(item.instanceId, intersectTarget.x, intersectTarget.z);
        }
      };

      const onUp = () => {
        isDragging.current = false;
        setIsDraggingFurniture(false);
        document.body.style.cursor = "default";
        gl.domElement.removeEventListener("pointermove", onMove);
        gl.domElement.removeEventListener("pointerup", onUp);
      };

      gl.domElement.addEventListener("pointermove", onMove);
      gl.domElement.addEventListener("pointerup", onUp);
    },
    [isSelected, item.instanceId, camera, gl, moveFurniture, setIsDraggingFurniture, setSelectedFurniture]
  );

  return (
    <group
      position={[item.posX, 0, item.posZ]}
      rotation={[0, item.rotation, 0]}
      onClick={(e) => { e.stopPropagation(); setSelectedFurniture(item.instanceId); }}
      onPointerDown={handlePointerDown}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = isSelected ? "grab" : "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        if (!isDragging.current) document.body.style.cursor = "default";
      }}
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
      {isSelected && (
        <Text
          position={[0, -0.4, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.55}
          color="#2563eb"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#ffffff"
        >
          drag to move
        </Text>
      )}
    </group>
  );
}
