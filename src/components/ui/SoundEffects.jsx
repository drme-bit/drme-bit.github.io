import { useEffect, useRef } from 'react';

export default function SoundEffects() {
  const ctxRef = useRef(null);

  useEffect(() => {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    ctxRef.current = new Ctor();

    const beep = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 1200 + Math.random() * 600;
      g.gain.value = 0.015;
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.connect(g).connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.08);
    };

    const onUp = (e) => {
      if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a, button')) {
        beep();
      }
    };
    window.addEventListener('pointerup', onUp);

    return () => {
      window.removeEventListener('pointerup', onUp);
      ctxRef.current?.close();
    };
  }, []);

  return null;
}
