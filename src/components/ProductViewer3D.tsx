import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Icosahedron, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Interactive 3D product viewer.
 * - Faceted charcoal core with warm emissive rim
 * - OrbitControls (rotate/zoom) with damping
 * - Ambient ember light + soft contact shadow
 * - Respects prefers-reduced-motion
 */
function CoalMesh({ tint }: { tint: string }) {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.15;
  });
  return (
    <Float speed={0.6} rotationIntensity={0.25} floatIntensity={0.35}>
      <Icosahedron ref={ref} args={[1.15, 1]}>
        <meshStandardMaterial
          color={tint}
          roughness={0.55}
          metalness={0.45}
          emissive="#ff5a1c"
          emissiveIntensity={0.35}
          flatShading
        />
      </Icosahedron>
    </Float>
  );
}

export default function ProductViewer3D({
  tint = '#111111',
  className = '',
  ariaLabel = '3D product viewer',
}: {
  tint?: string;
  className?: string;
  ariaLabel?: string;
}) {
  const reduced = useMemo(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  return (
    <div className={`relative w-full h-full ${className}`} role="img" aria-label={ariaLabel}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.3, 3.6], fov: 42 }}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#0a0705']} />
        <fog attach="fog" args={['#0a0705', 4.5, 8]} />
        <ambientLight intensity={0.35} color="#3a1a08" />
        <spotLight position={[2.5, 3, 3]} angle={0.6} penumbra={0.9} intensity={2.4} color="#ffb46b" />
        <pointLight position={[-2, -1, 2]} intensity={0.9} color="#c9a84c" />

        <Suspense fallback={null}>
          <CoalMesh tint={tint} />
          <ContactShadows position={[0, -1.4, 0]} opacity={0.55} scale={5} blur={2.4} far={2} color="#000" />
          <Environment preset="warehouse" />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={2.4}
          maxDistance={5.5}
          enableDamping
          dampingFactor={0.08}
          autoRotate={!reduced}
          autoRotateSpeed={0.6}
        />
      </Canvas>

      {/* Corner hint */}
      <div className="absolute bottom-3 end-3 text-[10px] tracking-[0.22em] uppercase text-gold-hi/80 bg-black/45 border border-gold/30 px-2 py-1 rounded pointer-events-none">
        360° · Drag
      </div>
    </div>
  );
}
