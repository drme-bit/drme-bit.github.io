import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';
import './Globe.scss';

const BASE_THETA = 0.3;
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

function getGlobeColors() {
  const s = getComputedStyle(document.body);
  const isLight = document.body.classList.contains('light');
  const accent = s.getPropertyValue('--accent').trim() || '#e8e4df';
  const accentSecondary = s.getPropertyValue('--accent-secondary').trim() || '#7dd3fc';
  const accentTertiary = s.getPropertyValue('--accent-tertiary').trim() || '#c4b5fd';
  return {
    dark: isLight ? 1 : 0,
    baseColor: isLight ? [0.85, 0.83, 0.81] : [0.17, 0.17, 0.17],
    markerColor: hexToRgb01(accentSecondary),
    glowColor: hexToRgb01(accent),
  };
}

export default function Globe({
  className = '',
  scrollProgress = 0,
  phiRef: externalPhiRef,
  thetaRef: externalThetaRef,
  paused = false,
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

    const colors = getGlobeColors();
    globeRef.current = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: size,
      height: size,
      phi: phiRef.current,
      theta: BASE_THETA + thetaOffsetRef.current,
      dark: colors.dark,
      diffuse: 1.2,
      scale: 1,
      mapSamples: isMobile ? 1000 : 6000,
      mapBrightness: isMobile ? 4 : 6,
      baseColor: colors.baseColor,
      markerColor: colors.markerColor,
      glowColor: colors.glowColor,
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
      if (isMobile && frame % 3 !== 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

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
      // Mouse/pen commit to a drag immediately — desktop has no page-scroll
      // conflict to worry about. Touch waits for a direction lock below so
      // a vertical swipe still scrolls the page instead of spinning the globe.
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
      // Direction lock: wait for 10px to determine intent (touch only)
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        // Primarily vertical → release drag, let the browser scroll
        drag.active = false;
        return;
      }
      drag.committed = true;
      canvasRef.current?.classList.add('is-dragging');
    }

    drag.offsetPhi = dx * 0.005;
    // Touch stays horizontal-only so vertical intent always means "scroll".
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
    // velocityRef is intentionally left as-is so momentum keeps coasting.
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
    </div>
  );
}
