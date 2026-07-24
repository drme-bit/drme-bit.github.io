'use client';

import { useEffect, useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Color, Vector3 } from 'three';
import ThreeGlobe from 'three-globe';
import countries from '@/data/globe.json';

import {
  SKILLS_DATA,
  GROUP_COLORS,
  ICON_MAP,
} from '@/data/skillsData';

import GlobeManager from './GlobeManager';

import styles from './Globe.module.scss';

const _isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

const cameraZ = 300;

interface MarkerEntry {
  el: HTMLElement;
  lat: number;
  lng: number;
}

interface Arc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  color: string;
  arcAlt: number;
  order: number;
  group: string;
}

interface Marker {
  id: string;
  name: string;
  group: string;
  lat: number;
  lng: number;
  size: number;
}

interface ThemeColors {
  globeColor: string;
  emissive: string;
  emissiveIntensity: number;
  shininess: number;
  polygonColor: string;
  atmosphereColor: string;
  atmosphereAltitude: number;
  ambientLight: string;
  ambientIntensity: number;
}

declare global {
  interface Window {
    __globeManager: InstanceType<typeof GlobeManager> | null;
  }
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function getVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getGroupColor(group: string): string {
  const varName = (GROUP_COLORS as Record<string, string>)[group];
  if (!varName) return '#888888';
  const cssVar = varName.replace('var(', '').replace(')', '');
  const val = getVar(cssVar);
  if (val && val.startsWith('#')) return val;
  return getVar('--accent') || '#6db3f2';
}

function getArcColorStr(group: string): string {
  const hex = getGroupColor(group);
  const rgb = hexToRgb(hex);
  if (!rgb) return 'rgba(109,179,242,0.5)';
  return `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`;
}

function buildMarkers(skills: Array<{ name: string; group: string; level?: number }>): Marker[] {
  const n = skills.length;
  return skills.map((skill, i) => {
    const theta = 2.39996323 * i;
    const y = 1 - (2 * i) / n;
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lng = ((theta * 180) / Math.PI) % 360;
    return {
      id: skill.name.replace(/[^a-zA-Z]/g, ''),
      name: skill.name,
      group: skill.group,
      lat,
      lng,
      size: skill.level || 1,
    };
  });
}

function buildArcs(markers: Marker[]): Arc[] {
  const groups: Record<string, Marker[]> = {};
  const arcs: Arc[] = [];
  for (const m of markers) {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(m);
  }

  Object.values(groups).forEach((group) => {
    for (let i = 1; i < group.length; i++) {
      arcs.push({
        startLat: group[i - 1].lat,
        startLng: group[i - 1].lng,
        endLat: group[i].lat,
        endLng: group[i].lng,
        color: getArcColorStr(group[i].group),
        arcAlt: 0.12 + Math.random() * 0.18,
        order: i,
        group: group[i].group,
      });
    }
  });

  Object.values(groups).forEach((group) => {
    for (let i = 2; i < group.length; i++) {
      arcs.push({
        startLat: group[i - 2].lat,
        startLng: group[i - 2].lng,
        endLat: group[i].lat,
        endLng: group[i].lng,
        color: getArcColorStr(group[i].group),
        arcAlt: 0.15 + Math.random() * 0.2,
        order: i + 100,
        group: group[i].group,
      });
    }
  });

  const groupKeys = Object.keys(groups);
  for (let i = 0; i < groupKeys.length; i++) {
    const a = groups[groupKeys[i]];
    const b = groups[groupKeys[(i + 1) % groupKeys.length]];
    if (a.length && b.length) {
      arcs.push({
        startLat: a[0].lat,
        startLng: a[0].lng,
        endLat: b[0].lat,
        endLng: b[0].lng,
        color: 'rgba(255,255,255,0.15)',
        arcAlt: 0.25 + Math.random() * 0.15,
        order: 200 + i,
        group: 'cross',
      });
    }
  }

  const topSkills = Object.values(groups).map((g) =>
    g.reduce((best, s) => (s.size > best.size ? s : best), g[0]),
  );
  for (let i = 0; i < topSkills.length; i++) {
    for (let j = i + 1; j < topSkills.length; j++) {
      arcs.push({
        startLat: topSkills[i].lat,
        startLng: topSkills[i].lng,
        endLat: topSkills[j].lat,
        endLng: topSkills[j].lng,
        color: 'rgba(255,255,255,0.12)',
        arcAlt: 0.3 + Math.random() * 0.1,
        order: 300 + i * 10 + j,
        group: 'cross',
      });
    }
  }

  return arcs;
}

function getThemeColors(): ThemeColors {
  const isLight = document.body.classList.contains('light');
  return {
    globeColor: isLight ? '#dce6ee' : '#142033',
    emissive: isLight ? '#dce6ee' : '#142033',
    emissiveIntensity: isLight ? 0.35 : 0.7,
    shininess: 0,
    polygonColor: isLight ? 'rgba(100,100,100,0.45)' : 'rgba(255,255,255,0.28)',
    atmosphereColor: isLight ? '#a0c4e8' : '#4a90d9',
    atmosphereAltitude: isLight ? 0.12 : 0.2,
    ambientLight: '#ffffff',
    ambientIntensity: isLight ? 1.2 : 1.6,
  };
}

interface MarkerProps {
  name: string;
  group: string;
  lat: number;
  lng: number;
  onClick?: (name: string) => void;
  elemRef: (el: HTMLButtonElement | null) => void;
}

function Marker({ name, group, lat, lng, onClick, elemRef }: MarkerProps) {
  const Icon = (ICON_MAP as Record<string, React.ComponentType<{ className?: string }>>)[name];
  return (
    <button
      type="button"
      ref={elemRef}
      className={styles.globeMarkerLabel}
      data-skill={name}
      aria-label={`View ${name} skill details`}
      onPointerDown={(e) => { e.stopPropagation(); onClick?.(name); }}
    >
      <div
        className={styles.globeMarkerInner}
        style={{ '--marker-color': getGroupColor(group) } as React.CSSProperties}
      >
        {Icon && <span className={styles.globeMarkerIcon}><Icon /></span>}
        <div className={styles.globeMarkerTooltip}>{name}</div>
      </div>
    </button>
  );
}

interface GlobeInnerProps {
  markers: Marker[];
  arcs: Arc[];
  globeObjRef: React.MutableRefObject<ThreeGlobe | null>;
  markerRefsRef: React.MutableRefObject<Record<string, MarkerEntry>>;
  themeVersion: number;
}

function GlobeInner({ markers, arcs, globeObjRef, markerRefsRef, themeVersion }: GlobeInnerProps) {
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const worldPos = useMemo(() => new Vector3(), []);
  const canvasSize = useRef({ w: 0, h: 0 });

  useEffect(() => {
    if (!globeObjRef.current && groupRef.current) {
      const globe = new ThreeGlobe();
      globeObjRef.current = globe;
      groupRef.current.add(globe);
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (!globeObjRef.current || !isInitialized) return;
    const tc = getThemeColors();
    const gm = globeObjRef.current.globeMaterial() as THREE.MeshPhongMaterial;
    gm.color = new Color(tc.globeColor);
    gm.emissive = new Color(tc.emissive);
    gm.emissiveIntensity = tc.emissiveIntensity;
    gm.shininess = tc.shininess;
  }, [isInitialized, themeVersion]);

  useEffect(() => {
    if (!globeObjRef.current || !isInitialized) return;
    const tc = getThemeColors();
    const globe = globeObjRef.current;

    globe
      .hexPolygonsData(countries.features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.7)
      .showAtmosphere(true)
      .atmosphereColor(tc.atmosphereColor)
      .atmosphereAltitude(tc.atmosphereAltitude)
      .hexPolygonColor(() => tc.polygonColor);

    globe
      .arcsData(arcs)
      .arcStartLat('startLat' as never)
      .arcStartLng('startLng' as never)
      .arcEndLat('endLat' as never)
      .arcEndLng('endLng' as never)
      .arcColor((d: unknown) => (d as Arc).color)
      .arcAltitude((d: unknown) => (d as Arc).arcAlt || 0.15)
      .arcStroke(() => [0.4, 0.35, 0.45][Math.round(Math.random() * 2)])
      .arcDashLength(0.6)
      .arcDashInitialGap((d: unknown) => ((d as Arc).order || 0) * 0.2)
      .arcDashGap(15)
      .arcDashAnimateTime(3000);
  }, [arcs, isInitialized, themeVersion]);

  useEffect(() => {
    const update = () => {
      const rect = gl.domElement.getBoundingClientRect();
      canvasSize.current = { w: rect.width, h: rect.height };
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(gl.domElement);
    return () => ro.disconnect();
  }, [gl]);

  useFrame(() => {
    const refs = markerRefsRef.current;
    const globe = globeObjRef.current;
    const mgr = window.__globeManager;
    if (!refs || !globe || !mgr) return;

    const { w, h } = canvasSize.current;
    if (w === 0 || h === 0) return;

    camera.updateMatrixWorld();

    const camX = camera.position.x;
    const camY = camera.position.y;
    const camZ = camera.position.z;

    const filtered = mgr.getFilteredNames();
    const hasFilter = filtered !== null;
    const isDisabled = mgr.state.disabled;
    const selectedName = mgr.state.selected;

    for (const name in refs) {
      const entry = refs[name];
      const { el, lat, lng } = entry;
      if (!el) continue;

      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const r = 100;

      const localX = -r * Math.sin(phi) * Math.cos(theta);
      const localY = r * Math.cos(phi);
      const localZ = r * Math.sin(phi) * Math.sin(theta);

      const len = Math.sqrt(localX * localX + localY * localY + localZ * localZ) * Math.sqrt(camX * camX + camY * camY + camZ * camZ);
      const facing = len > 0 ? (localX * camX + localY * camY + localZ * camZ) / len : 0;

      const horizonFade = 0.15;
      const facingFade = Math.max(0, Math.min(1, (facing + horizonFade) / (horizonFade * 2)));

      worldPos.set(localX, localY, localZ);
      worldPos.project(camera);

      const screenX = (worldPos.x * 0.5 + 0.5) * w;
      const screenY = (-worldPos.y * 0.5 + 0.5) * h;

      el.style.transform = `translate(${screenX}px, ${screenY}px) translate(-50%, -50%)`;

      const dimmed = !isDisabled && hasFilter && !filtered!.has(name);
      const active = selectedName === name;

      let opacity = facingFade;
      if (dimmed && !active) opacity *= 0.12;
      if (isDisabled) opacity *= 0.5;

      el.style.opacity = opacity < 0.01 ? '0' : String(opacity);
      el.style.pointerEvents = opacity < 0.05 ? 'none' : '';

      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) {
        if (dimmed && !active && facingFade > 0.01) {
          inner.style.transform = 'scale(0.8)';
          inner.style.filter = 'grayscale(1) brightness(0.6)';
        } else if (active && facingFade > 0.01) {
          inner.style.transform = 'scale(1.4)';
          inner.style.filter = '';
        } else {
          inner.style.transform = '';
          inner.style.filter = '';
        }
      }

      const cls = el.classList;
      const wantActive = active && facingFade > 0.01;
      if (cls.contains('is-active') !== wantActive) cls.toggle('is-active', wantActive);
    }
  });

  return <group ref={groupRef} />;
}

interface GlobeProps {
  className?: string;
  onMarkerClick?: (skillName: string) => void;
}

const Globe = forwardRef(function Globe({ className = '', onMarkerClick }: GlobeProps, ref) {
  const [mounted, setMounted] = useState<boolean>(false);
  const globeObjRef = useRef<ThreeGlobe | null>(null);
  const managerRef = useRef(new GlobeManager());
  const markerRefsRef = useRef<Record<string, MarkerEntry>>({});
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [themeVersion, setThemeVersion] = useState(0);

  const markers = useMemo(() => buildMarkers(SKILLS_DATA), []);
  const arcs = useMemo(() => buildArcs(markers), [markers, themeVersion]);

  useEffect(() => {
    window.__globeManager = managerRef.current;
    return () => { window.__globeManager = null; };
  }, []);

  useImperativeHandle(ref, () => managerRef.current, []);

  const handleMarkerClick = useCallback((skillName: string) => {
    if (!onMarkerClick) return;
    onMarkerClick(skillName);
  }, [onMarkerClick]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const refreshTheme = () => setThemeVersion((version) => version + 1);
    const observer = new MutationObserver(refreshTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const tc = getThemeColors();

  const setMarkerRef = useCallback((name: string, el: HTMLButtonElement | null) => {
    const marker = markers.find((m) => m.name === name);
    if (marker && el) {
      markerRefsRef.current[name] = { el, lat: marker.lat, lng: marker.lng };
    }
  }, [markers]);

  if (!mounted) return <div className={`${styles.globe} ${className}`} />;

  return (
    <div className={`${styles.globe} ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
        } as never}
        camera={{ fov: 50, near: 180, far: 1800, position: [0, 0, cameraZ] }}
        style={{ background: 'transparent' }}
      >
        <ambientLight color={tc.ambientLight} intensity={tc.ambientIntensity} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate
          minDistance={cameraZ}
          maxDistance={cameraZ}
          autoRotate
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI - Math.PI / 3}
        />
        <GlobeInner
          markers={markers}
          arcs={arcs}
          globeObjRef={globeObjRef}
          markerRefsRef={markerRefsRef}
          themeVersion={themeVersion}
        />
      </Canvas>

      <div ref={overlayRef} className={styles.globeOverlay}>
        {markers.map((m) => (
          <Marker
            key={m.name}
            name={m.name}
            group={m.group}
            lat={m.lat}
            lng={m.lng}
            onClick={handleMarkerClick}
            elemRef={(el) => setMarkerRef(m.name, el)}
          />
        ))}
      </div>
    </div>
  );
});

export default Globe;
