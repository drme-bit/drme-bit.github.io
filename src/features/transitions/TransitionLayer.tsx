'use client';

import { useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { usePageTransition } from './PageTransitionContext';

export function TransitionLayer() {
  const layerRef = useRef<HTMLDivElement>(null);
  const animating = useRef(false);
  const pathname = usePathname();
  const { origin, phase, setPhase } = usePageTransition();

  useEffect(() => {
    const el = layerRef.current;
    if (!el || animating.current) return;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    if (phase === 'closing' && origin) {
      const inset = `inset(${origin.y}px ${vw - origin.x - origin.width}px ${vh - origin.y - origin.height}px ${origin.x}px)`;

      animating.current = true;
      gsap.set(el, { display: 'block', clipPath: 'inset(0)' });
      gsap.to(el, {
        clipPath: inset,
        duration: 0.5,
        ease: 'power3.in',
        onComplete: () => {
          animating.current = false;
          setPhase('opening');
        },
      });
    } else if (phase === 'opening') {
      const cx = vw / 2;
      const cy = vh / 2;
      const r = Math.hypot(cx, cy);
      const inset = `inset(${cy - r}px ${vw - cx - r}px ${vh - cy - r}px ${cx - r}px)`;

      animating.current = true;
      gsap.set(el, { display: 'block', clipPath: inset });
      gsap.to(el, {
        clipPath: 'inset(0)',
        duration: 0.6,
        ease: 'power3.out',
        onComplete: () => {
          gsap.set(el, { display: 'none' });
          animating.current = false;
          setPhase('idle');
        },
      });
    }
  }, [pathname, phase, origin, setPhase]);

  return (
    <div
      ref={layerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'var(--bg)',
        pointerEvents: 'none',
        display: 'none',
      }}
    />
  );
}
