import createGlobe from 'cobe';
import { useEffect, useRef, useMemo } from 'react';
import { SKILLS_DATA, ICON_MAP, GROUP_COLORS } from '@/pages/Main/sections/Skills/skillsData';
import './Globe.scss';

const BASE_THETA = 0.25;
const THETA_OFFSET_MIN = -0.32;
const THETA_OFFSET_MAX = 0.32;
const MAX_VELOCITY = 0.15;

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function hexToRgb01(hex) {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ];
}

const GROUP_SIZES = { frontend: 0.06, backend: 0.05, tools: 0.045 };

function buildMarkers(skills) {
  const n = skills.length;
  return skills.map((skill, i) => {
    // Vogel spiral — even distribution on sphere
    const theta = 2.39996323 * i; // golden angle in radians
    const r = Math.sqrt(1 - (i / n)); // radius from center
    const y = 1 - (2 * i) / n; // y: 1 → -1
    const lat = (Math.asin(y) * 180) / Math.PI;
    const lng = ((theta * 180) / Math.PI) % 360;
    return {
      location: [lat, lng],
      size: GROUP_SIZES[skill.group] || 0.04,
      id: skill.name.replace(/[^a-zA-Z]/g, ''),
      name: skill.name,
      group: skill.group,
    };
  });
}

function buildArcs(m) {
  const arcs = [];
  const byGroup = {};
  m.forEach((mk) => {
    if (!byGroup[mk.group]) byGroup[mk.group] = [];
    byGroup[mk.group].push(mk);
  });
  Object.values(byGroup).forEach((group) => {
    for (let i = 1; i < group.length; i++) {
      arcs.push({ from: group[i - 1].location, to: group[i].location });
    }
  });
  return arcs;
}

function getGlobeTheme() {
  const isLight = document.body.classList.contains('light');
  if (isLight) {
    return {
      dark: 1,
      diffuse: 2,
      mapSamples: 16000,
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
    mapSamples: 12000,
    mapBrightness: 6,
    mapBaseBrightness: 0,
    baseColor: [0.12, 0.12, 0.12],
    markerColor: [0.49, 0.83, 0.99],
    glowColor: [0.27, 0.26, 0.25],
    arcColor: [0.49, 0.83, 0.99],
  };
}

export default function Globe({
  className = '',
  scrollProgress = 0,
  phiRef: externalPhiRef,
  thetaRef: externalThetaRef,
  paused = false,
  onMarkerClick,
  selectedSkill = null,
  filteredSkills = null,
}) {
  const canvasRef = useRef(null);
  const globeRef = useRef(null);
  const phiRef = useRef(0);
  const thetaOffsetRef = useRef(0);
  const velocityRef = useRef({ phi: 0, theta: 0 });
  const lastPointerRef = useRef(null);
  const scrollRef = useRef(scrollProgress);
  const pauseRef = useRef(paused);
  const rafRef = useRef(null);
  const themeRef = useRef(getGlobeTheme());
  const dragRef = useRef({
    active: false,
    committed: false,
    pointerType: 'mouse',
    startX: 0,
    startY: 0,
    offsetPhi: 0,
    offsetTheta: 0,
  });

  scrollRef.current = scrollProgress;
  pauseRef.current = paused;

  const markers = useMemo(() => buildMarkers(SKILLS_DATA), []);
  const arcs = useMemo(() => buildArcs(markers), [markers]);

  const createGlobeInstance = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    const isMobile = window.innerWidth <= 768;
    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
    const maxPx = isMobile ? 500 : 800;
    const size = Math.max(Math.round(Math.min(Math.max(rect.width, rect.height), maxPx) * dpr), 200);

    if (globeRef.current) {
      globeRef.current.destroy();
      globeRef.current = null;
    }
    canvas.classList.remove('is-ready');

    const theme = getGlobeTheme();
    themeRef.current = theme;

    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: phiRef.current,
      theta: BASE_THETA + thetaOffsetRef.current,
      dark: theme.dark,
      diffuse: theme.diffuse,
      scale: 1,
      mapSamples: isMobile ? 8000 : theme.mapSamples,
      mapBrightness: isMobile ? 5 : theme.mapBrightness,
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
    });

    canvas.classList.add('is-ready');
  };

  useEffect(() => {
    createGlobeInstance();
    let frame = 0;
    let isMobile = window.innerWidth <= 768;
    let isVisible = true;

    const tick = () => {
      frame++;

      const drag = dragRef.current;
      const isLiveDrag = drag.active && drag.committed;
      const v = velocityRef.current;
      const hasVelocity = Math.abs(v.phi) > 0.0001 || Math.abs(v.theta) > 0.0001;

      if (!isVisible && !isLiveDrag && (pauseRef.current || !hasVelocity)) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isLiveDrag) {
        // During live drag, phi/theta are driven by drag offsets below
      } else {
        if (!pauseRef.current) {
          phiRef.current += 0.004 + scrollRef.current * 0.002;
        }
        if (hasVelocity) {
          phiRef.current += v.phi;
          thetaOffsetRef.current += v.theta;
          v.phi *= 0.95;
          v.theta *= 0.95;
        }
        thetaOffsetRef.current = clamp(thetaOffsetRef.current, THETA_OFFSET_MIN, THETA_OFFSET_MAX);
      }

      const currentPhi = phiRef.current + (isLiveDrag ? drag.offsetPhi : 0);
      const currentTheta = clamp(
        BASE_THETA + thetaOffsetRef.current + (isLiveDrag ? drag.offsetTheta : 0),
        THETA_OFFSET_MIN + BASE_THETA - 0.05,
        THETA_OFFSET_MAX + BASE_THETA + 0.05,
      );

      if (externalPhiRef) externalPhiRef.current = currentPhi;
      if (externalThetaRef) externalThetaRef.current = currentTheta;

      if (isVisible) {
        globeRef.current?.update({
          phi: currentPhi,
          theta: currentTheta,
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    let resizeTimeout = null;
    let lastSize = 0;
    const scheduleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const newSize = Math.round(Math.max(rect.width, rect.height));
        if (Math.abs(newSize - lastSize) < 30) return;
        lastSize = newSize;
        isMobile = window.innerWidth <= 768;
        createGlobeInstance();
      }, 400);
    };

    const resizeObserver = new ResizeObserver(scheduleResize);
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }
    window.addEventListener('orientationchange', scheduleResize);

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    if (canvasRef.current) intersectionObserver.observe(canvasRef.current);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('orientationchange', scheduleResize);
      globeRef.current?.destroy();
      globeRef.current = null;
    };
  }, []);

  const onPointerDown = (e) => {
    const isTouch = e.pointerType === 'touch';
    dragRef.current = {
      active: true,
      committed: !isTouch,
      pointerType: e.pointerType,
      startX: e.clientX,
      startY: e.clientY,
      offsetPhi: 0,
      offsetTheta: 0,
    };
    lastPointerRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
    velocityRef.current = { phi: 0, theta: 0 };
    if (!isTouch) canvasRef.current?.classList.add('is-dragging');
  };

  const onPointerMove = (e) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    const isTouch = drag.pointerType === 'touch';

    if (!drag.committed) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        drag.active = false;
        return;
      }
      drag.committed = true;
      canvasRef.current?.classList.add('is-dragging');
    }

    drag.offsetPhi = dx * 0.005;
    drag.offsetTheta = isTouch ? 0 : dy * 0.003;

    const now = Date.now();
    const last = lastPointerRef.current;
    if (last) {
      const dt = Math.max(now - last.t, 1);
      velocityRef.current = {
        phi: clamp(((e.clientX - last.x) / dt) * 0.3, -MAX_VELOCITY, MAX_VELOCITY),
        theta: isTouch ? 0 : clamp(((e.clientY - last.y) / dt) * 0.08, -MAX_VELOCITY, MAX_VELOCITY),
      };
    }
    lastPointerRef.current = { x: e.clientX, y: e.clientY, t: now };
  };

  const onPointerUp = () => {
    const drag = dragRef.current;
    if (!drag.active) return;
    if (drag.committed) {
      phiRef.current += drag.offsetPhi;
      thetaOffsetRef.current = clamp(
        thetaOffsetRef.current + drag.offsetTheta,
        THETA_OFFSET_MIN,
        THETA_OFFSET_MAX,
      );
    }
    dragRef.current = {
      active: false,
      committed: false,
      pointerType: drag.pointerType,
      startX: 0,
      startY: 0,
      offsetPhi: 0,
      offsetTheta: 0,
    };
    lastPointerRef.current = null;
    canvasRef.current?.classList.remove('is-dragging');
  };

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
      {markers.map((m) => {
        const Icon = ICON_MAP[m.name];
        const isActive = selectedSkill === m.name;
        const isDimmed = filteredSkills && !filteredSkills.has(m.name);
        return (
          <button
            key={m.id}
            className={`globe__marker-label${isActive ? ' is-active' : ''}${isDimmed ? ' is-dimmed' : ''}`}
            data-tooltip={m.name}
            style={{
              positionAnchor: `--cobe-${m.id}`,
              opacity: isDimmed ? '0.15' : `var(--cobe-visible-${m.id}, 0)`,
              '--marker-color': GROUP_COLORS[m.group],
            }}
            onClick={() => onMarkerClick?.(m.name)}
          >
            {Icon && <Icon className="globe__marker-icon" />}
          </button>
        );
      })}
    </div>
  );
}
