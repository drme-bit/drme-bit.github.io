import { useEffect, useRef, useCallback } from 'react';

/*
  Enhanced Sound Effects System
  - Multiple synthesized sounds for different interactions
  - Respects prefers-reduced-motion
  - Lazy AudioContext creation
  - Volume control per sound type
*/

const SOUNDS = {
  click: { freq: 800, type: 'sine', duration: 0.05, volume: 0.012 },
  hover: { freq: 1200, type: 'sine', duration: 0.03, volume: 0.006 },
  type: { freq: 600, type: 'square', duration: 0.02, volume: 0.008 },
  scroll: { freq: 1000, type: 'sine', duration: 0.01, volume: 0.004 },
  section: { freq: 400, type: 'sine', duration: 0.15, volume: 0.01, sweep: true },
};

export default function SoundEffects() {
  const ctxRef = useRef(null);
  const lastScrollTick = useRef(0);
  const prefersReduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReduced.current = mq.matches;
    const handler = (e) => { prefersReduced.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const getCtx = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new Ctor();
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playSound = useCallback((soundName) => {
    if (prefersReduced.current) return;
    const ctx = getCtx();
    if (!ctx) return;

    const sound = SOUNDS[soundName];
    if (!sound) return;

    const o = ctx.createOscillator();
    const g = ctx.createGain();

    o.type = sound.type;
    o.frequency.value = sound.freq;

    g.gain.value = sound.volume;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + sound.duration);

    if (sound.sweep) {
      o.frequency.exponentialRampToValueAtTime(sound.freq * 1.5, ctx.currentTime + sound.duration);
    }

    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + sound.duration);
  }, [getCtx]);

  useEffect(() => {
    const handlePointerUp = (e) => {
      const target = e.target;
      if (target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a, button, [role="button"]')) {
        playSound('click');
      }
    };

    const handlePointerOver = (e) => {
      const target = e.target;
      if (target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a, button, [role="button"]')) {
        playSound('hover');
      }
    };

    const handleKeyDown = (e) => {
      if (e.key.length === 1 || e.key === 'Backspace' || e.key === 'Delete') {
        playSound('type');
      }
    };

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastScrollTick.current > 100) {
        playSound('scroll');
        lastScrollTick.current = now;
      }
    };

    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    window.addEventListener('pointerover', handlePointerOver, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointerover', handlePointerOver);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll);
      ctxRef.current?.close();
    };
  }, [playSound]);

  return null;
}
