'use client';

import { useRef, useMemo, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/app/providers/ThemeProvider';
import { useTerrain } from '@/app/providers/TerrainProvider';

const _isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
const GRID_X = _isMobile ? 65 : 85;
const GRID_Z = _isMobile ? 65 : 85;
const SPACING = 0.5;
const HALF_X = (GRID_X - 1) * SPACING * 0.5;
const HALF_Z = (GRID_Z - 1) * SPACING * 0.5;
const TOTAL_POINTS = GRID_X * GRID_Z;

function hash(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}

function valueNoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  const ux = xf * xf * (3 - 2 * xf);
  const uy = yf * yf * (3 - 2 * yf);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

function terrainHeight(x: number, z: number, amplitude: number): number {
  let h = (valueNoise(x * 0.08, z * 0.08) - 0.5) * 2.0;
  h += (valueNoise(x * 0.2 + 19, z * 0.2 + 19) - 0.5) * 0.9;
  h += (valueNoise(x * 0.45 + 71, z * 0.45 + 71) - 0.5) * 0.35;
  return h * amplitude;
}

function useScrollProgress() {
  const scrollT = useRef(0);
  useEffect(() => {
    const handleScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      scrollT.current = window.scrollY / max;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return scrollT;
}

function Starfield() {
  const ref = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const { colors } = useTheme();

  const [geometry] = useState(() => {
    const count = 700;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 40 + Math.random() * 18;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 0.6);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.6 + 6;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 20;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  });

  useFrame(({ mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.00006;
    ref.current.position.x = mouse.x * 0.4;
    ref.current.position.y = mouse.y * 0.2;
    if (matRef.current) matRef.current.color.set(colors.accent);
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        ref={matRef}
        color={colors.accent}
        size={0.06}
        transparent
        opacity={0.5}
        sizeAttenuation
      />
    </points>
  );
}

interface TerrainGeo {
  pointsGeo: THREE.BufferGeometry;
  wireGeo: THREE.BufferGeometry;
  heightField: Float32Array;
  maxWireSegments: number;
}

function createTerrainGeo(): TerrainGeo {
  const pGeo = new THREE.BufferGeometry();
  const pos = new Float32Array(TOTAL_POINTS * 3);
  const col = new Float32Array(TOTAL_POINTS * 3);
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const maxSegs = GRID_X * GRID_Z * 4;
  const wGeo = new THREE.BufferGeometry();
  const wPos = new Float32Array(maxSegs * 6);
  const wAttr = new THREE.BufferAttribute(wPos, 3);
  wAttr.setUsage(THREE.DynamicDrawUsage);
  wGeo.setAttribute('position', wAttr);

  return {
    pointsGeo: pGeo,
    wireGeo: wGeo,
    heightField: new Float32Array(TOTAL_POINTS),
    maxWireSegments: maxSegs,
  };
}

function Terrain({ scrollT }: { scrollT: React.MutableRefObject<number> }) {
  const pointsRef = useRef<THREE.Points>(null);
  const wireRef = useRef<THREE.LineSegments>(null);
  const wireMatRef = useRef<THREE.LineBasicMaterial>(null);
  const pointsMatRef = useRef<THREE.PointsMaterial>(null);

  const timerRef = useRef(new THREE.Timer());

  const scrollSmoothed = useRef(0);
  const noiseOffset = useRef(0);
  const amplitude = useRef(0.9);
  const lastRecompute = useRef(0);

  const { theme, colors } = useTheme();
  const terrain = useTerrain();

  const [geos] = useState(createTerrainGeo);
  // Mutable three.js objects live in a ref: mutating ref contents is allowed,
  // mutating useState values is not. `geos` itself is only read (JSX, deps).
  const geosRef = useRef(geos);

  const recompute = useCallback((offset: number, amp: number, isLight: boolean) => {
    const { pointsGeo, wireGeo, heightField, maxWireSegments } = geosRef.current;
    const posAttr = pointsGeo.attributes.position as THREE.BufferAttribute;
    const colAttr = pointsGeo.attributes.color as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const pointColors = colAttr.array as Float32Array;

    let idx = 0;

    for (let zi = 0; zi < GRID_Z; zi++) {
      const z = zi * SPACING - HALF_Z;
      for (let xi = 0; xi < GRID_X; xi++) {
        const x = xi * SPACING - HALF_X;
        const h = terrainHeight(x + offset * 0.3, z + offset, amp);

        heightField[idx] = h;
        const idx3 = idx * 3;
        positions[idx3] = x;
        positions[idx3 + 1] = h;
        positions[idx3 + 2] = z;

        const t = THREE.MathUtils.clamp((h + amp) / (amp * 2), 0, 1);
        const lum = isLight ? 0.3 + t * 0.4 : 0.12 + t * 0.78;
        pointColors[idx3] = lum;
        pointColors[idx3 + 1] = lum;
        pointColors[idx3 + 2] = lum;
        idx++;
      }
    }
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    const bands = [-2.5, -2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0, 2.5];
    let segCount = 0;
    const wirePosAttr = wireGeo.attributes.position as THREE.BufferAttribute;
    const out = wirePosAttr.array as Float32Array;

    for (let zi = 0; zi < GRID_Z; zi++) {
      const z0 = zi * SPACING - HALF_Z;
      for (let xi = 0; xi < GRID_X - 1; xi++) {
        const i0 = zi * GRID_X + xi;
        const i1 = i0 + 1;
        const h0 = heightField[i0];
        const h1 = heightField[i1];

        for (let b = 0; b < bands.length; b++) {
          const band = bands[b];
          if ((h0 - band) * (h1 - band) < 0) {
            if (segCount >= maxWireSegments) break;
            const tt = (band - h0) / (h1 - h0);
            const x0 = xi * SPACING - HALF_X;
            const x = x0 + tt * SPACING;

            const s6 = segCount * 6;
            out[s6] = x;
            out[s6 + 1] = band;
            out[s6 + 2] = z0;
            out[s6 + 3] = x;
            out[s6 + 4] = band + 0.001;
            out[s6 + 5] = z0;
            segCount++;
          }
        }
      }
    }

    wireGeo.setDrawRange(0, segCount * 2);
    wirePosAttr.needsUpdate = true;
  }, []);

  useEffect(() => {
    recompute(0, amplitude.current, theme === 'light');
  }, [theme, recompute]);

  useFrame(() => {
    if (terrain.paused) return;

    timerRef.current.update();
    const elapsedTime = timerRef.current.getElapsed();

    scrollSmoothed.current += (scrollT.current - scrollSmoothed.current) * 0.05;
    const breathing = Math.sin(elapsedTime * 0.15) * 0.08;
    amplitude.current = (0.7 + scrollSmoothed.current * 1.1 + breathing) * terrain.amplitude;
    noiseOffset.current += (0.0015 + scrollSmoothed.current * 0.01) * terrain.speed;

    // Time-gated: full terrain rebuild at ~5Hz is plenty for drifting
    // noise, and keeps CPU spikes away from scroll-driven animation.
    const now = performance.now();
    if (now - lastRecompute.current > 200) {
      lastRecompute.current = now;
      recompute(noiseOffset.current, amplitude.current, theme === 'light');
    }
    if (wireMatRef.current) wireMatRef.current.color.set(colors.accent);
  });

  return (
    <group>
      <points ref={pointsRef} geometry={geos.pointsGeo} frustumCulled={false}>
        <pointsMaterial
          ref={pointsMatRef}
          vertexColors
          size={_isMobile ? 0.14 : 0.09}
          transparent
          opacity={theme === 'light' ? 0.7 : 0.9}
          sizeAttenuation
        />
      </points>
      <lineSegments ref={wireRef} geometry={geos.wireGeo} frustumCulled={false}>
        <lineBasicMaterial
          ref={wireMatRef}
          color={colors.accent}
          transparent
          opacity={theme === 'light' ? 0.2 : 0.18}
        />
      </lineSegments>
    </group>
  );
}

function Beacons() {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const { colors } = useTheme();

  const timerRef = useRef(new THREE.Timer());

  const seeds = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => ({
        angle: (i / 5) * Math.PI * 2,
        radius: 5 + (i % 3) * 2.5,
        height: 2.2 + (i % 2) * 1.4,
        speed: 0.12 + i * 0.02,
      })),
    [],
  );

  useFrame(() => {
    timerRef.current.update();
    const t = timerRef.current.getElapsed();

    const c = colors.accent;
    seeds.forEach((s, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = s.angle + t * s.speed * 0.3;
      m.position.x = Math.cos(a) * s.radius;
      m.position.z = Math.sin(a) * s.radius - 4;
      m.position.y = s.height + Math.sin(t * 0.6 + i) * 0.3;
      m.rotation.x = t * 0.4 + i;
      m.rotation.y = t * 0.3 + i;
      if (matRefs.current[i]) matRefs.current[i]!.color.set(c);
    });
  });

  return (
    <group>
      {seeds.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
        >
          <octahedronGeometry args={[0.18, 0]} />
          <meshBasicMaterial
            ref={(el) => {
              matRefs.current[i] = el;
            }}
            color={colors.accent}
            transparent
            opacity={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

const _camTarget = new THREE.Vector3();

function IsoCamera({ scrollT }: { scrollT: React.MutableRefObject<number> }) {
  const { camera, gl } = useThree();
  const angle = useRef(0.78);
  const dragAngle = useRef(0);
  const isDragging = useRef(false);
  const prevX = useRef(0);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      prevX.current = e.clientX;
    };
    const onUp = () => {
      isDragging.current = false;
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) return;
      dragAngle.current += (e.clientX - prevX.current) * 0.005;
      prevX.current = e.clientX;
    };

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
    };
  }, [gl]);

  useFrame(() => {
    const s = scrollT.current;

    const targetAngle = 0.78 + s * 1.2 + dragAngle.current;
    angle.current += (targetAngle - angle.current) * 0.04;

    const dist = 13;
    const a = angle.current;

    const isoX = Math.cos(a) * dist * 0.82;
    const isoY = 9.2 * 0.4;
    const isoZ = Math.sin(a) * dist * 0.82 - 4;

    const t = Math.min(s * 2.5, 1);
    const camX = isoX * t;
    const camY = 16 - (16 - isoY) * t;
    const camZ = -4 + (isoZ + 4) * t;

    camera.position.lerp(_camTarget.set(camX, camY, camZ), 0.05);
    camera.lookAt(0, 0.3 * t, -4);
  });

  return null;
}

function PixelRatioManager({ lowPower }: { lowPower: boolean }) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const apply = () => {
      const dpr = window.devicePixelRatio || 1;
      const area = window.innerWidth * window.innerHeight;
      // Keep framebuffer pixels bounded: past ~3.5M CSS px the ratio falls
      // smoothly, so fullscreen/4K stops rasterizing 10M+ pixels per frame.
      // The terrain is points/lines — it stays crisp well below DPR.
      const budget = Math.sqrt(3_500_000 / Math.max(area, 1));
      gl.setPixelRatio(Math.min(dpr, lowPower ? 1 : 1.25, Math.max(budget, 0.65)));
    };
    apply();
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, [gl, lowPower]);

  return null;
}

function useLowPowerMode() {
  const [low] = useState(() => {
    if (typeof window === 'undefined') return true;
    const isMobile = window.innerWidth <= 768;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const isLowMem = mem !== undefined && mem < 4;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return isMobile || isLowMem || prefersReduced;
  });

  return low;
}

function FogUpdater() {
  const { scene } = useThree();
  const { theme, colors } = useTheme();
  const fogRef = useRef<THREE.Fog | null>(null);
  if (fogRef.current === null) {
    fogRef.current = new THREE.Fog('#080808', _isMobile ? 10 : 14, _isMobile ? 28 : 34);
  }
  const lastColor = useRef<string | null>(null);

  // eslint-disable-next-line react-hooks/immutability -- R3F scene graph is external mutable state
  useFrame(() => {
    const fogColor = theme === 'light' ? colors.bg : '#080808';
    if (!scene.fog) {
      // eslint-disable-next-line react-hooks/immutability -- R3F scene graph is external mutable state
      scene.fog = fogRef.current;
    } else if (lastColor.current !== fogColor) {
      lastColor.current = fogColor;
      fogRef.current!.color.set(fogColor);
    }
  });

  return null;
}

export default function Scene() {
  const lowPower = useLowPowerMode();
  const { colors } = useTheme();
  const scrollT = useScrollProgress();
  // Paused while an opaque takeover (projects portal) covers the viewport.
  const [bgPaused, setBgPaused] = useState(false);

  useEffect(() => {
    const onPause = (e: Event): void => {
      setBgPaused((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener('bg-pause', onPause);
    return () => window.removeEventListener('bg-pause', onPause);
  }, []);

  return (
    <Canvas
      id="bg"
      camera={{ position: [9, 9.2, 5], fov: 32, near: 0.1, far: 80 }}
      gl={{
        alpha: true,
        antialias: !lowPower,
        powerPreference: 'high-performance',
        stencil: false,
        depth: true,
        preserveDrawingBuffer: false,
      }}
      frameloop={bgPaused ? 'never' : 'always'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: colors.bg,
        pointerEvents: 'auto',
      }}
    >
      <PixelRatioManager lowPower={lowPower} />
      <FogUpdater />
      <IsoCamera scrollT={scrollT} />
      <Terrain scrollT={scrollT} />
      {!lowPower && (
        <>
          <Starfield />
          <Beacons />
        </>
      )}
    </Canvas>
  );
}
