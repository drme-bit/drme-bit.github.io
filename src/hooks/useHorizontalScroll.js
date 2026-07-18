import { useState, useEffect, useCallback, useRef } from 'react';
import useIsMobile from './useIsMobile';

/**
 * useHorizontalScroll — Converts vertical scroll to horizontal movement.
 * Uses offsetTop + scrollY (works correctly with position: sticky).
 * Single rAF loop, DOM-direct updates, throttled state.
 */
export default function useHorizontalScroll({
  itemCount = 1,
} = {}) {
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isMobile = useIsMobile();

  const containerRef = useRef(null);
  const animProgress = useRef(0);
  const targetProgress = useRef(0);
  const isDragging = useRef(false);
  const currentIndexRef = useRef(0);
  const rafId = useRef(null);
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
      const scrollRange = el.offsetHeight - windowHeight;
      if (scrollRange > 0) {
        const scrolled = window.scrollY - el.offsetTop;
        targetProgress.current = Math.max(0, Math.min(1, scrolled / scrollRange));
      }
    }

    // Smooth interpolation
    const diff = targetProgress.current - animProgress.current;
    if (Math.abs(diff) > 0.0001) {
      animProgress.current += diff * 0.12;
    } else {
      animProgress.current = targetProgress.current;
    }

    // Update DOM directly
    const track = el.querySelector('.projects-track');
    if (track) {
      const offset = -animProgress.current * (itemCount - 1) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }

    // Throttle React state updates — max 20x/sec
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
  }, [itemCount]);

  // Single rAF loop — cleanup cancels it properly
  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
    };
  }, [tick]);

  // Scroll to index — smooth vertical scroll
  const scrollTo = useCallback(
    (index) => {
      const el = containerRef.current;
      if (!el) return;
      const clamped = Math.max(0, Math.min(itemCount - 1, index));
      const scrollTop = window.scrollY + el.offsetTop;
      const targetScrollTop = scrollTop + clamped * window.innerHeight;
      window.scrollTo({ top: targetScrollTop, behavior: 'smooth' });
    },
    [itemCount]
  );

  const scrollNext = useCallback(() => {
    scrollTo(currentIndexRef.current + 1);
  }, [scrollTo]);

  const scrollPrev = useCallback(() => {
    scrollTo(currentIndexRef.current - 1);
  }, [scrollTo]);

  // Drag handlers
  const handleDragStart = useCallback((clientX) => {
    isDragging.current = true;
    lastClientX.current = clientX;
  }, []);

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging.current) return;
    const delta = clientX - lastClientX.current;
    lastClientX.current = clientX;

    const containerWidth = containerRef.current?.offsetWidth || 1;
    const progressDelta = -delta / containerWidth;
    targetProgress.current = Math.max(
      0,
      Math.min(1, targetProgress.current + progressDelta)
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
      onPointerDown: (e) => {
        if (isMobile) return;
        handleDragStart(e.clientX);
      },
      onPointerMove: (e) => {
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
