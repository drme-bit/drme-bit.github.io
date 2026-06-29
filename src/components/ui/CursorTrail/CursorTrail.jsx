import { useEffect, useRef } from 'react';

const TRAIL_LEN = 20;
const TRAIL_LIFETIME = 600;

export default function CursorTrail() {
  const canvasRef = useRef(null);
  const pointsRef = useRef([]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const x = c.getContext('2d');
    let raf;

    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e) => {
      pointsRef.current.push({ x: e.clientX, y: e.clientY, t: Date.now() + TRAIL_LIFETIME });
      if (pointsRef.current.length > TRAIL_LEN) pointsRef.current.shift();
    };
    window.addEventListener('pointermove', onMove);

    const draw = () => {
      x.clearRect(0, 0, c.width, c.height);
      const now = Date.now();
      pointsRef.current = pointsRef.current.filter((p) => p.t > now);

      const len = pointsRef.current.length;
      if (len < 2) { raf = requestAnimationFrame(draw); return; }

      for (let i = 1; i < len; i++) {
        const alpha = (i / len) * 0.2;
        const w = (i / len) * 2;
        x.beginPath();
        x.moveTo(pointsRef.current[i - 1].x, pointsRef.current[i - 1].y);
        x.lineTo(pointsRef.current[i].x, pointsRef.current[i].y);
        x.strokeStyle = `rgba(94,200,216,${alpha})`;
        x.lineWidth = w;
        x.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 99998 }}
    />
  );
}
