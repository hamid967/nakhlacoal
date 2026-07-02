import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles, Float, Icosahedron, Environment } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Cinematic WebGL intro:
 * - Deep black stage with volumetric fog
 * - Glowing charcoal core with pulsing ember emission (fresnel-lit rim)
 * - Rising ember sparks + drifting smoke plumes (billboarded soft sprites)
 * - Warm volumetric spotlight from above (god-ray feel via layered cones)
 * - Honors prefers-reduced-motion
 */

function CharcoalCore() {
  const mesh = useRef<THREE.Mesh>(null!);
  const mat = useRef<THREE.MeshStandardMaterial>(null!);
  useFrame((state, dt) => {
    if (!mesh.current) return;
    mesh.current.rotation.y += dt * 0.14;
    mesh.current.rotation.x += dt * 0.05;
    // Ember pulse
    if (mat.current) {
      const t = state.clock.elapsedTime;
      const pulse = 0.55 + Math.sin(t * 1.4) * 0.18 + Math.sin(t * 3.7) * 0.08;
      mat.current.emissiveIntensity = pulse;
    }
  });
  return (
    <Float speed={0.7} rotationIntensity={0.25} floatIntensity={0.45}>
      <Icosahedron ref={mesh} args={[1.15, 1]}>
        <meshStandardMaterial
          ref={mat}
          color="#0a0705"
          roughness={0.62}
          metalness={0.35}
          emissive="#ff5a1c"
          emissiveIntensity={0.6}
          flatShading
        />
      </Icosahedron>
      {/* inner glow shell */}
      <mesh scale={1.02}>
        <icosahedronGeometry args={[1.15, 1]} />
        <meshBasicMaterial color="#ff7a2a" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
    </Float>
  );
}

function EmberSparks({ count = 220 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);
  const { positions, seeds } = useMemo(() => {
    const p = new Float32Array(count * 3);
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      p[i * 3 + 0] = (Math.random() - 0.5) * 6;
      p[i * 3 + 1] = Math.random() * 4 - 1.5;
      p[i * 3 + 2] = (Math.random() - 0.5) * 3;
      s[i] = Math.random();
    }
    return { positions: p, seeds: s };
  }, [count]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const speed = 0.35 + seeds[i] * 0.7;
      arr[i * 3 + 1] += dt * speed;
      arr[i * 3 + 0] += Math.sin((arr[i * 3 + 1] + seeds[i] * 6) * 1.8) * dt * 0.12;
      if (arr[i * 3 + 1] > 3.2) {
        arr[i * 3 + 1] = -1.8;
        arr[i * 3 + 0] = (Math.random() - 0.5) * 6;
      }
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffb457"
        size={0.045}
        sizeAttenuation
        transparent
        opacity={0.95}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Cheap god-ray: stack of soft, translucent cones from top-front. */
function VolumetricSpot() {
  const grp = useRef<THREE.Group>(null!);
  useFrame((state) => {
    if (!grp.current) return;
    const t = state.clock.elapsedTime;
    grp.current.children.forEach((c, i) => {
      (c as THREE.Mesh).rotation.y = t * 0.05 + i * 0.4;
    });
  });
  return (
    <group ref={grp} position={[0, 2.4, 0.4]} rotation={[Math.PI, 0, 0]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 1.1, 0]}>
          <coneGeometry args={[1.4 + i * 0.15, 3.6, 32, 1, true]} />
          <meshBasicMaterial
            color="#ffb46b"
            transparent
            opacity={0.05 - i * 0.012}
            side={THREE.DoubleSide}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

/** Soft smoke plumes: additive planes drifting upward. */
function SmokePlumes({ count = 14 }: { count?: number }) {
  const grp = useRef<THREE.Group>(null!);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * 5,
        z: (Math.random() - 0.5) * 2,
        s: 0.8 + Math.random() * 1.2,
        r: Math.random() * Math.PI,
        y: -1.5 + Math.random() * 3,
        speed: 0.08 + Math.random() * 0.14,
      })),
    [count]
  );
  useFrame((_, dt) => {
    if (!grp.current) return;
    grp.current.children.forEach((c, i) => {
      const seed = seeds[i];
      c.position.y += dt * seed.speed;
      if (c.position.y > 2.8) c.position.y = -1.8;
      c.rotation.z += dt * 0.05;
    });
  });
  return (
    <group ref={grp}>
      {seeds.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, s.z]} rotation={[0, 0, s.r]} scale={s.s}>
          <planeGeometry args={[2.2, 2.2]} />
          <meshBasicMaterial
            color="#1a0f08"
            transparent
            opacity={0.22}
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
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
        camera={{ position: [0, 0.2, 4.8], fov: 42 }}
        frameloop={reduced ? 'demand' : 'always'}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#050301']} />
        <fog attach="fog" args={['#050301', 3.8, 9]} />

        {/* Key ember light from above/front */}
        <ambientLight intensity={0.12} color="#3a1a08" />
        <spotLight
          position={[0.6, 3.2, 2.4]}
          angle={0.55}
          penumbra={0.9}
          intensity={2.6}
          color="#ff8a3d"
          distance={12}
          castShadow={false}
        />
        <pointLight position={[0, 0, 1.4]} intensity={2.2} color="#ff5a1c" distance={5} />
        <pointLight position={[-2.4, -1.2, 1]} intensity={0.6} color="#c9a84c" distance={6} />

        <Suspense fallback={null}>
          <SmokePlumes count={reduced ? 6 : 14} />
          <VolumetricSpot />
          <CharcoalCore />
          <EmberSparks count={reduced ? 60 : 220} />
          <Sparkles
            count={reduced ? 30 : 90}
            scale={[7, 4.5, 3]}
            size={2.6}
            speed={reduced ? 0 : 0.55}
            color="#ffcf7a"
            opacity={0.9}
          />
          <Environment preset="night" />
        </Suspense>
      </Canvas>

      {/* Subtle black vignette to keep focus on the coal core */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 85%, rgba(0,0,0,0.85) 100%)',
        }}
      />
    </div>
  );
}
