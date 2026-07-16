import { createContext, useContext, useState, useCallback } from 'react';

const TerrainContext = createContext(null);

export function TerrainProvider({ children }) {
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

export function useTerrain() {
  const ctx = useContext(TerrainContext);
  if (!ctx) throw new Error('useTerrain must be used within TerrainProvider');
  return ctx;
}
