'use client';

import { createContext, useContext, useEffect, useRef, useCallback, useState } from 'react';
import { doc, onSnapshot, increment, runTransaction } from 'firebase/firestore';
import { db } from '@/shared/config/firebase';

/* ─── Types ──────────────────────────────────────────────── */

interface PersonalStats {
  clicks: number;
  skillsChecked: number;
  projectsViewed: number;
  sectionsRevealed: number;
  timeOnSite: number;
}

interface GlobalStats {
  totalClicks: number;
  totalVisitors: number;
  totalSkillsChecked: number;
  totalProjectsViewed: number;
  totalSectionsRevealed: number;
}

interface ActivityContextValue {
  personal: PersonalStats;
  global: GlobalStats;
  mounted: boolean;
  incrementClicks: () => void;
  incrementSkillsChecked: () => void;
  incrementProjectsViewed: () => void;
  incrementSectionsRevealed: () => void;
}

/* ─── Constants ──────────────────────────────────────────── */

const STORAGE_KEY = 'drme_activity';
const SAVE_INTERVAL = 5000;

const EMPTY: PersonalStats = { clicks: 0, skillsChecked: 0, projectsViewed: 0, sectionsRevealed: 0, timeOnSite: 0 };

const EMPTY_GLOBAL: GlobalStats = {
  totalClicks: 0,
  totalVisitors: 0,
  totalSkillsChecked: 0,
  totalProjectsViewed: 0,
  totalSectionsRevealed: 0,
};

/* ─── Helpers ────────────────────────────────────────────── */

function loadPersonal(): PersonalStats {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return EMPTY;
}

function savePersonal(stats: PersonalStats) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

/* ─── Context ────────────────────────────────────────────── */

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}

/* ─── Provider ───────────────────────────────────────────── */

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [personal, setPersonal] = useState<PersonalStats>(EMPTY);
  const [global, setGlobal] = useState<GlobalStats>(EMPTY_GLOBAL);
  const [mounted, setMounted] = useState(false);
  const dirtyRef = useRef(false);
  const startTime = useRef(0);

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setPersonal(loadPersonal());
    startTime.current = Date.now();
    setMounted(true);
  }, []);

  // Listen to global stats
  useEffect(() => {
    const ref = doc(db, 'siteStats', 'global');
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setGlobal({
          totalClicks: d.totalClicks ?? 0,
          totalVisitors: d.totalVisitors ?? 0,
          totalSkillsChecked: d.totalSkillsChecked ?? 0,
          totalProjectsViewed: d.totalProjectsViewed ?? 0,
          totalSectionsRevealed: d.totalSectionsRevealed ?? 0,
        });
      }
    }, () => {});
    return () => unsub();
  }, []);

  // Increment visitor count on mount
  useEffect(() => {
    async function incVisitor() {
      try {
        const ref = doc(db, 'siteStats', 'global');
        await runTransaction(db, async (tx) => {
          const snap = await tx.get(ref);
          if (!snap.exists()) {
            tx.set(ref, {
              totalClicks: 0,
              totalVisitors: 1,
              totalSkillsChecked: 0,
              totalProjectsViewed: 0,
              totalSectionsRevealed: 0,
            });
          } else {
            tx.update(ref, { totalVisitors: increment(1) });
          }
        });
      } catch {}
    }
    incVisitor();
  }, []);

  // Track time on site
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      setPersonal((prev) => ({ ...prev, timeOnSite: elapsed }));
    }, 1000);
    return () => clearInterval(interval);
  }, [mounted]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!mounted) return;
    const interval = setInterval(() => {
      if (dirtyRef.current) {
        savePersonal(personal);
        dirtyRef.current = false;
      }
    }, SAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [personal, mounted]);

  // Save on unmount
  useEffect(() => {
    if (!mounted) return;
    return () => savePersonal(personal);
  }, [personal, mounted]);

  const markDirty = useCallback(() => { dirtyRef.current = true; }, []);

  const incGlobal = useCallback((field: string) => {
    try {
      const ref = doc(db, 'siteStats', 'global');
      runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        if (snap.exists()) tx.update(ref, { [field]: increment(1) });
      });
    } catch {}
  }, []);

  const incrementClicks = useCallback(() => {
    setPersonal((prev) => ({ ...prev, clicks: prev.clicks + 1 }));
    markDirty();
    incGlobal('totalClicks');
  }, [markDirty, incGlobal]);

  const incrementSkillsChecked = useCallback(() => {
    setPersonal((prev) => ({ ...prev, skillsChecked: prev.skillsChecked + 1 }));
    markDirty();
    incGlobal('totalSkillsChecked');
  }, [markDirty, incGlobal]);

  const incrementProjectsViewed = useCallback(() => {
    setPersonal((prev) => ({ ...prev, projectsViewed: prev.projectsViewed + 1 }));
    markDirty();
    incGlobal('totalProjectsViewed');
  }, [markDirty, incGlobal]);

  const incrementSectionsRevealed = useCallback(() => {
    setPersonal((prev) => ({ ...prev, sectionsRevealed: prev.sectionsRevealed + 1 }));
    markDirty();
    incGlobal('totalSectionsRevealed');
  }, [markDirty, incGlobal]);

  return (
    <ActivityContext.Provider
      value={{
        personal,
        global,
        mounted,
        incrementClicks,
        incrementSkillsChecked,
        incrementProjectsViewed,
        incrementSectionsRevealed,
      }}
    >
      {children}
    </ActivityContext.Provider>
  );
}
