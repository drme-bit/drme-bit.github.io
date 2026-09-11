'use client';

import { useEffect, useRef } from 'react';
import { useInView } from '@/shared/hooks/useInView';
import useReducedMotion from '@/shared/hooks/useReducedMotion';
import styles from './About.module.scss';

export function CounterStat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const [containerRef, inView] = useInView<HTMLDivElement>({ threshold: 0.4 });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = numRef.current;
    if (!el || !inView) return;

    if (reduced) {
      el.textContent = `${value}${suffix ?? ''}`;
      return;
    }

    const start = performance.now();
    const duration = 1400;
    let raf = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 2);
      el.textContent = `${Math.round(value * eased)}${suffix ?? ''}`;
      if (progress < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, suffix, reduced]);

  return (
    <div ref={containerRef} className={styles['ab-stat']}>
      <span ref={numRef} className={styles['ab-stat-num']}>0</span>
      <span className={styles['ab-stat-label']}>{label}</span>
    </div>
  );
}