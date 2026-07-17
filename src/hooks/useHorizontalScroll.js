import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useHorizontalScroll — Converts vertical scroll to horizontal movement.
 * Single rAF loop, DOM-direct updates, throttled state.
 */
export default function useHorizontalScroll({
  itemCount = 1,
} = {}) {
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef(null);
  const animProgress = useRef(0);
  const targetProgress = useRef(0);
  const isDragging = useRef(false);
  const currentIndexRef = useRef(0);
  const rafId = useRef(null);
  const lastClientX = useRef(0);
  const lastReportTime = useRef(0);
  const lastRectTop = useRef(null);
  const lastRectTime = useRef(0);

  const tick = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      rafId.current = requestAnimationFrame(tick);
      return;
    }

    // Throttle getBoundingClientRect — max 15x/sec
    const now = performance.now();
    if (now - lastRectTime.current > 66) {
      const rect = el.getBoundingClientRect();
      lastRectTop.current = rect.top;
      lastRectTime.current = now;

      const windowHeight = window.innerHeight;
      const scrollableHeight = rect.height - windowHeight;
      if (scrollableHeight > 0 && !isDragging.current) {
        const scrolled = -rect.top;
        targetProgress.current = Math.max(0, Math.min(1, scrolled / scrollableHeight));
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
      const rect = el.getBoundingClientRect();
      const scrollTop = window.scrollY + rect.top;
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
        if (window.innerWidth <= 768) return;
        handleDragStart(e.clientX);
      },
      onPointerMove: (e) => {
        if (window.innerWidth <= 768) return;
        handleDragMove(e.clientX);
      },
      onPointerUp: () => {
        if (window.innerWidth <= 768) return;
        handleDragEnd();
      },
      onPointerLeave: () => {
        if (window.innerWidth <= 768) return;
        handleDragEnd();
      },
    },
  };
}
