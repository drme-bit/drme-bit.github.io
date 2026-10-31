'use client';

import { createContext, useContext, useEffect, useRef, useCallback, useState, useSyncExternalStore } from 'react';

/*  Types  */

interface PersonalStats {
  clicks: number;
  skillsChecked: number;
  projectsViewed: number;
  sectionsRevealed: number;
  timeOnSite: number;
}

interface ActivityContextValue {
  personal: PersonalStats;
  mounted: boolean;
  incrementClicks: () => void;
  incrementSkillsChecked: () => void;
  incrementProjectsViewed: () => void;
  incrementSectionsRevealed: () => void;
}

/*  Constants ── */

const STORAGE_KEY = 'drme_activity';
const SAVE_INTERVAL = 5000;

const EMPTY: PersonalStats = { clicks: 0, skillsChecked: 0, projectsViewed: 0, sectionsRevealed: 0, timeOnSite: 0 };

/*  Helpers ─ */

function loadPersonal(): PersonalStats {
  if (typeof window === 'undefined') return EMPTY;
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

function subscribeMounted(): () => void {
  return () => {};
}

function snapshotMountedClient(): boolean {
  return true;
}

function snapshotMountedServer(): boolean {
  return false;
}

/*  Context ─ */

const ActivityContext = createContext<ActivityContextValue | null>(null);

export function useActivity() {
  const ctx = useContext(ActivityContext);
  if (!ctx) throw new Error('useActivity must be used within ActivityProvider');
  return ctx;
}

/*  Provider  */

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [personal, setPersonal] = useState<PersonalStats>(() =>
    typeof window === 'undefined' ? EMPTY : loadPersonal(),
  );
  // Mounted flag without a setState-in-effect: false during SSR, true on the client.
  const mounted = useSyncExternalStore(
    subscribeMounted,
    snapshotMountedClient,
    snapshotMountedServer,
  );
  const dirtyRef = useRef(false);
  const startTime = useRef(0);

  // Record session start (ref write only — no setState, safe in an effect).
  useEffect(() => {
    startTime.current = Date.now();
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

  const incrementClicks = useCallback(() => {
    setPersonal((prev) => ({ ...prev, clicks: prev.clicks + 1 }));
    markDirty();
  }, [markDirty]);

  const incrementSkillsChecked = useCallback(() => {
    setPersonal((prev) => ({ ...prev, skillsChecked: prev.skillsChecked + 1 }));
    markDirty();
  }, [markDirty]);

  const incrementProjectsViewed = useCallback(() => {
    setPersonal((prev) => ({ ...prev, projectsViewed: prev.projectsViewed + 1 }));
    markDirty();
  }, [markDirty]);

  const incrementSectionsRevealed = useCallback(() => {
    setPersonal((prev) => ({ ...prev, sectionsRevealed: prev.sectionsRevealed + 1 }));
    markDirty();
  }, [markDirty]);

  // Track all clicks globally
  useEffect(() => {
    if (!mounted) return;
    const handler = () => incrementClicks();
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [mounted, incrementClicks]);

  return (
    <ActivityContext.Provider
      value={{
        personal,
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
