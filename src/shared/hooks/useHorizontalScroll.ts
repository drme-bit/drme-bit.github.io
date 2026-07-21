'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import useIsMobile from './useIsMobile';

interface UseHorizontalScrollOptions {
  itemCount?: number;
  snapThreshold?: number;
  /** Fraction of viewport height to wait before carousel starts moving (0–1) */
  firstItemDelay?: number;
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
  firstItemDelay = 0,
}: UseHorizontalScrollOptions = {}): UseHorizontalScrollResult {
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  const containerRef = useRef<HTMLElement | null>(null);
  const animProgress = useRef(0);
  const targetProgress = useRef(0);
  const isDragging = useRef(false);
  const currentIndexRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const lastClientX = useRef(0);
  const lastReportTime = useRef(0);

  const tick = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      rafId.current = requestAnimationFrame(tick);
      return;
    }

    if (!isDragging.current) {
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

    const diff = targetProgress.current - animProgress.current;
    if (Math.abs(diff) > 0.0001) {
      animProgress.current += diff * 0.12;
    } else {
      animProgress.current = targetProgress.current;
    }

    const track = el.querySelector('[data-track]') as HTMLElement | null;
    if (track) {
      const offset = -animProgress.current * (itemCount - 1) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }

    const now = performance.now();
    if (now - lastReportTime.current > 50) {
      lastReportTime.current = now;
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
    }

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

  const scrollTo = useCallback(
    (index: number) => {
      const el = containerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, index));
      const scrollTop = window.scrollY + el.offsetTop;
      const targetScrollTop = scrollTop + clamped * window.innerHeight;
      window.scrollTo({ top: targetScrollTop, behavior: 'instant' });
    },
    [itemCount],
  );

  const scrollNext = useCallback(() => {
    scrollTo(currentIndexRef.current + 1);
  }, [scrollTo]);

  const scrollPrev = useCallback(() => {
    scrollTo(currentIndexRef.current - 1);
  }, [scrollTo]);

  const handleDragStart = useCallback((clientX: number) => {
    isDragging.current = true;
    lastClientX.current = clientX;
  }, []);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const delta = clientX - lastClientX.current;
    lastClientX.current = clientX;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const progressDelta = -delta / containerWidth;
    targetProgress.current = Math.max(
      0,
      Math.min(1, targetProgress.current + progressDelta),
    );
    animProgress.current = targetProgress.current;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    const nearest = Math.round(targetProgress.current * (itemCount - 1));
    const clamped = Math.max(0, Math.min(itemCount - 1, nearest));
    targetProgress.current = clamped / (itemCount - 1);
  }, [itemCount]);

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
