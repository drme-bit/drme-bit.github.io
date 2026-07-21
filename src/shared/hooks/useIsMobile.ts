'use client';
import { useSyncExternalStore } from 'react';

const QUERY = '(max-width: 768px)';

function getSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot(): boolean {
  return false;
}

function subscribe(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia(QUERY);
  const handler = () => callback();
  mql.addEventListener('change', handler);
  return () => mql.removeEventListener('change', handler);
}

export default function useIsMobile(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
