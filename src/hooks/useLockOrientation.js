import { useEffect, useRef } from 'react';

const LOCK_API = typeof screen !== 'undefined' && screen.orientation && screen.orientation.lock;
const IS_TOUCH = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

export default function useLockOrientation(orientation = 'portrait') {
  const locked = useRef(false);

  useEffect(() => {
    if (!IS_TOUCH) return;

    // screen.orientation.lock — works only in fullscreen (PWA / standalone)
    if (LOCK_API) {
      screen.orientation.lock(orientation).catch(() => {});
      locked.current = true;
    }

    // orientationchange fallback — prevent layout reflow on rotate
    const prevent = (e) => {
      e.preventDefault();
    };
    window.addEventListener('orientationchange', prevent, { passive: false });

    return () => {
      window.removeEventListener('orientationchange', prevent);
      if (locked.current && LOCK_API) {
        screen.orientation.unlock().catch(() => {});
      }
    };
  }, [orientation]);
}
