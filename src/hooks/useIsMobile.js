import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 768px)';

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

export default function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
