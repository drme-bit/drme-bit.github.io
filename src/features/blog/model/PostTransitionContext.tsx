'use client';

import { createContext, useContext, useState, useCallback, useRef } from 'react';

export interface TransitionRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PostTransitionContextValue {
  transitionFrom: TransitionRect | null;
  setTransitionFrom: (rect: TransitionRect | null) => void;
}

const PostTransitionContext = createContext<PostTransitionContextValue>({
  transitionFrom: null,
  setTransitionFrom: () => {},
});

export function PostTransitionProvider({ children }: { children: React.ReactNode }) {
  const [transitionFrom, setTransitionFromState] = useState<TransitionRect | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  const setTransitionFrom = useCallback((rect: TransitionRect | null) => {
    setTransitionFromState(rect);

    if (rect !== null) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setTransitionFromState(null), 1000);
    }
  }, []);

  return (
    <PostTransitionContext.Provider value={{ transitionFrom, setTransitionFrom }}>
      {children}
    </PostTransitionContext.Provider>
  );
}

export function usePostTransition() {
  return useContext(PostTransitionContext);
}
