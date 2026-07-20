'use client';

import { useState, useEffect, useRef } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import useIsMobile from '@/shared/hooks/useIsMobile';
import useReducedMotion from '@/shared/hooks/useReducedMotion';
import styles from './SwipeIndicator.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface SwipeIndicatorProps {
  text?: string;
  autoHideTimeout?: number;
  className?: string;
}

/* ─── SwipeIndicator ─────────────────────────────────────── */

export default function SwipeIndicator({
  text = 'Swipe to explore',
  autoHideTimeout = 5000,
  className = '',
}: SwipeIndicatorProps) {
  const [visible, setVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isMobile && !prefersReducedMotion && window.scrollY <= 100) {
      setVisible(true);
    }
  }, [isMobile, prefersReducedMotion]);

  useEffect(() => {
    if (!visible || hasInteracted) return;

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, autoHideTimeout);

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setHasInteracted(true);
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [visible, hasInteracted, autoHideTimeout]);

  if (!visible) return null;

  return (
    <div className={`${styles['swipe-indicator']} ${className}`} role="presentation" aria-hidden="true">
      <FiChevronDown className={styles['swipe-indicator-icon']} />
      <span className={styles['swipe-indicator-text']}>{text}</span>
    </div>
  );
}
