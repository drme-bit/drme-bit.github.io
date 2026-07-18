import { useCallback, useRef, useContext, createContext } from 'react';

const SceneContext = createContext(null);

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
}

export function SceneProvider({ children }) {
  const rafRef = useRef(null);
  const targetRef = useRef(1);
  const currentRef = useRef(1);
  const domRef = useRef(null);

  const animate = useCallback(() => {
    const diff = targetRef.current - currentRef.current;
    if (Math.abs(diff) < 0.01) {
      currentRef.current = targetRef.current;
      if (domRef.current) {
        domRef.current.style.opacity = currentRef.current;
        domRef.current.style.visibility = currentRef.current < 0.01 ? 'hidden' : 'visible';
      }
      rafRef.current = null;
      return;
    }
    currentRef.current += diff * 0.12;
    if (domRef.current) {
      domRef.current.style.opacity = currentRef.current;
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

  const setSceneNode = useCallback((node) => {
    domRef.current = node;
  }, []);

  return (
    <SceneContext.Provider value={{ showScene, hideScene, setSceneNode }}>
      {children}
    </SceneContext.Provider>
  );
}
