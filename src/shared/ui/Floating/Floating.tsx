'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';
import { useAnimationFrame } from 'motion/react';
import { cn } from '@/shared/lib/cn';
import { useMousePositionRef } from '@/shared/hooks/useMousePositionRef';

interface FloatingContextType {
  registerElement: (id: string, element: HTMLDivElement, depth: number) => void;
  unregisterElement: (id: string) => void;
}

const FloatingContext = createContext<FloatingContextType | null>(null);

interface FloatingProps {
  children: ReactNode;
  className?: string;
  sensitivity?: number;
  easingFactor?: number;
}

export function Floating({
  children,
  className,
  sensitivity = 1,
  easingFactor = 0.05,
  ...props
}: FloatingProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const elementsMap = useRef(
    new Map<
      string,
      {
        element: HTMLDivElement;
        depth: number;
        currentPosition: { x: number; y: number };
      }
    >(),
  );
  const mousePositionRef = useMousePositionRef(containerRef);

  const registerElement = useCallback(
    (id: string, element: HTMLDivElement, depth: number) => {
      elementsMap.current.set(id, {
        element,
        depth,
        currentPosition: { x: 0, y: 0 },
      });
    },
    [],
  );

  const unregisterElement = useCallback((id: string) => {
    elementsMap.current.delete(id);
  }, []);

  const contextValue = useMemo(
    () => ({ registerElement, unregisterElement }),
    [registerElement, unregisterElement],
  );

  // Single shared loop: eased translate3d per registered element.
  // Skips settled elements so idle costs nothing.
  useAnimationFrame(() => {
    if (!containerRef.current) return;

    elementsMap.current.forEach((data) => {
      const strength = (data.depth * sensitivity) / 20;

      const newTargetX = mousePositionRef.current.x * strength;
      const newTargetY = mousePositionRef.current.y * strength;

      const dx = newTargetX - data.currentPosition.x;
      const dy = newTargetY - data.currentPosition.y;
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) return;

      data.currentPosition.x += dx * easingFactor;
      data.currentPosition.y += dy * easingFactor;

      data.element.style.transform = `translate3d(${data.currentPosition.x}px, ${data.currentPosition.y}px, 0)`;
    });
  });

  return (
    <FloatingContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn('absolute top-0 left-0 w-full h-full', className)}
        {...props}
      >
        {children}
      </div>
    </FloatingContext.Provider>
  );
}

export default Floating;

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  depth?: number;
}

export function FloatingElement({ children, className, depth = 1 }: FloatingElementProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const id = useId().replace(/[^a-zA-Z0-9]/g, '');
  const context = useContext(FloatingContext);

  useEffect(() => {
    if (!elementRef.current || !context) return;

    context.registerElement(id, elementRef.current, depth ?? 0.01);
    return () => context.unregisterElement(id);
  }, [context, depth, id]);

  return (
    <div ref={elementRef} className={cn('absolute will-change-transform', className)}>
      {children}
    </div>
  );
}
