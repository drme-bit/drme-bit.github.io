'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'motion/react';

/* Awwwards-style link: a floating explainer card chases the cursor while
   hovering. Text first, image second with a caption. Rendered via portal
   into <body> — ancestor transforms (reveals, rails) would otherwise
   hijack `position: fixed`. Fine pointers only. */

const OFFSET_X = 24;
const OFFSET_Y = -190;

export function HoverPreviewLink({
  href,
  preview,
  caption,
  desc,
  children,
}: {
  href: string;
  preview: string;
  caption: string;
  desc: string;
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
        className="inline-flex items-baseline gap-[0.15rem] font-medium text-[var(--accent-secondary)] underline decoration-[color-mix(in_srgb,var(--accent-secondary)_45%,transparent)] underline-offset-4 transition-colors hover:decoration-[var(--accent-secondary)]"
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
        <span className="text-[0.75em]" aria-hidden="true">↗</span>
      </a>
      {finePointer && canPortal && active && createPortal(
        <motion.span
          aria-hidden="true"
          className="pointer-events-none fixed left-0 top-0 z-[80] flex w-[248px] flex-col rounded-[var(--radius-md)] border border-[var(--border-hover)] bg-[var(--bg-elevated)] p-3 shadow-[var(--shadow-lg)] will-change-transform"
          initial={{ opacity: 0, scale: 0.94, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          style={{ x: sx, y: sy }}
        >
          <span className="font-display text-[0.85rem] font-semibold text-foreground">{children}</span>
          <span className="mt-1 text-[0.72rem] leading-[1.55] text-[var(--text-secondary)]">{desc}</span>
          <span className="mt-2.5 block overflow-hidden rounded-[var(--radius-sm)] border border-[var(--border)]">
            <Image src={preview} alt="" width={232} height={146} className="h-auto w-full object-cover" />
          </span>
          <span className="mt-1.5 font-mono text-[0.6rem] tracking-[0.04em] text-[var(--text-ghost)]">{caption}</span>
        </motion.span>,
        document.body,
      )}
    </>
  );
}
