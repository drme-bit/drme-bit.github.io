import { useState, useEffect } from 'react';

function requestOrientationPermission() {
  if (
    typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission === 'function'
  ) {
    DeviceOrientationEvent.requestPermission().then((state) => {
      if (state !== 'granted') console.warn('deviceorientation permission denied');
    });
  }
}

export default function useCursorParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;

    if (isMobile && typeof DeviceOrientationEvent !== 'undefined') {
      const grantedRef = { current: false };

      const onOrientation = (e) => {
        if (e.gamma == null) return;
        setOffset({
          x: Math.max(-1, Math.min(1, e.gamma / 90)),
          y: Math.max(-1, Math.min(1, (e.beta ?? 0) / 180)),
        });
      };

      const onUserGesture = () => {
        if (grantedRef.current) return;
        grantedRef.current = true;
        requestOrientationPermission();
        window.removeEventListener('pointerup', onUserGesture);
      };

      window.addEventListener('deviceorientation', onOrientation);
      window.addEventListener('pointerup', onUserGesture);

      return () => {
        window.removeEventListener('deviceorientation', onOrientation);
        window.removeEventListener('pointerup', onUserGesture);
      };
    }

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
