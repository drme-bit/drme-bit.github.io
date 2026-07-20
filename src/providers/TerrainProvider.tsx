'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface TerrainContextType {
  paused: boolean;
  setPaused: (v: boolean) => void;
  speed: number;
  setSpeed: (v: number) => void;
  amplitude: number;
  setAmplitude: (v: number) => void;
  togglePause: () => void;
  reset: () => void;
}

const TerrainContext = createContext<TerrainContextType | null>(null);

export function TerrainProvider({ children }: { children: React.ReactNode }) {
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [amplitude, setAmplitude] = useState(1);

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const reset = useCallback(() => {
    setPaused(false);
    setSpeed(1);
    setAmplitude(1);
  }, []);

  return (
    <TerrainContext.Provider
      value={{ paused, setPaused, speed, setSpeed, amplitude, setAmplitude, togglePause, reset }}
    >
      {children}
    </TerrainContext.Provider>
  );
}

export function useTerrain(): TerrainContextType {
  const ctx = useContext(TerrainContext);
  if (!ctx) throw new Error('useTerrain must be used within TerrainProvider');
  return ctx;
}
