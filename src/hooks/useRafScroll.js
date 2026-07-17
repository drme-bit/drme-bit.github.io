import { useEffect, useState, useRef } from 'react';

let sharedRaf = null;
const listeners = new Set();
let scrollY = 0;
let scrollPct = 0;
let winH = 0;

function tick() {
  scrollY = window.scrollY;
  winH = window.innerHeight;
  const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  scrollPct = docH > winH ? scrollY / (docH - winH) : 0;
  for (const fn of listeners) fn(scrollY, scrollPct, winH);
  sharedRaf = requestAnimationFrame(tick);
}

function ensureRaf() {
  if (sharedRaf === null) {
    scrollY = window.scrollY;
    winH = window.innerHeight;
    sharedRaf = requestAnimationFrame(tick);
  }
}

function stopRaf() {
  if (listeners.size === 0 && sharedRaf !== null) {
    cancelAnimationFrame(sharedRaf);
    sharedRaf = null;
  }
}

export function useScrollProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const fn = (_sy, sp) => setPct(sp);
    listeners.add(fn);
    ensureRaf();
    fn(scrollY, scrollPct, winH);
    return () => {
      listeners.delete(fn);
      stopRaf();
    };
  }, []);

  return pct;
}

export function useScrollY() {
  const [y, setY] = useState(0);

  useEffect(() => {
    const fn = (sy) => setY(sy);
    listeners.add(fn);
    ensureRaf();
    fn(scrollY, scrollPct, winH);
    return () => {
      listeners.delete(fn);
      stopRaf();
    };
  }, []);

  return y;
}
