'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';

interface UseInViewOptions {
  /** Fraction of element visibility required. Default: 0.15 */
  threshold?: number;
  /** Only reveal once (unobserve after first intersection). Default: true */
  once?: boolean;
  /** Root margin passed to IntersectionObserver, e.g. '-80px 0px 0px 0px'. Default: undefined */
  rootMargin?: string;
}

/**
 * Pure-CSS reveal helper: toggles a boolean when the element scrolls
 * into view, using IntersectionObserver (no GSAP).
 *
 * @example
 * ```tsx
 * function Section() {
 *   const ref = useInView<HTMLDivElement>();
 *   return <div ref={ref} className={isVisible ? 'is-visible' : ''}>...</div>;
 * }
 * ```
 */
export function useInView<T extends HTMLElement = HTMLElement>(
  options?: UseInViewOptions,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  const { threshold = 0.15, once = true, rootMargin } = options || {};

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setInView(true);
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once, rootMargin]);

  return [ref, inView];
}