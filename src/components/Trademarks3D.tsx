import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Trademark } from '@/data/trademarks';

/**
 * WebGL 3D carousel for trademarks (Three.js + R3F).
 * Cards arc along a curve, active card centers/scales up, others fan
 * back with rotation. Click a card to activate.
 */

type Props = {
  items: Trademark[];
  active: number;
  onChange: (i: number) => void;
  className?: string;
};

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function Card({
  item,
  index,
  active,
  total,
  onChange,
}: {
  item: Trademark;
  index: number;
  active: number;
  total: number;
  onChange: (i: number) => void;
}) {
  const group = useRef<THREE.Group>(null!);
  const tex = useLoader(THREE.TextureLoader, item.image);
  useMemo(() => {
    tex.anisotropy = 8;
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);

  // signed shortest offset from active (handles wrap)
  const rawOffset = index - active;
  const half = total / 2;
  const offset =
    rawOffset > half ? rawOffset - total : rawOffset < -half ? rawOffset + total : rawOffset;

  const target = useMemo(() => {
    const spread = 1.25; // horizontal spacing
    const depth = 0.55; // pull non-active cards back
    const abs = Math.abs(offset);
    return {
      x: offset * spread,
      y: offset === 0 ? 0.08 : -abs * 0.05,
      z: -abs * depth,
      rotY: offset * -0.45,
      scale: offset === 0 ? 1.18 : Math.max(0.78, 0.95 - abs * 0.08),
    };
  }, [offset]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    const k = 1 - Math.exp(-dt * 6); // critically-damped follow
    g.position.x = lerp(g.position.x, target.x, k);
    g.position.y = lerp(g.position.y, target.y, k);
    g.position.z = lerp(g.position.z, target.z, k);
    g.rotation.y = lerp(g.rotation.y, target.rotY, k);
    const s = lerp(g.scale.x, target.scale, k);
    g.scale.set(s, s, s);
  });

  const isCenter = offset === 0;

  return (
    <group ref={group} onClick={(e) => { e.stopPropagation(); onChange(index); }}>
      {/* Gold frame */}
      <RoundedBox args={[1.15, 1.55, 0.06]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          color={isCenter ? '#dfbd68' : '#a8884a'}
          metalness={0.9}
          roughness={0.28}
          emissive={isCenter ? '#c9a84c' : '#000'}
          emissiveIntensity={isCenter ? 0.25 : 0}
        />
      </RoundedBox>
      {/* Cream card face */}
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.04, 1.44]} />
        <meshStandardMaterial color="#f6efd9" roughness={0.85} metalness={0} />
      </mesh>
      {/* Trademark image */}
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.92, 1.3]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Podium() {
  return (
    <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[1.2, 2.4, 64]} />
      <meshBasicMaterial color="#c9a84c" transparent opacity={0.18} />
    </mesh>
  );
}

export default function Trademarks3D({ items, active, onChange, className = '' }: Props) {
  const reduced =
    typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <div className={`relative ${className}`} style={{ touchAction: 'pan-y' }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.05, 3.4], fov: 38 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#fff3d2" castShadow />
        <pointLight position={[-3, -1, 2]} intensity={0.55} color="#c9a84c" />

        <Suspense fallback={null}>
          <Podium />
          {items.map((it, i) => (
            <Card
              key={it.id}
              item={it}
              index={i}
              active={active}
              total={items.length}
              onChange={onChange}
            />
          ))}
          <Environment preset="warehouse" />
        </Suspense>
      </Canvas>
    </div>
  );
}
