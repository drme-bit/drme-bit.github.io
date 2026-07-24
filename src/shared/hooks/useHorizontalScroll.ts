'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import useIsMobile from './useIsMobile';

interface UseHorizontalScrollOptions {
  itemCount?: number;
  firstItemDelay?: number;
  snapThreshold?: number;
}

interface DragHandlers {
  onPointerDown: (e: React.PointerEvent) => void;
  onPointerMove: (e: React.PointerEvent) => void;
  onPointerUp: () => void;
  onPointerLeave: () => void;
}

interface UseHorizontalScrollResult {
  progress: number;
  currentIndex: number;
  containerRef: React.RefObject<HTMLElement | null>;
  scrollTo: (index: number) => void;
  scrollNext: () => void;
  scrollPrev: () => void;
  handlers: DragHandlers;
}

export default function useHorizontalScroll({
  itemCount = 1,
  firstItemDelay = 0.2,
  snapThreshold = 0.2,
}: UseHorizontalScrollOptions = {}): UseHorizontalScrollResult {
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLElement | null>(null);
  const animProgress = useRef(0);
  const targetProgress = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const currentIndexRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastTime = useRef(0);
  const lastScrollY = useRef(0);

  const scrollEndTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isSnapping = useRef(false);
  const snapTarget = useRef(0);

  const tick = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      rafId.current = requestAnimationFrame(tick);
      return;
    }

    const now = performance.now();
    const dt = lastTime.current ? Math.min((now - lastTime.current) / 16.67, 3) : 1;
    lastTime.current = now;

    if (!isDragging.current && !isSnapping.current) {
      const windowHeight = window.innerHeight;
      const deadZone = windowHeight * firstItemDelay;
      const scrollRange = el.offsetHeight - windowHeight;

      if (scrollRange > 0) {
        const scrolled = window.scrollY - el.offsetTop;
        const effectiveScrolled = Math.max(0, scrolled - deadZone);
        const effectiveRange = Math.max(1, scrollRange - deadZone);
        targetProgress.current = Math.max(0, Math.min(1, effectiveScrolled / effectiveRange));
      }
    }

    if (isSnapping.current) {
      const diff = snapTarget.current - animProgress.current;
      const springForce = diff * 0.1;
      const dampingForce = -velocity.current * 0.7;
      velocity.current += (springForce + dampingForce) * dt;
      animProgress.current += velocity.current * dt;
    } else {
      const diff = targetProgress.current - animProgress.current;
      if (Math.abs(diff) > 0.0005) {
        velocity.current = diff * 0.12 * dt;
        animProgress.current += velocity.current;
      } else {
        animProgress.current = targetProgress.current;
        velocity.current = 0;
      }
    }

    const track = el.querySelector('[data-track]') as HTMLElement | null;
    if (track) {
      const offset = -animProgress.current * (itemCount - 1) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }

    const newIndex = Math.round(animProgress.current * (itemCount - 1));
    const clamped = Math.max(0, Math.min(itemCount - 1, newIndex));
    setCurrentIndex((prev) => {
      if (prev !== clamped) {
        currentIndexRef.current = clamped;
        return clamped;
      }
      return prev;
    });
    setProgress(animProgress.current);

    rafId.current = requestAnimationFrame(tick);
  }, [itemCount, firstItemDelay]);

  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current !== null) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [tick]);

  const getScrollForIndex = useCallback((index: number) => {
    const el = containerRef.current;
    if (!el) return 0;
    const windowHeight = window.innerHeight;
    const deadZone = windowHeight * firstItemDelay;
    const scrollRange = el.offsetHeight - windowHeight;
    const effectiveRange = Math.max(1, scrollRange - deadZone);
    const progressForIndex = index / (itemCount - 1);
    return el.offsetTop + deadZone + progressForIndex * effectiveRange;
  }, [itemCount, firstItemDelay]);

  const snapToNearest = useCallback(() => {
    if (isSnapping.current) return;

    const nearest = Math.round(targetProgress.current * (itemCount - 1));
    const clamped = Math.max(0, Math.min(itemCount - 1, nearest));
    const exactProgress = clamped / (itemCount - 1);

    if (Math.abs(targetProgress.current - exactProgress) < snapThreshold) return;

    const targetScroll = getScrollForIndex(clamped);
    const currentScroll = window.scrollY;
    if (Math.abs(currentScroll - targetScroll) < 30) return;

    isSnapping.current = true;
    snapTarget.current = exactProgress;
    velocity.current = 0;

    window.scrollTo({ top: targetScroll, behavior: 'smooth' });

    setTimeout(() => {
      isSnapping.current = false;
      animProgress.current = exactProgress;
      targetProgress.current = exactProgress;
    }, 500);
  }, [itemCount, getScrollForIndex, snapThreshold]);

  useEffect(() => {
    const onScroll = () => {
      if (isDragging.current || isSnapping.current) return;

      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
      scrollEndTimer.current = setTimeout(() => {
        snapToNearest();
      }, 100);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (scrollEndTimer.current) clearTimeout(scrollEndTimer.current);
    };
  }, [snapToNearest]);

  const scrollTo = useCallback(
    (index: number) => {
      const targetScroll = getScrollForIndex(index);
      window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    },
    [getScrollForIndex],
  );

  const scrollNext = useCallback(() => {
    scrollTo(currentIndexRef.current + 1);
  }, [scrollTo]);

  const scrollPrev = useCallback(() => {
    scrollTo(currentIndexRef.current - 1);
  }, [scrollTo]);

  const handleDragStart = useCallback((clientX: number) => {
    isDragging.current = true;
    lastScrollY.current = window.scrollY;
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    snapToNearest();
  }, [snapToNearest]);

  return {
    progress,
    currentIndex,
    containerRef,
    scrollTo,
    scrollNext,
    scrollPrev,
    handlers: {
      onPointerDown: (e: React.PointerEvent) => {
        if (isMobile) return;
        handleDragStart(e.clientX);
      },
      onPointerMove: (e: React.PointerEvent) => {
        if (isMobile) return;
        handleDragMove(e.clientX);
      },
      onPointerUp: () => {
        if (isMobile) return;
        handleDragEnd();
      },
      onPointerLeave: () => {
        if (isMobile) return;
        handleDragEnd();
      },
    },
  };
}
