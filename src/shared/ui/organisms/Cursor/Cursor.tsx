'use client';

import { useEffect, useRef, useState } from 'react';
import CursorAnimator from './CursorAnimator';
import styles from './Cursor.module.scss';

const TRAIL_LENGTH = 5;
const animator = new CursorAnimator();

export default function Cursor() {
  const ringRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(true);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsMobile(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    animator.setElements(ringRef.current, dotRef.current, trailRefs.current);
    animator.start();
    return () => animator.stop();
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div className={styles.cursorContainer} aria-hidden="true">
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => { trailRefs.current[i] = el; }}
          className={`${styles.cursorTrail} ${styles[`cursorTrail${i}`]}`}
          style={{ opacity: 1 - (i / TRAIL_LENGTH) }}
        />
      ))}
      <div ref={ringRef} className={styles.cursorRing} />
      <div ref={dotRef} className={styles.cursorDot} />
    </div>
  );
}
