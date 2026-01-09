import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

function AnimatedBus({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.8) * 0.2;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh ref={meshRef} position={position}>
        {/* Bus body */}
        <boxGeometry args={[2.5, 1.2, 1]} />
        <meshStandardMaterial color="#1e40af" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Windows */}
      <mesh position={[position[0], position[1] + 0.2, position[2] + 0.51]}>
        <boxGeometry args={[2, 0.5, 0.05]} />
        <meshStandardMaterial color="#60a5fa" metalness={0.9} roughness={0.1} transparent opacity={0.8} />
      </mesh>
      {/* Wheels */}
      <mesh position={[position[0] - 0.7, position[1] - 0.7, position[2] + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.8} />
      </mesh>
      <mesh position={[position[0] + 0.7, position[1] - 0.7, position[2] + 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
        <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.8} />
      </mesh>
    </Float>
  );
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.02;
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={200}
          array={particlePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#fbbf24" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Road() {
  const roadRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (roadRef.current) {
      roadRef.current.position.z = (state.clock.elapsedTime * 2) % 10 - 5;
    }
  });

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[3, 30]} />
        <meshStandardMaterial color="#374151" />
      </mesh>
      {/* Road markings */}
      {[-10, -5, 0, 5, 10].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.99, z]} ref={i === 0 ? roadRef : undefined}>
          <planeGeometry args={[0.1, 1.5]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      ))}
    </group>
  );
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
        <pointLight position={[-5, 5, -5]} intensity={0.5} color="#fbbf24" />
        
        <AnimatedBus position={[0, 0, 0]} />
        <Road />
        <FloatingParticles />
        <Stars radius={50} depth={50} count={1000} factor={2} saturation={0} fade speed={1} />
        
        <fog attach="fog" args={['#0f172a', 5, 25]} />
      </Canvas>
    </div>
  );
}
