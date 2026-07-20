'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './RevealSection.module.scss';

interface RevealSectionProps {
  children: React.ReactNode;
  delay?: number;
  threshold?: number;
}

export default function RevealSection({ children, delay = 0, threshold = 0.1 }: RevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);

  return (
    <div
      ref={ref}
      className={`${styles['reveal-section']}${visible ? ` ${styles['is-visible']}` : ''}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}