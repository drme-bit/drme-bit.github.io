'use client';

import { useState, useCallback, useRef } from 'react';
import useReducedMotion from '@/shared/hooks/useReducedMotion';
import styles from './TapRipple.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface Ripple {
  x: number;
  y: number;
  color: string;
  key: number;
}

interface TapRippleProps {
  children: React.ReactNode;
  color?: string;
  duration?: number;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  [key: string]: unknown;
}

/* ─── TapRipple ──────────────────────────────────────────── */

export default function TapRipple({
  children,
  color = 'rgba(232, 228, 223, 0.15)',
  duration = 600,
  className = '',
  onClick,
  ...props
}: TapRippleProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  const createRipple = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      if (prefersReducedMotion) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const clientX = 'clientX' in e ? e.clientX : e.touches?.[0]?.clientX || 0;
      const clientY = 'clientY' in e ? e.clientY : e.touches?.[0]?.clientY || 0;
      const x = clientX - rect.left;
      const y = clientY - rect.top;

      const newRipple: Ripple = {
        x,
        y,
        color,
        key: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
      }, duration);
    },
    [color, duration, prefersReducedMotion]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      createRipple(e);
      if (onClick) onClick(e);
    },
    [createRipple, onClick]
  );

  return (
    <div
      ref={containerRef}
      className={`${styles.tapRippleContainer} ${className}`}
      onClick={handleClick}
      onTouchEnd={createRipple}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          className={styles.tapRipple}
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: ripple.color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
