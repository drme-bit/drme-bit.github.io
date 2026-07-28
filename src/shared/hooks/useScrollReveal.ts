'use client';

import { useRef, type RefObject } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealOptions {
  /** Animation start position (ScrollTrigger start). Default: 'top 80%' */
  start?: string;
  /** Toggle actions. Default: 'play none none reverse' */
  toggleActions?: string;
  /** Animation duration in seconds. Default: 0.7 */
  duration?: number;
  /** Animation ease. Default: 'power2.out' */
  ease?: string;
  /** Y offset. Default: 30 */
  y?: number;
  /** X offset. Default: 0 */
  x?: number;
  /** Initial scale. Default: undefined (no scale) */
  scale?: number;
  /** Stagger delay between elements. Default: 0 */
  stagger?: number;
  /** Delay before animation starts. Default: 0 */
  delay?: number;
  /** CSS selector for child elements to animate. If provided, animates children instead of ref */
  children?: string;
}

/**
 * Scroll-triggered reveal animation using GSAP ScrollTrigger.
 * Animates element from hidden to visible on scroll.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ref = useRef(null);
 *   useScrollReveal(ref);
 *   return <section ref={ref}>...</section>;
 * }
 * ```
 *
 * @example With children stagger
 * ```tsx
 * useScrollReveal(ref, { children: '.card', stagger: 0.1 });
 * ```
 */
export function useScrollReveal<T extends HTMLElement = HTMLElement>(
  options?: ScrollRevealOptions,
): RefObject<T | null> {
  const ref = useRef<T>(null);

  const {
    start = 'top 80%',
    toggleActions = 'play none none reverse',
    duration = 0.7,
    ease = 'power2.out',
    y = 30,
    x = 0,
    scale,
    stagger = 0,
    delay = 0,
    children,
  } = options || {};

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;

      const targets = children ? el.querySelectorAll(children) : el;

      const from: gsap.TweenVars = { opacity: 0, duration, ease, delay };
      if (y) from.y = y;
      if (x) from.x = x;
      if (scale !== undefined) from.scale = scale;

      const to: gsap.TweenVars = {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        duration,
        ease,
        delay,
        stagger,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions,
        },
      };

      gsap.fromTo(targets, from, to);
    },
    { scope: ref },
  );

  return ref;
}
