import { useEffect, useRef, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Color, Vector3 } from 'three';
import ThreeGlobe from 'three-globe';
import countries from '@/data/globe.json';

import {
  SKILLS_DATA,
  GROUP_COLORS,
  ICON_MAP,
} from '@/pages/Main/sections/Skills/skillsData';

import GlobeManager from './GlobeManager';

import './Globe.scss';

const _isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

const cameraZ = 300;

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : null;
}

function getVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getGroupColor(group) {
  const varName = GROUP_COLORS[group];
  if (!varName) return '#888888';
  const cssVar = varName.replace('var(', '').replace(')', '');
  const val = getVar(cssVar);
  if (val && val.startsWith('#')) return val;
  return getVar('--accent') || '#6db3f2';
}

function getArcColorStr(group) {
  const hex = getGroupColor(group);
  const rgb = hexToRgb(hex);
  if (!rgb) return 'rgba(109,179,242,0.5)';
  return `rgba(${rgb.r},${rgb.g},${rgb.b},0.5)`;
}

function buildMarkers(skills) {
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

function buildArcs(markers) {
  const groups = {};
  const arcs = [];
  for (const m of markers) {
    if (!groups[m.group]) groups[m.group] = [];
    groups[m.group].push(m);
  }

  // Intra-group: connect every consecutive pair
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

  // Intra-group: connect every 2nd pair (skip-1)
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

  // Cross-group: first skill of each group to first skill of next group
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

  // Cross-group: connect highest-level skill of each pair of groups
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

function getThemeColors() {
  const isLight = document.body.classList.contains('light');
  return {
    globeColor: isLight ? '#e8e4df' : '#0a0a12',
    emissive: isLight ? '#e8e4df' : '#0a0a12',
    emissiveIntensity: isLight ? 0.03 : 0.1,
    shininess: 0.5,
    polygonColor: isLight ? 'rgba(100,100,100,0.45)' : 'rgba(255,255,255,0.28)',
    atmosphereColor: isLight ? '#a0c4e8' : '#4a90d9',
    atmosphereAltitude: isLight ? 0.12 : 0.2,
    ambientLight: isLight ? '#ffffff' : '#303040',
    directionalLeftLight: '#ffffff',
    directionalTopLight: '#ffffff',
    pointLight: '#ffffff',
  };
}

// ── Single marker (React component) ──
function Marker({ name, group, lat, lng, onClick, elemRef }) {
  const Icon = ICON_MAP[name];
  return (
    <div
      ref={elemRef}
      className="globe__marker-label"
      data-skill={name}
      onPointerDown={(e) => { e.stopPropagation(); onClick?.(name); }}
    >
      <div
        className="globe__marker-inner"
        style={{ '--marker-color': getGroupColor(group) }}
      >
        {Icon && <span className="globe__marker-icon"><Icon /></span>}
        <div className="globe__marker-tooltip">{name}</div>
      </div>
    </div>
  );
}

// ── Inner R3F scene ──
function GlobeInner({ markers, arcs, globeObjRef, markerRefsRef }) {
  const { camera, gl } = useThree();
  const groupRef = useRef();
  const [isInitialized, setIsInitialized] = useState(false);
  const worldPos = useMemo(() => new Vector3(), []);
  const canvasSize = useRef({ w: 0, h: 0 });

  // Create ThreeGlobe imperatively
  useEffect(() => {
    if (!globeObjRef.current && groupRef.current) {
      const globe = new ThreeGlobe();
      globeObjRef.current = globe;
      groupRef.current.add(globe);
      gl.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      setIsInitialized(true);
    }
  }, []);

  // Build material
  useEffect(() => {
    if (!globeObjRef.current || !isInitialized) return;
    const tc = getThemeColors();
    const gm = globeObjRef.current.globeMaterial();
    gm.color = new Color(tc.globeColor);
    gm.emissive = new Color(tc.emissive);
    gm.emissiveIntensity = tc.emissiveIntensity;
    gm.shininess = tc.shininess;
  }, [isInitialized]);

  // Build arcs
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
      .arcStartLat('startLat')
      .arcStartLng('startLng')
      .arcEndLat('endLat')
      .arcEndLng('endLng')
      .arcColor((d) => d.color)
      .arcAltitude((d) => d.arcAlt || 0.15)
      .arcStroke(() => [0.4, 0.35, 0.45][Math.round(Math.random() * 2)])
      .arcDashLength(0.6)
      .arcDashInitialGap((d) => (d.order || 0) * 0.2)
      .arcDashGap(15)
      .arcDashAnimateTime(3000);
  }, [isInitialized]);

  // Canvas resize
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

  // Project coordinates → update DOM positions every frame
  useFrame(() => {
    const refs = markerRefsRef.current;
    const globe = globeObjRef.current;
    const mgr = window.__globeManager;
    if (!refs || !globe || !mgr) return;

    const { w, h } = canvasSize.current;
    if (w === 0 || h === 0) return;

    // Ensure camera matrices are up-to-date for projection
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

      // Normalized dot product of radial direction and camera position → [-1, 1]
      const len = Math.sqrt(localX * localX + localY * localY + localZ * localZ) * Math.sqrt(camX * camX + camY * camY + camZ * camZ);
      const facing = len > 0 ? (localX * camX + localY * camY + localZ * camZ) / len : 0;

      // Smooth fade near horizon: 1 = fully visible, 0 = behind globe
      // horizonFade defines the normalized dot range for the transition (0.0–0.15)
      const horizonFade = 0.15;
      const facingFade = Math.max(0, Math.min(1, (facing + horizonFade) / (horizonFade * 2)));

      // Project local coords through camera (local = world since group is identity)
      worldPos.set(localX, localY, localZ);
      worldPos.project(camera);

      const screenX = (worldPos.x * 0.5 + 0.5) * w;
      const screenY = (-worldPos.y * 0.5 + 0.5) * h;

      el.style.transform = `translate(${screenX}px, ${screenY}px) translate(-50%, -50%)`;

      // Compute opacity: horizon fade × filter state
      const dimmed = !isDisabled && hasFilter && !filtered.has(name);
      const active = selectedName === name;

      let opacity = facingFade;
      if (dimmed && !active) opacity *= 0.12;
      if (isDisabled) opacity *= 0.5;

      el.style.opacity = opacity < 0.01 ? '0' : String(opacity);
      el.style.pointerEvents = opacity < 0.05 ? 'none' : '';

      // Dimmed visual: scale + grayscale via inline style on inner
      const inner = el.firstElementChild;
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

      // CSS classes for active pulse animation only
      const cls = el.classList;
      const wantActive = active && facingFade > 0.01;
      if (cls.contains('is-active') !== wantActive) cls.toggle('is-active', wantActive);
    }
  });

  return <group ref={groupRef} />;
}

// ── Main component ──
const Globe = forwardRef(function Globe({ className = '', onMarkerClick }, ref) {
  const [mounted, setMounted] = useState(false);
  const globeObjRef = useRef(null);
  const managerRef = useRef(new GlobeManager());
  const markerRefsRef = useRef({});
  const overlayRef = useRef(null);

  const markers = useMemo(() => buildMarkers(SKILLS_DATA), []);
  const arcs = useMemo(() => buildArcs(markers), [markers]);

  // Expose GlobeManager via forwarded ref + global
  useEffect(() => {
    window.__globeManager = managerRef.current;
    return () => { window.__globeManager = null; };
  }, []);

  useImperativeHandle(ref, () => managerRef.current, []);

  // Marker click callback
  const handleMarkerClick = useCallback((skillName) => {
    if (!onMarkerClick) return;
    onMarkerClick(skillName);
  }, [onMarkerClick]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tc = getThemeColors();

  // Store marker refs for useFrame projection
  const setMarkerRef = useCallback((name, el) => {
    const marker = markers.find((m) => m.name === name);
    if (marker && el) {
      markerRefsRef.current[name] = { el, lat: marker.lat, lng: marker.lng };
    }
  }, [markers]);

  if (!mounted) return <div className={`globe ${className}`} />;

  return (
    <div className={`globe ${className}`}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'default',
          desynchronized: true,
        }}
        camera={{ fov: 50, near: 180, far: 1800, position: [0, 0, cameraZ] }}
        style={{ background: 'transparent' }}
      >
        <ambientLight color={tc.ambientLight} intensity={0.6} />
        <directionalLight
          color={tc.directionalLeftLight}
          position={new Vector3(-400, 100, 400)}
        />
        <directionalLight
          color={tc.directionalTopLight}
          position={new Vector3(-200, 500, 200)}
        />
        <pointLight
          color={tc.pointLight}
          position={new Vector3(-200, 500, 200)}
          intensity={0.8}
        />
        {!_isMobile && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minDistance={cameraZ}
            maxDistance={cameraZ}
            autoRotate
            autoRotateSpeed={0.5}
            minPolarAngle={Math.PI / 3.5}
            maxPolarAngle={Math.PI - Math.PI / 3}
          />
        )}
        <GlobeInner
          markers={markers}
          arcs={arcs}
          globeObjRef={globeObjRef}
          markerRefsRef={markerRefsRef}
        />
      </Canvas>

      {/* HTML marker overlay */}
      <div ref={overlayRef} className="globe__overlay">
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
