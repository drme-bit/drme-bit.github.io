'use client';
import { useSyncExternalStore } from 'react';

interface GithubStats {
  repos: number;
  followers: number;
}

const CACHE_PREFIX = 'gh-stats:';

const memCache = new Map<string, GithubStats>();
const inflight = new Set<string>();
const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((l) => l());
}

function readSession(username: string): GithubStats | null {
  try {
    if (typeof window === 'undefined') return null;
    const c = sessionStorage.getItem(CACHE_PREFIX + username);
    return c ? (JSON.parse(c) as GithubStats) : null;
  } catch {
    return null;
  }
}

function ensure(username: string): void {
  if (memCache.has(username) || inflight.has(username)) return;
  const fromSession = readSession(username);
  if (fromSession) {
    memCache.set(username, fromSession);
    notify();
    return;
  }
  inflight.add(username);
  fetch(`https://api.github.com/users/${username}`)
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((d) => {
      const s: GithubStats = { repos: d.public_repos, followers: d.followers };
      memCache.set(username, s);
      try {
        sessionStorage.setItem(CACHE_PREFIX + username, JSON.stringify(s));
      } catch {
        /* ignore */
      }
      notify();
    })
    .catch(() => {
      /* network error */
    })
    .finally(() => {
      inflight.delete(username);
    });
}

export default function useGithubStats(username: string): GithubStats | null {
  // Server snapshot is always null → hydration HTML matches;
  // client re-reads the cache right after hydration without an error.
  // getSnapshot returns the stable cached reference (never a fresh object,
  // or React loops forever re-rendering on each new snapshot).
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      ensure(username);
      return () => {
        listeners.delete(cb);
      };
    },
    () => memCache.get(username) ?? null,
    () => null,
  );
}
