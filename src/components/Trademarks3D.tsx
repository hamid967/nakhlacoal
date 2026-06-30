import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Environment, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Trademark } from '@/data/trademarks';
import { getReducedMotion } from '@/hooks/useReducedMotion';

/**
 * WebGL 3D carousel for trademarks (Three.js + R3F).
 * Auto-caps render quality on weak devices and respects reduced motion.
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

/** Detect weak devices once at module load (SSR-safe). */
function detectTier(): 'low' | 'high' {
  if (typeof window === 'undefined') return 'high';
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean; effectiveType?: string } };
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData === true;
  const slowNet = ['slow-2g', '2g', '3g'].includes(nav.connection?.effectiveType ?? '');
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) < 600;
  const reduced = getReducedMotion();
  if (saveData || slowNet || reduced) return 'low';
  if (cores <= 4 && memory <= 4) return 'low';
  if (smallScreen && cores <= 6) return 'low';
  return 'high';
}

function Card({
  item,
  index,
  active,
  total,
  onChange,
  lowTier,
}: {
  item: Trademark;
  index: number;
  active: number;
  total: number;
  onChange: (i: number) => void;
  lowTier: boolean;
}) {
  const group = useRef<THREE.Group>(null!);
  const tex = useLoader(THREE.TextureLoader, item.image);
  useMemo(() => {
    tex.anisotropy = lowTier ? 1 : 8;
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex, lowTier]);

  const rawOffset = index - active;
  const half = total / 2;
  const offset =
    rawOffset > half ? rawOffset - total : rawOffset < -half ? rawOffset + total : rawOffset;

  const target = useMemo(() => {
    const spread = 1.25;
    const depth = 0.55;
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
    const k = 1 - Math.exp(-dt * 6);
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
      <RoundedBox args={[1.15, 1.55, 0.06]} radius={0.06} smoothness={lowTier ? 2 : 4}>
        <meshStandardMaterial
          color={isCenter ? '#dfbd68' : '#a8884a'}
          metalness={0.9}
          roughness={0.28}
          emissive={isCenter ? '#c9a84c' : '#000'}
          emissiveIntensity={isCenter ? 0.25 : 0}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.035]}>
        <planeGeometry args={[1.04, 1.44]} />
        <meshStandardMaterial color="#f6efd9" roughness={0.85} metalness={0} />
      </mesh>
      <mesh position={[0, 0, 0.04]}>
        <planeGeometry args={[0.92, 1.3]} />
        <meshBasicMaterial map={tex} transparent toneMapped={false} />
      </mesh>
    </group>
  );
}

function Podium() {
  return (
    <mesh position={[0, -1.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[1.2, 2.4, 64]} />
      <meshBasicMaterial color="#c9a84c" transparent opacity={0.18} />
    </mesh>
  );
}

/** Cream/gold skeleton shown while WebGL + textures load. */
export function Trademarks3DSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden>
      <div className="absolute inset-0 flex items-center justify-center gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-md border border-[hsl(var(--gold))]/30 bg-gradient-to-b from-surface-2 to-surface-3 animate-pulse"
            style={{
              width: i === 1 ? 140 : 110,
              height: i === 1 ? 200 : 160,
              opacity: i === 1 ? 1 : 0.65,
              boxShadow: '0 10px 30px -12px rgba(120,98,72,0.35)',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function Trademarks3D({ items, active, onChange, className = '' }: Props) {
  const tier = useMemo(detectTier, []);
  const lowTier = tier === 'low';
  const reduced = typeof window !== 'undefined' && getReducedMotion();

  return (
    <div className={`relative ${className}`} style={{ touchAction: 'pan-y' }}>
      <Canvas
        dpr={lowTier ? [1, 1.25] : [1, 2]}
        camera={{ position: [0, 0.05, 3.4], fov: 38 }}
        gl={{
          antialias: !lowTier,
          alpha: true,
          powerPreference: lowTier ? 'low-power' : 'high-performance',
        }}
        frameloop={reduced ? 'demand' : 'always'}
      >
        <ambientLight intensity={lowTier ? 0.85 : 0.65} />
        <directionalLight position={[3, 4, 5]} intensity={1.1} color="#fff3d2" />
        {!lowTier && <pointLight position={[-3, -1, 2]} intensity={0.55} color="#c9a84c" />}

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
              lowTier={lowTier}
            />
          ))}
          {!lowTier && <Environment preset="warehouse" />}
        </Suspense>
      </Canvas>
    </div>
  );
}
