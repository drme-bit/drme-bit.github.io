'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

export interface TransitionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TransitionPhase = 'idle' | 'closing' | 'opening';

interface PageTransitionContextValue {
  origin: TransitionRect | null;
  phase: TransitionPhase;
  setOrigin: (rect: TransitionRect | null) => void;
  setPhase: (phase: TransitionPhase) => void;
}

const Ctx = createContext<PageTransitionContextValue>({
  origin: null,
  phase: 'idle',
  setOrigin: () => {},
  setPhase: () => {},
});

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const [origin, setOrigin] = useState<TransitionRect | null>(null);
  const [phase, setPhase] = useState<TransitionPhase>('idle');

  return (
    <Ctx.Provider value={{ origin, phase, setOrigin, setPhase }}>
      {children}
    </Ctx.Provider>
  );
}

export function usePageTransition() {
  return useContext(Ctx);
}
