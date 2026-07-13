import { useState, useEffect } from 'react';

let gyro = { x: 0, y: 0, available: false };
let gyroListeners = new Set();

function gyroTick() {
  for (const fn of gyroListeners) fn(gyro.x, gyro.y);
}

function startGyro() {
  const isIOS = typeof DeviceOrientationEvent !== 'undefined'
    && typeof DeviceOrientationEvent.requestPermission === 'function';

  const handleOrientation = (e) => {
    if (e.gamma == null) return;
    gyro.x = Math.max(-1, Math.min(1, e.gamma / 90));
    gyro.y = Math.max(-1, Math.min(1, (e.beta ?? 45) / 180));
    gyro.available = true;
    gyroTick();
  };

  if (isIOS) {
    const requestPermission = () => {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        })
        .catch(() => { /* permission denied */ });
      document.removeEventListener('pointerup', requestPermission);
    };
    document.addEventListener('pointerup', requestPermission, { once: true });
  } else {
    window.addEventListener('deviceorientation', handleOrientation);
  }

  return () => {
    window.removeEventListener('deviceorientation', handleOrientation);
  };
}

let cleanupGyro = null;

function ensureGyro() {
  if (cleanupGyro) return;
  cleanupGyro = startGyro();
}

function stopGyro() {
  if (gyroListeners.size === 0 && cleanupGyro) {
    cleanupGyro();
    cleanupGyro = null;
  }
}

export default function useCursorParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const isMobile = window.matchMedia('(pointer: coarse)').matches;

    if (isMobile) {
      const fn = (gx, gy) => setOffset({ x: gx, y: gy });
      gyroListeners.add(fn);
      ensureGyro();

      if (gyro.available) fn(gyro.x, gyro.y);

      return () => {
        gyroListeners.delete(fn);
        stopGyro();
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
