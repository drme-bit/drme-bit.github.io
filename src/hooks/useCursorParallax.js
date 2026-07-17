import { useState, useEffect } from 'react';

/**
 * useCursorParallax — Returns { x, y } offset from mouse (desktop) or { 0, 0 } (mobile).
 * Mobile gyro removed — too heavy with globe + terrain.
 */
export default function useCursorParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;
    if (isMobile) return;

    const onMove = (e) => {
      setOffset({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return offset;
}
