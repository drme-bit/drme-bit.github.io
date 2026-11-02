'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import styles from './ScrollProgressBar.module.scss';

export default function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const valueRef = useRef<HTMLSpanElement | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    const el = fillRef.current;
    if (!el || !lenis) return;

    const handleScroll = ({ progress }: { progress: number }) => {
      const value = Math.round(progress * 100);
      el.style.transform = `scaleX(${progress})`;
      el.parentElement?.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
      if (valueRef.current) valueRef.current.textContent = `${value}%`;
    };

    handleScroll({ progress: lenis.progress });
    lenis.on('scroll', handleScroll);
    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [lenis]);

  return (
    <div className={styles.scrollProgress}>
      <div className={styles.progressLabel}>
        <span>Page progress</span>
        <span ref={valueRef}>0%</span>
      </div>
      <div
        className={styles.track}
        role="progressbar"
        aria-label="Page scroll progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={0}
      >
        <div ref={fillRef} className={styles.scrollProgressFill} />
      </div>
    </div>
  );
}
