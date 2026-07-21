'use client';
import { useEffect, useRef } from 'react';

const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function useLockOrientation(orientation = 'portrait') {
  const locked = useRef(false);

  useEffect(() => {
    if (!IS_TOUCH) return;

    const LOCK_API = typeof screen !== 'undefined' && (screen.orientation as unknown as { lock?: (o: string) => Promise<void> })?.lock;
    if (LOCK_API) {
      (screen.orientation as unknown as { lock: (o: string) => Promise<void> }).lock(orientation).catch(() => {});
      locked.current = true;
    }

    const prevent = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('orientationchange', prevent, { passive: false });

    return () => {
      window.removeEventListener('orientationchange', prevent);
      if (locked.current && LOCK_API) {
        (screen.orientation as unknown as { unlock: () => Promise<void> }).unlock().catch(() => {});
      }
    };
  }, [orientation]);
}
