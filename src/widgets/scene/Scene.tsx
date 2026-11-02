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
  const target = useRef(new THREE.Vector2());
  const { colors } = useTheme();

  const [geometry] = useState(() => {
    const count = 480;
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

  useFrame(({ mouse, invalidate }) => {
    if (!ref.current) return;
    target.current.set(mouse.x * 0.32, mouse.y * 0.18);
    ref.current.position.x += (target.current.x - ref.current.position.x) * 0.025;
    ref.current.position.y += (target.current.y - ref.current.position.y) * 0.025;
    if (
      Math.abs(target.current.x - ref.current.position.x) > 0.001 ||
      Math.abs(target.current.y - ref.current.position.y) > 0.001
    ) {
      invalidate();
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
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

function IsoCamera({
  scrollT,
  active,
}: {
  scrollT: React.MutableRefObject<number>;
  active: boolean;
}) {
  const { camera, gl, invalidate } = useThree();
  const angle = useRef(0.78);
  const dragAngle = useRef(0);
  const isDragging = useRef(false);
  const prevX = useRef(0);

  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e: PointerEvent) => {
      isDragging.current = true;
      prevX.current = e.clientX;
      invalidate();
    };
    const onUp = () => {
      isDragging.current = false;
      invalidate();
    };
    const onMove = (e: PointerEvent) => {
      if (!isDragging.current) {
        invalidate();
        return;
      }
      dragAngle.current += (e.clientX - prevX.current) * 0.005;
      prevX.current = e.clientX;
      invalidate();
    };
    const onScroll = () => invalidate();

    el.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('scroll', onScroll);
    };
  }, [gl, invalidate]);

  useFrame(({ invalidate }) => {
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
    if (
      Math.abs(targetAngle - angle.current) > 0.001 ||
      camera.position.distanceToSquared(_camTarget) > 0.0001
    ) {
      invalidate();
    }
  });

  return null;
}

function PixelRatioManager({ lowPower }: { lowPower: boolean }) {
  const gl = useThree((s) => s.gl);

  useEffect(() => {
    const apply = () => {
      const dpr = window.devicePixelRatio || 1;
      const area = window.innerWidth * window.innerHeight;
      // Keep framebuffer pixels bounded and cap DPR to reduce fill-rate cost.
      const budget = Math.sqrt(3_500_000 / Math.max(area, 1));
      gl.setPixelRatio(Math.min(dpr, lowPower ? 0.8 : 1, Math.max(budget, 0.65)));
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
  useEffect(() => {
    const fogColor = theme === 'light' ? colors.bg : '#080808';
    // eslint-disable-next-line react-hooks/immutability -- Three.js scene is external mutable state.
    scene.fog = new THREE.Fog(fogColor, width <= 768 ? 10 : 14, width <= 768 ? 28 : 34);
  }, [colors.bg, scene, theme, width]);

  return null;
}

export default function Scene() {
  const lowPower = useLowPowerMode();
  const { theme } = useTheme();
  const scrollT = useScrollProgress();
  // Paused while an opaque takeover (projects portal) covers the viewport.
  const [bgPaused, setBgPaused] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const sceneActive = !bgPaused && pageVisible;

  useEffect(() => {
    const onPause = (e: Event): void => {
      setBgPaused((e as CustomEvent<boolean>).detail);
    };
    window.addEventListener('bg-pause', onPause);
    return () => window.removeEventListener('bg-pause', onPause);
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener('visibilitychange', updateVisibility);
    return () => document.removeEventListener('visibilitychange', updateVisibility);
  }, []);

  return (
    <>
      {theme !== 'light' && (
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
          frameloop={sceneActive ? 'demand' : 'never'}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            background: 'transparent',
            pointerEvents: 'auto',
          }}
        >
          <PixelRatioManager lowPower={lowPower} />
          <FogUpdater />
          <IsoCamera scrollT={scrollT} active={sceneActive} />
          {!lowPower && <Starfield />}
        </Canvas>
      )}
    </>
  );
}
