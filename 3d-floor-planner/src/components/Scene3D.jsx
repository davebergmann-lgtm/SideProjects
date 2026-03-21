import { useRef, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sky, Environment, Grid } from "@react-three/drei";
import Room3D from "./Room3D";
import Furniture3D from "./Furniture3D";
import { useStore } from "../store";

function FloorPlan() {
  const { rooms, placedFurniture, setSelectedRoom, setSelectedFurniture } = useStore();

  return (
    <group
      onClick={(e) => {
        if (e.object.type === "Mesh" && !e.object.userData.interactive) {
          setSelectedRoom(null);
          setSelectedFurniture(null);
        }
      }}
    >
      {rooms.map((room) => (
        <Room3D key={room.id} room={room} />
      ))}
      {placedFurniture.map((item) => (
        <Furniture3D key={item.instanceId} item={item} />
      ))}
    </group>
  );
}

export default function Scene3D({ canvasRef }) {
  const { cameraView, isDraggingFurniture } = useStore();

  const cameraProps =
    cameraView === "top"
      ? { position: [24, 80, 10], fov: 50 }
      : cameraView === "front"
      ? { position: [24, 15, 80], fov: 45 }
      : { position: [60, 55, 80], fov: 45 };

  return (
    <Canvas
      ref={canvasRef}
      camera={cameraProps}
      shadows
      gl={{ preserveDrawingBuffer: true }}
      style={{ background: "#e8edf2" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[40, 60, 40]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={200}
          shadow-camera-left={-60}
          shadow-camera-right={60}
          shadow-camera-top={60}
          shadow-camera-bottom={-60}
        />
        <directionalLight position={[-20, 30, -20]} intensity={0.4} />
        <pointLight position={[24, 20, 20]} intensity={0.3} />

        <Sky sunPosition={[100, 20, 100]} />

        {/* Ground plane */}
        <mesh position={[24, -0.05, 10]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[200, 200]} />
          <meshStandardMaterial color="#a8b8a0" roughness={1} />
        </mesh>

        <Grid
          position={[24, -0.04, 10]}
          args={[200, 200]}
          cellSize={1}
          cellThickness={0.5}
          cellColor="#8a9e8a"
          sectionSize={10}
          sectionThickness={1}
          sectionColor="#6a7e6a"
          fadeDistance={120}
          fadeStrength={1}
          followCamera={false}
          infiniteGrid
        />

        <FloorPlan />

        <OrbitControls
          makeDefault
          enabled={!isDraggingFurniture}
          minDistance={5}
          maxDistance={150}
          maxPolarAngle={Math.PI / 2 - 0.05}
          target={[24, 0, 20]}
        />
      </Suspense>
    </Canvas>
  );
}
