import createGlobe from 'cobe';
import { useEffect, useRef } from 'react';
import './Globe.scss';

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
  paused = false,
}) {
  const canvasRef = useRef(null);
  const globeRef = useRef(null);
  const phiRef = useRef(0);
  const scrollRef = useRef(scrollProgress);
  const pauseRef = useRef(paused);
  const rafRef = useRef(null);
  const dragRef = useRef({ active: false, committed: false, startX: 0, startY: 0, offset: 0 });

  scrollRef.current = scrollProgress;
  pauseRef.current = paused;

  const createGlobeInstance = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return; // not laid out yet, skip
    const isMobile = window.innerWidth <= 768;
    const dpr = Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2);
    const size = Math.max(Math.round(Math.max(rect.width, rect.height) * dpr), 200);

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
      theta: 0.3,
      dark: colors.dark,
      diffuse: 1.2,
      scale: 1,
      mapSamples: isMobile ? 1000 : 16000,
      mapBrightness: isMobile ? 4 : 6,
      baseColor: colors.baseColor,
      markerColor: colors.markerColor,
      glowColor: colors.glowColor,
      offset: [0, 0],
    });

    canvas.classList.add('is-ready')
  }

  useEffect(() => {
    createGlobeInstance()
    let frame = 0
    let isMobile = window.innerWidth <= 768
    let isVisible = true

    const tick = () => {
      frame++;
      if (!isVisible) {
        // Fully skip work while off-screen — no rAF requeue means the
        // browser doesn't burn cycles rendering a globe nobody sees.
        return
      }

      if (isMobile && frame % 3 !== 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (!dragRef.current.active && !pauseRef.current) {
        phiRef.current += 0.004 + scrollRef.current * 0.002
      }

      const currentPhi = phiRef.current + dragRef.current.offset
      if (externalPhiRef) externalPhiRef.current = currentPhi
      globeRef.current?.update({
        phi: currentPhi,
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    const observer = new MutationObserver(() => {
      createGlobeInstance();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Recreate the globe at the correct pixel size whenever the canvas's
    // actual layout box changes — orientation change, window resize, or
    // the scroll-driven flex-basis animation that shrinks/grows the
    // container. Without this the WebGL backbuffer stays frozen at the
    // size it had on mount and just gets stretched/blurred by CSS.
    let resizeTimeout = null;
    const scheduleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        isMobile = window.innerWidth <= 768;
        createGlobeInstance();
      }, 150);
    };

    const resizeObserver = new ResizeObserver(scheduleResize);
    if (canvasRef.current?.parentElement) {
      resizeObserver.observe(canvasRef.current.parentElement);
    }
    window.addEventListener('orientationchange', scheduleResize);

    // Pause entirely when scrolled out of view — saves battery/perf on
    // mobile and avoids a jarring "catch-up" jump when scrolling back in.
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          rafRef.current = requestAnimationFrame(tick);
        }
      },
      { threshold: 0.01 },
    );
    if (canvasRef.current) intersectionObserver.observe(canvasRef.current);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (resizeTimeout) clearTimeout(resizeTimeout);
      observer.disconnect();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener('orientationchange', scheduleResize);
      globeRef.current?.destroy();
      globeRef.current = null;
    };
  }, []);

  const onPointerDown = (e) => {
    dragRef.current = {
      active: true,
      committed: false,
      startX: e.clientX,
      startY: e.clientY,
      offset: dragRef.current.offset,
    };
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    // Direction lock: wait for 10px to determine intent
    if (!dragRef.current.committed) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      // If primarily vertical → release drag, let browser scroll
      if (Math.abs(dy) > Math.abs(dx)) {
        dragRef.current = {
          active: false,
          committed: false,
          startX: 0,
          startY: 0,
          offset: dragRef.current.offset,
        };
        return;
      }
      dragRef.current.committed = true;
      canvasRef.current?.classList.add('is-dragging');
    }

    dragRef.current.offset = dx * 0.005;
  };

  const onPointerUp = () => {
    if (!dragRef.current.active) return;
    if (dragRef.current.committed) {
      phiRef.current += dragRef.current.offset;
    }
    dragRef.current = { active: false, committed: false, startX: 0, startY: 0, offset: 0 };
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
