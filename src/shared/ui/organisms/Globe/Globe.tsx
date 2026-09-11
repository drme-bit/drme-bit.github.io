'use client';

import { useEffect, useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Color, Vector3 } from 'three';
import ThreeGlobe from 'three-globe';
import countries from '@/entities/geo/globe.json';

import {
  graph,
  GROUP_COLORS,
  ICON_MAP,
} from '@/features/skills/lib/registry';

import GlobeManager from './GlobeManager';

import styles from './Globe.module.scss';

const _isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

const reducedMotionGlobe =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const cameraZ = 300;

interface MarkerEntry {
  el: HTMLElement;
  lat: number;
  lng: number;
  mag: { x: number; y: number };
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
  onHover?: (name: string | null) => void;
  elemRef: (el: HTMLButtonElement | null) => void;
}

function Marker({ name, group, lat, lng, onClick, onHover, elemRef }: MarkerProps) {
  const Icon = (ICON_MAP as Record<string, React.ComponentType<{ className?: string }>>)[name];

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    el.style.setProperty('--mag-x', `${Math.max(-18, Math.min(18, dx / 5))}px`);
    el.style.setProperty('--mag-y', `${Math.max(-18, Math.min(18, dy / 5))}px`);
  };

  const handleLeave = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.style.setProperty('--mag-x', '0px');
    e.currentTarget.style.setProperty('--mag-y', '0px');
  };

  return (
    <button
      type="button"
      ref={elemRef}
      className={styles.globeMarkerLabel}
      data-skill={name}
      aria-label={`View ${name} skill details`}
      onPointerDown={(e) => { e.stopPropagation(); onClick?.(name); }}
      onPointerMove={handleMove}
      onPointerEnter={() => onHover?.(name)}
      onPointerLeave={(e) => {
        handleLeave(e);
        onHover?.(null);
      }}
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
  managerRef: React.MutableRefObject<GlobeManager>;
  markerBySkill: Record<string, Marker>;
  groupColors: Record<string, THREE.Texture>;
  controlsRef: React.MutableRefObject<unknown>;
}

function GlobeInner({
  markers,
  arcs,
  globeObjRef,
  markerRefsRef,
  themeVersion,
  managerRef,
  markerBySkill,
  groupColors,
  controlsRef,
}: GlobeInnerProps) {
  const { camera, gl } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [selectionVersion, setSelectionVersion] = useState<number>(0);
  const worldPos = useMemo(() => new Vector3(), []);
  const canvasSize = useRef({ w: 0, h: 0 });
  const baseArcsRef = useRef(arcs);
  baseArcsRef.current = arcs;

  /*  Manager changes (selection) drive related-arcs redraw  */

  useEffect(() => {
    const mgr = managerRef.current;
    if (!mgr) return;
    return mgr.subscribe(() => setSelectionVersion((v) => v + 1));
  }, [managerRef]);

  useEffect(() => {
    const globe = globeObjRef.current;
    if (!globe || !isInitialized) return;
    const mgr = managerRef.current;
    if (!mgr) return;

    const sel = mgr.state.selected;
    if (!sel || !markerBySkill[sel]) {
      globe.arcsData(baseArcsRef.current);
      return;
    }

    const mk = markerBySkill[sel];
    const related = graph.relatedSkills(sel);
    const relatedArcs = related
      .map((r) => ({ r, rm: markerBySkill[r.name] }))
      .filter((x): x is { r: typeof related[number]; rm: Marker } => Boolean(x.rm))
      .map(({ r, rm }, i) => ({
        startLat: mk.lat,
        startLng: mk.lng,
        endLat: rm.lat,
        endLng: rm.lng,
        color: getArcColorStr(r.group),
        arcAlt: 0.2,
        order: 400 + i,
        group: r.group,
      }));

    globe.arcsData([...baseArcsRef.current, ...relatedArcs]);
  }, [isInitialized, selectionVersion, markerBySkill, managerRef]);

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
    const mgr = managerRef.current;
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

      if (!reducedMotionGlobe) {
        const targetX = parseFloat(el.style.getPropertyValue('--mag-x')) || 0;
        const targetY = parseFloat(el.style.getPropertyValue('--mag-y')) || 0;
        entry.mag.x += (targetX - entry.mag.x) * 0.22;
        entry.mag.y += (targetY - entry.mag.y) * 0.22;
      }

      el.style.transform = `translate(${screenX + entry.mag.x}px, ${screenY + entry.mag.y}px) translate(-50%, -50%)`;

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

  return (
    <group ref={groupRef}>
      <HaloSprites markers={markers} groupColors={groupColors} markerBySkill={markerBySkill} />
      <SelectionRing markerBySkill={markerBySkill} />
      <FlyCamera controlsRef={controlsRef} markerBySkill={markerBySkill} />
    </group>
  );
}

/*  3D overlay helpers & layers ── */

const tempVec = new Vector3();

function latLngToWorld(lat: number, lng: number, r = 100, out = tempVec): Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return out.set(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  );
}

/*  Soft additive halo sprites — one per marker, group-tinted  */

function makeHaloTexture(color: string): THREE.Texture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, color);
    g.addColorStop(0.35, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

function groupHaloTextures(groups: string[]): Record<string, THREE.Texture> {
  const out: Record<string, THREE.Texture> = {};
  for (const g of groups) {
    if (!out[g]) out[g] = makeHaloTexture(getGroupColor(g));
  }
  return out;
}

interface HaloSpritesProps {
  markers: Marker[];
  groupColors: Record<string, THREE.Texture>;
  markerBySkill: Record<string, Marker>;
}

function HaloSprites({ markers, groupColors, markerBySkill }: HaloSpritesProps) {
  const refs = useRef<Record<string, THREE.Sprite>>({});

  useFrame(() => {
    const mgr = window.__globeManager;
    if (!mgr) return;
    const filtered = mgr.getFilteredNames();
    const hasFilter = filtered !== null;
    const isDisabled = mgr.state.disabled;
    const selectedName = mgr.state.selected;
    const hoveredName = mgr.state.hover;

    for (const m of markers) {
      const spr = refs.current[m.name];
      if (!spr) continue;
      const dimmed = !isDisabled && hasFilter && !filtered!.has(m.name);
      const active = selectedName === m.name;
      const hovered = hoveredName === m.name && !active;

      let scale = 2.6 + (m.size || 1) * 1.5;
      if (dimmed && !active) scale *= 0.45;
      else if (active) scale *= 1.55;
      else if (hovered) scale *= 1.25;

      spr.scale.setScalar(scale);
      const mat = spr.material as THREE.SpriteMaterial;
      mat.opacity = dimmed && !active ? 0.12 : active ? 1 : 0.55;
    }
  });

  return (
    <group>
      {markers.map((m) => (
        <sprite
          key={m.name}
          ref={(el) => {
            if (el) refs.current[m.name] = el;
          }}
          position={latLngToWorld(m.lat, m.lng, 100)}
        >
          <spriteMaterial
            map={groupColors[m.group]}
            transparent
            opacity={0.55}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </sprite>
      ))}
    </group>
  );
}

/*  Pulsing selection ring in 3D  */

function SelectionRing({ markerBySkill }: { markerBySkill: Record<string, Marker> }) {
  const ref = useRef<THREE.Mesh>(null);
  const target = useRef(new Vector3());

  useFrame((_, dt) => {
    const mesh = ref.current;
    if (!mesh) return;
    const mgr = window.__globeManager;
    if (!mgr) return;

    const sel = mgr.state.selected;
    const mk = sel ? markerBySkill[sel] : undefined;
    if (!mk) {
      mesh.visible = false;
      return;
    }

    const k = 1 - Math.exp(-dt * 6);
    latLngToWorld(mk.lat, mk.lng, 100, target.current);
    mesh.position.lerp(target.current, k);
    mesh.visible = true;

    const t = performance.now() / 1000;
    const pulse = 1 + Math.sin(t * 3.2) * 0.06;
    mesh.scale.setScalar((4.1 + pulse) * 0.28);
    mesh.lookAt(mesh.position.x * 2, mesh.position.y * 2, mesh.position.z * 2);
  });

  return (
    <mesh ref={ref} visible={false}>
      <ringGeometry args={[0.92, 1, 64]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.85}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/*  Camera fly-to: eases orbit so the selected marker faces the viewer  */

function FlyCamera({
  controlsRef,
  markerBySkill,
}: {
  controlsRef: React.MutableRefObject<unknown>;
  markerBySkill: Record<string, Marker>;
}) {
  const fly = useRef<{ name: string | null; active: boolean }>({ name: null, active: false });
  const tmp = useRef(new Vector3());

  useFrame((_, dt) => {
    const ctrl = controlsRef.current as {
      getPolarAngle: () => number;
      setPolarAngle: (v: number) => void;
      getAzimuthalAngle: () => number;
      setAzimuthalAngle: (v: number) => void;
      minPolarAngle: number;
      maxPolarAngle: number;
    } | null;
    if (!ctrl) return;
    const mgr = window.__globeManager;
    if (!mgr) return;

    const sel = mgr.state.selected;
    if (sel !== fly.current.name) {
      fly.current.name = sel;
      fly.current.active = Boolean(sel);
    }
    if (!fly.current.active) return;

    const mk = sel ? markerBySkill[sel] : undefined;
    if (!mk) {
      fly.current.active = false;
      return;
    }

    latLngToWorld(mk.lat, mk.lng, 1, tmp.current);
    const eye = tmp.current;
    let goalPhi = Math.acos(THREE.MathUtils.clamp(eye.y, -1, 1));
    const goalTheta = Math.atan2(eye.x, eye.z);
    goalPhi = Math.min(ctrl.maxPolarAngle, Math.max(ctrl.minPolarAngle, goalPhi));

    const curPhi = ctrl.getPolarAngle();
    const curTheta = ctrl.getAzimuthalAngle();
    const k = 1 - Math.exp(-dt * 3.2);
    const np = curPhi + (goalPhi - curPhi) * k;
    const nt = curTheta + (goalTheta - curTheta) * k;

    ctrl.setPolarAngle(np);
    ctrl.setAzimuthalAngle(nt);

    if (Math.abs(goalPhi - np) < 0.004 && Math.abs(goalTheta - nt) < 0.004) {
      fly.current.active = false;
    }
  });

  return null;
}

interface GlobeProps {
  className?: string;
  onMarkerClick?: (skillName: string) => void;
}

const Globe = forwardRef(function Globe({ className = '', onMarkerClick }: GlobeProps, ref) {
  const [mounted, setMounted] = useState<boolean>(false);
  const globeObjRef = useRef<ThreeGlobe | null>(null);
  const managerRef = useRef<GlobeManager>(new GlobeManager());
  const markerRefsRef = useRef<Record<string, MarkerEntry>>({});
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<unknown>(null);
  const [themeVersion, setThemeVersion] = useState(0);

  const markers = useMemo(() => buildMarkers(graph.allSkills), []);
  const arcs = useMemo(() => buildArcs(markers), [markers, themeVersion]);
  const markerBySkill = useMemo(() => {
    const map: Record<string, Marker> = {};
    for (const m of markers) map[m.name] = m;
    return map;
  }, [markers]);
  const groupColors = useMemo(() => {
    const groups = [...new Set(markers.map((m) => m.group))];
    return groupHaloTextures(groups);
  }, [markers, themeVersion]);

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
      markerRefsRef.current[name] = { el, lat: marker.lat, lng: marker.lng, mag: { x: 0, y: 0 } };
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
          ref={controlsRef as React.Ref<any>}
          enablePan={false}
          enableZoom={false}
          enableRotate
          minDistance={cameraZ}
          maxDistance={cameraZ}
          autoRotate={!reducedMotionGlobe}
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
          managerRef={managerRef}
          markerBySkill={markerBySkill}
          groupColors={groupColors}
          controlsRef={controlsRef}
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
            onHover={(name) => managerRef.current.setHover(name)}
            elemRef={(el) => setMarkerRef(m.name, el)}
          />
        ))}
      </div>
    </div>
  );
});

export default Globe;
