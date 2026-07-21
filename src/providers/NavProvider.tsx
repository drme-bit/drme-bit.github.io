'use client';

import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from 'react';

/* ─── Types ──────────────────────────────────────────────── */

export interface NavSection {
  id: string;
  label: string;
}

export interface NavConfig {
  sections: NavSection[];
  activeSection?: string;
  onSectionClick?: (id: string) => void;
  arrows?: { prev?: string; next?: string; onPrev?: () => void; onNext?: () => void };
}

interface NavContextValue {
  config: NavConfig;
  setConfig: (config: NavConfig) => void;
  setActiveSection: (id: string) => void;
}

/* ─── Context ────────────────────────────────────────────── */

const NavContext = createContext<NavContextValue>({
  config: { sections: [] },
  setConfig: () => {},
  setActiveSection: () => {},
});

export function useNav() {
  return useContext(NavContext);
}

/* ─── Provider ───────────────────────────────────────────── */

const EMPTY_CONFIG: NavConfig = { sections: [] };

export function NavProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<NavConfig>(EMPTY_CONFIG);

  const setConfig = useCallback((cfg: NavConfig) => {
    setConfigState(cfg);
  }, []);

  const setActiveSection = useCallback((id: string) => {
    setConfigState((prev) =>
      prev.activeSection === id ? prev : { ...prev, activeSection: id },
    );
  }, []);

  const value = useMemo(
    () => ({ config, setConfig, setActiveSection }),
    [config, setConfig, setActiveSection],
  );

  return (
    <NavContext.Provider value={value}>
      {children}
    </NavContext.Provider>
  );
}
