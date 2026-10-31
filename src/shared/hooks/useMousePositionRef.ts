'use client';

import { useEffect, useRef, type RefObject } from 'react';

/* Mouse position in a ref (never re-renders). Container rect is cached —
   reading getBoundingClientRect on every mousemove would force layout. */

export function useMousePositionRef(containerRef?: RefObject<HTMLElement | null>) {
  const positionRef = useRef({ x: 0, y: 0 });
  const rectRef = useRef<DOMRect | null>(null);

  useEffect(() => {
    const measure = () => {
      rectRef.current = containerRef?.current?.getBoundingClientRect() ?? null;
    };
    measure();

    const updatePosition = (x: number, y: number) => {
      const rect = rectRef.current;
      if (rect) {
        positionRef.current = { x: x - rect.left, y: y - rect.top };
      } else {
        positionRef.current = { x, y };
      }
    };

    const handleMouseMove = (ev: MouseEvent) => {
      updatePosition(ev.clientX, ev.clientY);
    };

    const handleTouchMove = (ev: TouchEvent) => {
      const touch = ev.touches[0];
      if (touch) updatePosition(touch.clientX, touch.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', measure);
    };
  }, [containerRef]);

  return positionRef;
}
