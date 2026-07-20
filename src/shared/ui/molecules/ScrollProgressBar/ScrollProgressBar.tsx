'use client';

import { useEffect, useRef } from 'react';
import styles from './ScrollProgressBar.module.scss';

export default function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;
    let rafId: number;
    let lastPct = -1;

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const docH = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        const winH = window.innerHeight;
        const pct = docH > winH ? window.scrollY / (docH - winH) : 0;
        if (pct !== lastPct) {
          lastPct = pct;
          el.style.width = `${pct * 100}%`;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className={styles.scrollProgress}>
      <div ref={fillRef} className={styles.scrollProgressFill} />
    </div>
  );
}
