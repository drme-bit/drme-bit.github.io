import { useRef, useCallback } from 'react';

const TYPING_FREQS = [800, 900, 1000, 1100, 950, 850];

export function useTypingSound() {
  const ctxRef = useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  const play = useCallback(() => {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'triangle';
    o.frequency.value = TYPING_FREQS[Math.floor(Math.random() * TYPING_FREQS.length)];
    g.gain.value = 0.008;
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.025);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.025);
  }, [getCtx]);

  const dispose = useCallback(() => {
    ctxRef.current?.close();
    ctxRef.current = null;
  }, []);

  return { play, dispose };
}
