'use client'

import createGlobe from "cobe";
import {
  useEffect,
  useRef,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";

import {
  SKILLS_DATA,
  ICON_MAP,
  GROUP_COLORS,
} from "@/pages/Main/sections/Skills/skillsData";

import GlobeManager from "./GlobeManager";

import "./Globe.scss";

const BASE_THETA = 0.25;

const THETA_OFFSET_MIN = -0.32;
const THETA_OFFSET_MAX = 0.32;

const MAX_VELOCITY = 0.15;

const GROUP_SIZES = {
  frontend: 0.06,
  backend: 0.05,
  tools: 0.045,
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function getGlobeTheme() {
  const light = document.body.classList.contains("light");
  const mobile =
    typeof window !== "undefined" &&
    window.innerWidth <= 768;

  if (light) {
    return {
      dark: 1,
      diffuse: 2,
      mapSamples: mobile ? 6000 : 8000,
      mapBrightness: 5,
      mapBaseBrightness: 0.05,

      baseColor: [0.88, 0.86, 0.83],
      markerColor: [0.18, 0.52, 0.78],
      glowColor: [0.88, 0.86, 0.83],
      arcColor: [0.18, 0.52, 0.78],
    };
  }

  return {
    dark: 0,
    diffuse: 1.2,

    mapSamples: mobile ? 6000 : 8000,
    mapBrightness: 6,
    mapBaseBrightness: 0,

    baseColor: [0.12, 0.12, 0.12],
    markerColor: [0.49, 0.83, 0.99],
    glowColor: [0.27, 0.26, 0.25],
    arcColor: [0.49, 0.83, 0.99],
  };
}

function buildMarkers(skills) {
  const n = skills.length;

  return skills.map((skill, i) => {
    const theta = 2.39996323 * i;

    const y = 1 - (2 * i) / n;

    const lat = (Math.asin(y) * 180) / Math.PI;

    const lng = ((theta * 180) / Math.PI) % 360;

    return {
      location: [lat, lng],

      size: GROUP_SIZES[skill.group] ?? 0.04,

      id: skill.name.replace(/[^a-zA-Z]/g, ''),

      name: skill.name,
      group: skill.group,
    };
  });
}

function buildArcs(markers) {
  const groups = {};
  const arcs = [];

  for (const marker of markers) {
    if (!groups[marker.group]) {
      groups[marker.group] = [];
    }

    groups[marker.group].push(marker);
  }

  Object.values(groups).forEach((group) => {
    for (let i = 1; i < group.length; i++) {
      arcs.push({
        from: group[i - 1].location,
        to: group[i].location,
      });
    }
  });

  return arcs;
}

const Globe = forwardRef(function Globe(
  { className = '', scrollProgress = 0, phiRef: externalPhiRef, thetaRef: externalThetaRef, paused = false, onMarkerClick },
  ref,
) {
  const canvasRef = useRef(null);
  const hiddenRef = useRef(false);
  const globeRef = useRef(null);
  const managerRef = useRef(null);
  const phiRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const velocityRef = useRef({ phi: 0, theta: 0 });
  const lastPointerRef = useRef(null);
  const scrollRef = useRef(scrollProgress);
  const pauseRef = useRef(paused);
  const rafRef = useRef(null);
  const dragRef = useRef({ active: false, committed: false, pointerType: 'mouse', startX: 0, startY: 0, offsetPhi: 0, offsetTheta: 0 });
  const parallaxRef = useRef({ target: 0, current: 0 });

  scrollRef.current = scrollProgress;
  pauseRef.current = paused;

  const markers = useMemo(() => buildMarkers(SKILLS_DATA), []);
  const arcs = useMemo(() => buildArcs(markers), [markers]);

  // Expose GlobeManager via ref
  useImperativeHandle(ref, () => {
    if (!managerRef.current) managerRef.current = new GlobeManager();
    return managerRef.current;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;

  const isMobile = window.innerWidth <= 768;
  const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 640 ? 1.8 : 2);
  const maxPx = isMobile ? 600 : 800;
  const size = Math.max(Math.round(Math.min(Math.max(rect.width, rect.height), maxPx)), 200);
  const theme = getGlobeTheme();

  const globe = createGlobe(canvas, {
    devicePixelRatio: dpr,
    width: size,
    height: size,
    phi: phiRef.current,
    theta: BASE_THETA + thetaOffsetRef.current,
    dark: theme.dark,
    diffuse: theme.diffuse,
    scale: 1,
    mapSamples: theme.mapSamples,
    mapBrightness: theme.mapBrightness,
    mapBaseBrightness: theme.mapBaseBrightness,
    baseColor: theme.baseColor,
    markerColor: theme.markerColor,
    glowColor: theme.glowColor,
    markers,
    arcs,
    arcColor: theme.arcColor,
    arcWidth: 0.4,
    arcHeight: 0.25,
    markerElevation: 0.01,
    offset: [0, 0],
    context: {
      antialias: false,
      alpha: true,
      powerPreference: 'default',
      depth: true,
      stencil: false,
      preserveDrawingBuffer: false,
      desynchronized: true,
    },
  });

    globeRef.current = globe;
    canvas.classList.add('is-ready');

    setTimeout(() => {
      if (managerRef.current) managerRef.current.init();
    }, 100);

    // ── Animation loop (stop when off-screen) ──
    let isTabHidden = false;

    const onVisibilityChange = () => {
      isTabHidden = document.hidden;
      if (!isTabHidden && !hiddenRef.current) restartTick();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    const observer = new IntersectionObserver(
      ([entry]) => {
        hiddenRef.current = !entry.isIntersecting;
        if (entry.isIntersecting && !isTabHidden) restartTick();
      },
      { threshold: 0 },
    );
    observer.observe(canvas);

    function tick() {
      if (isTabHidden || hiddenRef.current) return;

      const drag = dragRef.current;
      const liveDrag = drag.active && drag.committed;
      const velocity = velocityRef.current;

      if (!liveDrag) {
        if (!pauseRef.current) {
          phiRef.current += 0.004 + scrollRef.current * 0.002;
        }
        if (Math.abs(velocity.phi) > 0.0001 || Math.abs(velocity.theta) > 0.0001) {
          phiRef.current += velocity.phi;
          thetaOffsetRef.current += velocity.theta;
          velocity.phi *= 0.95;
          velocity.theta *= 0.95;
        }
        const p = parallaxRef.current;
        p.current += (p.target - p.current) * 0.06;
        thetaOffsetRef.current += p.current * 0.02;
        thetaOffsetRef.current = clamp(thetaOffsetRef.current, THETA_OFFSET_MIN, THETA_OFFSET_MAX);
      }

      const currentPhi = phiRef.current + (liveDrag ? drag.offsetPhi : 0);
      const currentTheta = clamp(
        BASE_THETA + thetaOffsetRef.current + (liveDrag ? drag.offsetTheta : 0),
        THETA_OFFSET_MIN + BASE_THETA - 0.05,
        THETA_OFFSET_MAX + BASE_THETA + 0.05,
      );

      globe.update({ phi: currentPhi, theta: currentTheta });

      if (externalPhiRef) externalPhiRef.current = currentPhi;
      if (externalThetaRef) externalThetaRef.current = currentTheta;

      rafRef.current = requestAnimationFrame(tick);
    }

    function restartTick() {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(tick);
    }
    restartTick();

    // ── Safari WebGL context recovery ──
    const onContextLost = (e) => {
      e.preventDefault();
      cancelAnimationFrame(rafRef.current);
      globe.destroy();
      globeRef.current = null;
    };

    const onContextRestored = () => {
      globe.destroy();
      requestAnimationFrame(() => {
        globeRef.current = createGlobe(canvas, {
          devicePixelRatio: dpr, width: size, height: size,
          phi: phiRef.current, theta: BASE_THETA + thetaOffsetRef.current,
          dark: theme.dark, diffuse: theme.diffuse, scale: 1,
          mapSamples: theme.mapSamples, mapBrightness: theme.mapBrightness,
          mapBaseBrightness: theme.mapBaseBrightness, baseColor: theme.baseColor,
          markerColor: theme.markerColor, glowColor: theme.glowColor,
          markers, arcs, arcColor: theme.arcColor, arcWidth: 0.4, arcHeight: 0.25,
          markerElevation: 0.01, offset: [0, 0],
          context: { antialias: true, alpha: true, powerPreference: 'high-performance', depth: true, stencil: true },
        });
        canvas.classList.add('is-ready');
      });
    };

    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      globe.destroy();
      globeRef.current = null;
    };
  }, []);

  // ── Drag handlers (desktop only) ──
  const onPointerDown = (e) => {
    if (e.pointerType === 'touch') return;
    dragRef.current = {
      active: true, committed: false, pointerType: e.pointerType,
      startX: e.clientX, startY: e.clientY, offsetPhi: 0, offsetTheta: 0,
    };
    lastPointerRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    velocityRef.current = { phi: 0, theta: 0 };
    canvasRef.current?.classList.add('is-dragging');
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (drag.active && drag.pointerType !== 'touch') {
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.committed) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        drag.committed = true;
        canvasRef.current?.classList.add('is-dragging');
      }
      drag.offsetPhi = dx * 0.005;
      drag.offsetTheta = dy * 0.003;
      const now = Date.now();
      const last = lastPointerRef.current;
      if (last) {
        const dt = Math.max(now - last.t, 1);
        velocityRef.current = {
          phi: clamp(((e.clientX - last.x) / dt) * 0.3, -MAX_VELOCITY, MAX_VELOCITY),
          theta: clamp(((e.clientY - last.y) / dt) * 0.08, -MAX_VELOCITY, MAX_VELOCITY),
        };
      }
      lastPointerRef.current = { x: e.clientX, y: e.clientY, t: now };
      return;
    }
    if (e.pointerType === 'touch') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cy = (e.clientY - rect.top) / rect.height;
    parallaxRef.current.target = (cy - 0.5) * 0.08;
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    if (drag.committed) {
      phiRef.current += drag.offsetPhi;
      thetaOffsetRef.current = clamp(thetaOffsetRef.current + drag.offsetTheta, THETA_OFFSET_MIN, THETA_OFFSET_MAX);
    }
    dragRef.current = { active: false, committed: false, pointerType: drag.pointerType, startX: 0, startY: 0, offsetPhi: 0, offsetTheta: 0 };
    lastPointerRef.current = null;
    canvasRef.current?.classList.remove('is-dragging');
  };

  const markerElements = useMemo(() => markers.map((m) => ({ m, Icon: ICON_MAP[m.name] })), [markers]);

  return (
    <div className={`globe ${className}`}>
      <canvas
        ref={canvasRef}
        className="globe__canvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      />
      <div className="globe__glow" />
      {markerElements.map(({ m, Icon }) => (
        <button
          key={m.id}
          className="globe__marker-label"
          data-tooltip={m.name}
          style={{
            positionAnchor: `--cobe-${m.id}`,
            opacity: `var(--cobe-visible-${m.id}, 0)`,
            '--marker-color': GROUP_COLORS[m.group],
          }}
          onClick={() => onMarkerClick?.(m.name)}
        >
          {Icon && <Icon className="globe__marker-icon" />}
        </button>
      ))}
    </div>
  );
});

export default Globe;
