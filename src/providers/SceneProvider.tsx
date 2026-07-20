'use client';

import { useCallback, useRef, useContext, createContext } from 'react';

interface SceneContextType {
  showScene: () => void;
  hideScene: () => void;
  setSceneNode: (node: HTMLElement | null) => void;
}

const SceneContext = createContext<SceneContextType | null>(null);

export function useScene(): SceneContextType {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
}

export function SceneProvider({ children }: { children: React.ReactNode }) {
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(1);
  const currentRef = useRef(1);
  const domRef = useRef<HTMLElement | null>(null);

  const animate = useCallback(() => {
    const diff = targetRef.current - currentRef.current;
    if (Math.abs(diff) < 0.01) {
      currentRef.current = targetRef.current;
      if (domRef.current) {
        domRef.current.style.opacity = String(currentRef.current);
        domRef.current.style.visibility = currentRef.current < 0.01 ? 'hidden' : 'visible';
      }
      rafRef.current = null;
      return;
    }
    currentRef.current += diff * 0.12;
    if (domRef.current) {
      domRef.current.style.opacity = String(currentRef.current);
      domRef.current.style.visibility = currentRef.current < 0.01 ? 'hidden' : 'visible';
    }
    rafRef.current = requestAnimationFrame(animate);
  }, []);

  const showScene = useCallback(() => {
    targetRef.current = 1;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const hideScene = useCallback(() => {
    targetRef.current = 0;
    if (!rafRef.current) rafRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const setSceneNode = useCallback((node: HTMLElement | null) => {
    domRef.current = node;
  }, []);

  return (
    <SceneContext.Provider value={{ showScene, hideScene, setSceneNode }}>
      {children}
    </SceneContext.Provider>
  );
}
