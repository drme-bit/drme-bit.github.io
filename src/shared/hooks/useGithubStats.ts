'use client';
import { useState, useEffect } from 'react';

interface GithubStats {
  repos: number;
  followers: number;
}

const CACHE_PREFIX = 'gh-stats:';

export default function useGithubStats(username: string): GithubStats | null {
  const [stats, setStats] = useState<GithubStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    const key = CACHE_PREFIX + username;
    try {
      const c = sessionStorage.getItem(key);
      if (c) {
        setStats(JSON.parse(c));
        return;
      }
    } catch {
      /* sessionStorage unavailable */
    }
    fetch(`https://api.github.com/users/${username}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        if (cancelled) return;
        const s: GithubStats = { repos: d.public_repos, followers: d.followers };
        setStats(s);
        try {
          sessionStorage.setItem(key, JSON.stringify(s));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {
        /* network error */
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  return stats;
}
