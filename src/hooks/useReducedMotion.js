import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

function subscribe(callback) {
  const mql = window.matchMedia(QUERY);
  const handler = () => callback();
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

export default function useReducedMotion() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
