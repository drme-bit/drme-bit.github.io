'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { FiArrowUpRight } from '@/shared/ui/Icon';
import styles from './Cursor.module.scss';

/* Morphing cursor: dot by default, arrow ring over links and buttons,
   labeled bubble over [data-cursor="view"] zones, out of the way in inputs.
   Two motion values drive everything — zero React renders per frame. */

type Variant = 'default' | 'link' | 'view' | 'text';

export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [variant, setVariant] = useState<Variant>('default');
  const [label, setLabel] = useState('');
  const [pressed, setPressed] = useState(false);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.7 });
  const ringY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.7 });

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || calm) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydration gate: SSR renders null, cursor mounts only on client
    setEnabled(true);

    const move = (e: MouseEvent): void => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent): void => {
      const el = e.target instanceof HTMLElement ? e.target : null;
      const marked = el?.closest('[data-cursor]') as HTMLElement | null;
      if (marked) {
        setVariant(marked.dataset.cursor === 'view' ? 'view' : 'link');
        setLabel(marked.dataset.cursorLabel ?? '');
        return;
      }
      if (!el) {
        setVariant('default');
        setLabel('');
        return;
      }
      if (
        el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.tagName === 'SELECT' ||
        el.isContentEditable
      ) {
        setVariant('text');
        setLabel('');
      } else if (
        el.tagName === 'A' ||
        el.tagName === 'BUTTON' ||
        !!el.closest('a, button, [role="button"]')
      ) {
        setVariant('link');
        setLabel('');
      } else {
        setVariant('default');
        setLabel('');
      }
    };
    const down = (): void => setPressed(true);
    const up = (): void => setPressed(false);

    document.body.classList.add('custom-cursor-active');
    window.addEventListener('mousemove', move, { passive: true });
    window.addEventListener('mouseover', over, { passive: true });
    window.addEventListener('mousedown', down);
    window.addEventListener('mouseup', up);
    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseover', over);
      window.removeEventListener('mousedown', down);
      window.removeEventListener('mouseup', up);
    };
  }, [x, y]);

  if (!enabled) return null;

  const showArrow = variant !== 'text';
  const showBeam = variant === 'text';

  return (
    <div className={styles.cursorContainer} aria-hidden="true">
      {showArrow && (
        <motion.div
          className={styles.cursorArrow}
          style={{ x, y }}
          animate={{ scale: pressed ? 0.85 : 1 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6.5 3.8 19 11.7l-6.6 1-2.8 6.8Z"
              fill="#fff"
              stroke="rgba(0,0,0,0.65)"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      )}
      {showBeam && <motion.div className={styles.cursorBeam} style={{ x, y }} />}
      <motion.div
        className={`${styles.cursorRing}${variant === 'link' ? ` ${styles.isHovering}` : ''}${pressed ? ` ${styles.isPressed}` : ''}`}
        style={{ x: ringX, y: ringY }}
      >
        {variant === 'link' && <FiArrowUpRight size={15} aria-hidden="true" />}
      </motion.div>
      {variant === 'view' && (
        <motion.div
          className={styles.cursorView}
          style={{ x, y }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: pressed ? 0.85 : 1, opacity: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          {label || 'view'}
        </motion.div>
      )}
    </div>
  );
}
