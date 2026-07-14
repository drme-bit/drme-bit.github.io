import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getAccent, getBg } from '@/utils/cssTheme';

const _isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
const GRID_X = _isMobile ? 50 : 90;
const GRID_Z = _isMobile ? 50 : 90;
const SPACING = 0.5;
const HALF_X = (GRID_X - 1) * SPACING * 0.5;
const HALF_Z = (GRID_Z - 1) * SPACING * 0.5;

function hash(x, y) {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
function valueNoise(x, y) {
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
function terrainHeight(x, z, amplitude) {
  let h = 0;
  h += (valueNoise(x * 0.08, z * 0.08) - 0.5) * 2.0;
  h += (valueNoise(x * 0.2 + 19, z * 0.2 + 19) - 0.5) * 0.9;
  h += (valueNoise(x * 0.45 + 71, z * 0.45 + 71) - 0.5) * 0.35;
  return h * amplitude;
}

function Starfield() {
  const ref = useRef();
  const matRef = useRef();
  const geometry = useMemo(() => {
    const count = 900;
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
  }, []);

  useFrame(({ clock, mouse }) => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.00006;
    ref.current.position.x = mouse.x * 0.4;
    ref.current.position.y = mouse.y * 0.2;
    if (matRef.current) matRef.current.color.set(getAccent());
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial ref={matRef} color={getAccent()} size={0.06} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
}

function Terrain() {
  const pointsRef = useRef();
  const wireRef = useRef();
  const wireMatRef = useRef();
  const pointsMatRef = useRef();
  const scrollT = useRef(0);
  const scrollSmoothed = useRef(0);
  const noiseOffset = useRef(0);
  const amplitude = useRef(0.9);
  const frameCount = useRef(0);
  const isLight = useIsLight();

  useEffect(() => {
    const handleScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      scrollT.current = window.scrollY / max;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pointsGeo = useMemo(() => {
    const count = GRID_X * GRID_Z;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  const wireGeo = useMemo(() => new THREE.BufferGeometry(), []);
  const wirePositionsScratch = useMemo(() => new Float32Array(GRID_X * GRID_Z * 2 * 3), []);
  const heightField = useMemo(() => new Float32Array(GRID_X * GRID_Z), []);

  function recompute(offset, amp) {
    const positions = pointsGeo.attributes.position.array;
    const colors = pointsGeo.attributes.color.array;
    let idx = 0;
    for (let zi = 0; zi < GRID_Z; zi++) {
      for (let xi = 0; xi < GRID_X; xi++) {
        const x = xi * SPACING - HALF_X;
        const z = zi * SPACING - HALF_Z;
        const h = terrainHeight(x + offset * 0.3, z + offset, amp);
        heightField[idx] = h;
        positions[idx * 3] = x;
        positions[idx * 3 + 1] = h;
        positions[idx * 3 + 2] = z;

        const t = THREE.MathUtils.clamp((h + amp) / (amp * 2), 0, 1);
        if (isLight) {
          const lum = 0.55 + t * 0.25;
          colors[idx * 3] = lum;
          colors[idx * 3 + 1] = lum;
          colors[idx * 3 + 2] = lum;
        } else {
          const lum = 0.12 + t * 0.78;
          colors[idx * 3] = lum;
          colors[idx * 3 + 1] = lum;
          colors[idx * 3 + 2] = lum;
        }
        idx++;
      }
    }
    pointsGeo.attributes.position.needsUpdate = true;
    pointsGeo.attributes.color.needsUpdate = true;

    const bands = [-0.5, 0, 0.5, 1.0];
    let segCount = 0;
    const out = wirePositionsScratch;
    for (let zi = 0; zi < GRID_Z; zi++) {
      for (let xi = 0; xi < GRID_X - 1; xi++) {
        const i0 = zi * GRID_X + xi;
        const i1 = zi * GRID_X + xi + 1;
        const h0 = heightField[i0];
        const h1 = heightField[i1];
        for (const band of bands) {
          if ((h0 - band) * (h1 - band) < 0) {
            const tt = (band - h0) / (h1 - h0);
            const x0 = xi * SPACING - HALF_X;
            const z0 = zi * SPACING - HALF_Z;
            const x = x0 + tt * SPACING;
            if (segCount * 6 >= out.length - 6) break;
            out[segCount * 6] = x;
            out[segCount * 6 + 1] = band;
            out[segCount * 6 + 2] = z0;
            out[segCount * 6 + 3] = x;
            out[segCount * 6 + 4] = band + 0.001;
            out[segCount * 6 + 5] = z0;
            segCount++;
          }
        }
      }
    }
    wireGeo.setAttribute('position', new THREE.BufferAttribute(out.subarray(0, segCount * 6), 3));
    wireGeo.computeBoundingSphere();
  }

  useEffect(() => {
    recompute(0, amplitude.current);
  }, []);

  useFrame(({ clock }) => {
    scrollSmoothed.current += (scrollT.current - scrollSmoothed.current) * 0.05;
    const breathing = Math.sin(clock.elapsedTime * 0.15) * 0.08;
    amplitude.current = 0.7 + scrollSmoothed.current * 1.1 + breathing;
    noiseOffset.current += 0.0015 + scrollSmoothed.current * 0.01;
    frameCount.current++;
    if (frameCount.current % 2 === 0) {
      recompute(noiseOffset.current, amplitude.current);
    }
    if (wireMatRef.current) wireMatRef.current.color.set(getAccent());
  });

  return (
    <group>
      <points ref={pointsRef} geometry={pointsGeo}>
        <pointsMaterial ref={pointsMatRef} vertexColors size={0.09} transparent opacity={isLight ? 0.5 : 0.9} sizeAttenuation />
      </points>
      <lineSegments ref={wireRef} geometry={wireGeo}>
        <lineBasicMaterial ref={wireMatRef} color={getAccent()} transparent opacity={isLight ? 0.1 : 0.18} />
      </lineSegments>
    </group>
  );
}

function Beacons() {
  const groupRef = useRef();
  const refs = useRef([]);
  const matRefs = useRef([]);
  const seeds = useMemo(
    () => Array.from({ length: 5 }, (_, i) => ({
      angle: (i / 5) * Math.PI * 2,
      radius: 5 + (i % 3) * 2.5,
      height: 2.2 + (i % 2) * 1.4,
      speed: 0.12 + i * 0.02,
    })),
    [],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const c = getAccent();
    seeds.forEach((s, i) => {
      const m = refs.current[i];
      if (!m) return;
      const a = s.angle + t * s.speed * 0.3;
      m.position.x = Math.cos(a) * s.radius;
      m.position.z = Math.sin(a) * s.radius - 4;
      m.position.y = s.height + Math.sin(t * 0.6 + i) * 0.3;
      m.rotation.x = t * 0.4 + i;
      m.rotation.y = t * 0.3 + i;
      if (matRefs.current[i]) matRefs.current[i].color.set(c);
    });
  });

  return (
    <group ref={groupRef}>
      {seeds.map((_, i) => (
        <mesh key={i} ref={(el) => { refs.current[i] = el; }}>
          <octahedronGeometry args={[0.18, 0]} />
          <meshBasicMaterial ref={(el) => { matRefs.current[i] = el; }} color={getAccent()} transparent opacity={0.85} />
        </mesh>
      ))}
    </group>
  );
}

function IsoCamera() {
  const { camera, gl } = useThree();
  const scrollT = useRef(0);
  const angle = useRef(0.78);
  const dragAngle = useRef(0);
  const isDragging = useRef(false);
  const prevX = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      scrollT.current = window.scrollY / max;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const el = gl.domElement;
    const onDown = (e) => { isDragging.current = true; prevX.current = e.clientX; };
    const onUp = () => { isDragging.current = false; };
    const onMove = (e) => {
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

  useFrame(({ mouse }) => {
    const s = scrollT.current;
    const targetAngle = 0.6 + s * 1.4 + dragAngle.current;
    angle.current += (targetAngle - angle.current) * 0.02;
    const dist = 13;
    const a = isDragging.current ? angle.current : angle.current + mouse.x * 0.12;
    const isoX = Math.cos(a) * dist * 0.82;
    const isoY = 9.2 + mouse.y * 0.4;
    const isoZ = Math.sin(a) * dist * 0.82 - 4;
    const t = Math.min(s * 2.5, 1);
    const camX = isoX * t;
    const camY = 16 - (16 - isoY) * t;
    const camZ = -4 + (isoZ + 4) * t;
    camera.position.lerp(new THREE.Vector3(camX, camY, camZ), 0.04);
    camera.lookAt(0, 0.3 * t, -4);
  });

  return null;
}

function useLowPowerMode() {
  const [low, setLow] = useState(true);
  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    const isLowMem = navigator.deviceMemory && navigator.deviceMemory < 4;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setLow(isMobile || isLowMem || prefersReduced);
  }, []);
  return low;
}

function SceneInner({ lowPower }) {
  if (lowPower) return <><IsoCamera /><Terrain /></>;
  return (
    <>
      <IsoCamera />
      <Starfield />
      <Terrain />
      <Beacons />
    </>
  );
}

function FogUpdater() {
  const { scene } = useThree();
  useFrame(() => {
    const isLight = document.body.classList.contains('light');
    const fogColor = isLight ? getBg() : '#080808';
    if (!scene.fog || scene.fog.color.getStyle() !== fogColor) {
      scene.fog = new THREE.Fog(fogColor, 14, 34);
    }
  });
  return null;
}

function useCssBg() {
  const [bg, setBg] = useState(getBg);
  useEffect(() => {
    const obs = new MutationObserver(() => setBg(getBg()));
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return bg;
}

function useIsLight() {
  const [light, setLight] = useState(() => document.body.classList.contains('light'));
  useEffect(() => {
    const obs = new MutationObserver(() => setLight(document.body.classList.contains('light')));
    obs.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);
  return light;
}

export default function Scene() {
  const lowPower = useLowPowerMode();
  const bg = useCssBg();

  return (
    <Canvas
      id="bg"
      camera={{ position: [9, 9.2, 5], fov: 32, near: 0.1, far: 80 }}
      gl={{ alpha: true, antialias: !lowPower }}
      onCreated={({ gl }) => {
        gl.setPixelRatio(Math.min(window.devicePixelRatio, lowPower ? 1 : 2));
      }}
      style={{ position: 'fixed', inset: 0, zIndex: 0, background: bg }}
    >
      <FogUpdater />
      <SceneInner lowPower={lowPower} />
    </Canvas>
  );
}
