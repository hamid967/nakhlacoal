import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, Icosahedron, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * WebGL backdrop for the cinematic intro.
 * - Gold ember sparkles (Sparkles)
 * - Slow-rotating faceted "charcoal" core (Icosahedron) with emissive gold rim
 * - Soft studio environment lighting
 * - Honors prefers-reduced-motion (frameloop=demand)
 */
function CharcoalCore() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.12;
    ref.current.rotation.x += dt * 0.04;
  });
  return (
    <Float speed={0.8} rotationIntensity={0.3} floatIntensity={0.6}>
      <Icosahedron ref={ref} args={[1.25, 1]}>
        <meshStandardMaterial
          color="#0d1108"
          roughness={0.45}
          metalness={0.85}
          emissive="#c9a84c"
          emissiveIntensity={0.18}
          flatShading
        />
      </Icosahedron>
    </Float>
  );
}

function GoldRing() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.z += dt * 0.05;
  });
  return (
    <mesh ref={ref} position={[0, 0, -0.2]} rotation={[Math.PI / 2.4, 0, 0]}>
      <torusGeometry args={[2.1, 0.012, 16, 200]} />
      <meshBasicMaterial color="#dfbd68" transparent opacity={0.55} />
    </mesh>
  );
}

export default function IntroWebGL({ className = '' }: { className?: string }) {
  const reduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.6], fov: 45 }}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <color attach="background" args={['#f2e9d2']} />
        <fog attach="fog" args={['#efe3c6', 5.5, 9]} />

        <ambientLight intensity={0.55} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#fff3d2" />
        <pointLight position={[-3, -2, 2]} intensity={0.7} color="#c9a84c" />

        <Suspense fallback={null}>
          <CharcoalCore />
          <GoldRing />
          <Sparkles
            count={reduced ? 40 : 120}
            scale={[7, 4, 4]}
            size={3.4}
            speed={reduced ? 0 : 0.45}
            color="#dfbd68"
            opacity={0.9}
          />
          <Environment preset="warehouse" />
        </Suspense>
      </Canvas>

      {/* Cream overlay so existing parchment UI stays legible */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(248,242,228,0.78), rgba(238,225,200,0.86))',
        }}
      />
    </div>
  );
}
