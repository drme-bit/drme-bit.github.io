import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useHorizontalScroll — Converts vertical scroll to horizontal movement.
 * Uses refs for animation state to avoid per-frame React re-renders.
 */
export default function useHorizontalScroll({
  itemCount = 1,
  snapThreshold = 0.1,
} = {}) {
  const [progress, setProgress] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const containerRef = useRef(null);
  const animProgress = useRef(0);
  const targetProgress = useRef(0);
  const isSnapping = useRef(false);
  const rafId = useRef(null);
  const velocity = useRef(0);
  const lastClientX = useRef(0);
  const isDragging = useRef(false);
  const currentIndexRef = useRef(0);

  // Smooth animation loop — updates DOM directly via transform, only snaps to state
  const tick = useCallback(() => {
    const el = containerRef.current;
    if (!el) {
      rafId.current = requestAnimationFrame(tick);
      return;
    }

    // Read scroll position
    const rect = el.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const scrollableHeight = rect.height - windowHeight;

    if (scrollableHeight > 0 && !isDragging.current) {
      const scrolled = -rect.top;
      const rawProgress = Math.max(0, Math.min(1, scrolled / scrollableHeight));
      targetProgress.current = rawProgress;
    }

    // Smooth interpolation towards target
    const diff = targetProgress.current - animProgress.current;
    if (Math.abs(diff) > 0.0001) {
      animProgress.current += diff * 0.12;
    } else {
      animProgress.current = targetProgress.current;
    }

    // Update DOM directly — no React state update
    const track = el.querySelector('.projects-track');
    if (track) {
      const offset = -animProgress.current * (itemCount - 1) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }

    // Only update React state when snapping to a new index (avoid 60fps re-renders)
    const newIndex = Math.round(animProgress.current * (itemCount - 1));
    const clamped = Math.max(0, Math.min(itemCount - 1, newIndex));
    setCurrentIndex((prev) => {
      if (prev !== clamped) {
        currentIndexRef.current = clamped;
        return clamped;
      }
      return prev;
    });

    rafId.current = requestAnimationFrame(tick);
  }, [itemCount]);

  // Start animation loop
  useEffect(() => {
    rafId.current = requestAnimationFrame(tick);
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [tick]);

  // Expose progress for React rendering (update less frequently)
  useEffect(() => {
    let lastReported = 0;
    const report = () => {
      const p = animProgress.current;
      if (Math.abs(p - lastReported) > 0.005) {
        lastReported = p;
        setProgress(p);
      }
      if (rafId.current) requestAnimationFrame(report);
    };
    const id = requestAnimationFrame(report);
    return () => cancelAnimationFrame(id);
  }, []);

  // Snap to a specific index — scroll container vertically to match
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
    velocity.current = 0;
  }, []);

  const handleDragMove = useCallback((clientX) => {
    if (!isDragging.current) return;
    const delta = clientX - lastClientX.current;
    velocity.current = delta;
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
    // Snap to nearest index
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
