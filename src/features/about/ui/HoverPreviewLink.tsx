'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'motion/react';

/* Awwwards-style link: a floating image card chases the cursor while hovering.
   Rendered via portal into <body> — ancestor transforms (reveals, rails)
   would otherwise hijack `position: fixed`. Fine pointers only. */

const OFFSET_X = 24;
const OFFSET_Y = -170;

export function HoverPreviewLink({
  href,
  preview,
  caption,
  children,
}: {
  href: string;
  preview: string;
  caption: string;
  children: React.ReactNode;
}) {
  const [active, setActive] = useState(false);
  const [finePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(any-pointer: fine)').matches,
  );
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 350, damping: 32, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 350, damping: 32, mass: 0.6 });

  const canPortal = typeof document !== 'undefined';

  return (
    <>
      <a
        href={href}
        className="vercel-link inline-flex items-baseline gap-[0.15rem] font-medium text-[var(--text)]"
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={(e) => {
          x.set(e.clientX + OFFSET_X);
          y.set(e.clientY + OFFSET_Y);
        }}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
      >
        <span>{children}</span>
        <span className="vercel-link-arrow text-[0.75em]" aria-hidden="true">↗</span>
      </a>
      {finePointer && canPortal && active && createPortal(
        <motion.span
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[80] flex w-[232px] flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border-hover)] bg-[var(--bg-elevated)] p-2 shadow-[var(--shadow-lg)] will-change-transform"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ x: sx, y: sy }}
        >
          <Image src={preview} alt="" width={232} height={146} className="h-auto w-full rounded-[var(--radius-sm)] object-cover" />
          <span className="px-[0.15rem] pb-[0.1rem] text-[0.62rem] font-medium text-[var(--text-dim)]">{caption}</span>
        </motion.span>,
        document.body,
      )}
    </>
  );
}
