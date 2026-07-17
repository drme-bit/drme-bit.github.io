import { useState, useCallback, useRef, useContext, createContext } from 'react';

const SceneContext = createContext(null);

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
}

export function SceneProvider({ children }) {
  const [sceneOpacity, setSceneOpacity] = useState(1);
  const rafRef = useRef(null);
  const targetRef = useRef(1);
  const currentRef = useRef(1);

  const animate = useCallback(() => {
    const diff = targetRef.current - currentRef.current;
    if (Math.abs(diff) < 0.01) {
      currentRef.current = targetRef.current;
      setSceneOpacity(targetRef.current);
      rafRef.current = null;
      return;
    }
    currentRef.current += diff * 0.12;
    setSceneOpacity(currentRef.current);
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

  return (
    <SceneContext.Provider value={{ sceneOpacity, showScene, hideScene }}>
      {children}
    </SceneContext.Provider>
  );
}
