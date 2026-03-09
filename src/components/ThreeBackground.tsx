import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer } from "@react-three/drei";
import * as THREE from "three";

const FloatingObjects = () => {
  const group = useRef<THREE.Group>(null);
  
  // Create geometric abstract shapes
  const shapes = useMemo(() => {
    return Array.from({ length: 8 }).map(() => ({
      position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10
      ] as [number, number, number],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        0
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 2,
    }));
  }, []);

  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.getElapsedTime() * 0.05;
      group.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.5;
    }
  });

  return (
    <group ref={group}>
      {shapes.map((props, i) => (
        <Float 
          key={i} 
          speed={1.5} 
          rotationIntensity={2} 
          floatIntensity={3}
          position={props.position}
        >
          <mesh rotation={props.rotation} scale={props.scale}>
            {i % 2 === 0 ? <torusGeometry args={[1, 0.3, 16, 32]} /> : <octahedronGeometry args={[1, 0]} />}
            <meshPhysicalMaterial 
              color={new THREE.Color("hsl(43, 74%, 48%)")} 
              roughness={0.2}
              metalness={0.8}
              transmission={0.5}
              ior={1.5}
              thickness={0.5}
              clearcoat={1}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
};

const ThreeBackground = () => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas 
        camera={{ position: [0, 0, 15], fov: 45 }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#ffffff" />
        
        <FloatingObjects />
        
        {/* Adds beautiful studio lighting reflections on the materials */}
        <Environment preset="city" resolution={256}>
          <Lightformer form="rect" intensity={5} position={[-5, 5, -5]} color="white" scale={[10, 10, 1]} />
          <Lightformer form="rect" intensity={5} position={[5, 10, 5]} color="hsl(43, 74%, 48%)" scale={[10, 10, 1]} />
        </Environment>
      </Canvas>
    </div>
  );
};

export default ThreeBackground;
