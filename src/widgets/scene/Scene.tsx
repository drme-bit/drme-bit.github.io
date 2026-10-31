'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useTheme } from '@/app/providers/ThemeProvider';

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
  const target = useRef(new THREE.Vector2());
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
    target.current.set(mouse.x * 0.32, mouse.y * 0.18);
    ref.current.position.x += (target.current.x - ref.current.position.x) * 0.025;
    ref.current.position.y += (target.current.y - ref.current.position.y) * 0.025;
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
      // Keep the background scene light enough for high-density displays.
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
  const getLowPower = useCallback(() => {
    if (typeof window === 'undefined') return true;
    const isMobile = window.innerWidth <= 768;
    const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const isLowMem = mem !== undefined && mem < 4;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    return isMobile || isLowMem || prefersReduced;
  }, []);
  const [low, setLow] = useState(getLowPower);

  useEffect(() => {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setLow(getLowPower());
    window.addEventListener('resize', update, { passive: true });
    motion.addEventListener('change', update);
    return () => {
      window.removeEventListener('resize', update);
      motion.removeEventListener('change', update);
    };
  }, [getLowPower]);

  return low;
}

function FogUpdater() {
  const { scene } = useThree();
  const { width } = useThree((state) => state.size);
  const { theme, colors } = useTheme();
  const fogRef = useRef<THREE.Fog | null>(null);
  if (fogRef.current === null) fogRef.current = new THREE.Fog('#080808', 14, 34);
  const lastColor = useRef<string | null>(null);

  // eslint-disable-next-line react-hooks/immutability -- R3F scene graph is external mutable state
  useFrame(() => {
    const fogColor = theme === 'light' ? colors.bg : '#080808';
    fogRef.current!.near = width <= 768 ? 10 : 14;
    fogRef.current!.far = width <= 768 ? 28 : 34;
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
  const { theme } = useTheme();
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
    <>
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
          background: 'transparent',
          pointerEvents: theme === 'light' ? 'none' : 'auto',
          display: theme === 'light' ? 'none' : undefined,
        }}
      >
        <PixelRatioManager lowPower={lowPower} />
        <FogUpdater />
        <IsoCamera scrollT={scrollT} />
        {!lowPower && (
          <>
            <Starfield />
          </>
        )}
      </Canvas>
    </>
  );
}
