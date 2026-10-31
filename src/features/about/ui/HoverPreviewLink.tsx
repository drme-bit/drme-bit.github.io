'use client';

import { useId, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, useMotionValue, useSpring } from 'motion/react';

const PANEL_WIDTH = 256;
const PANEL_HEIGHT = 232;
const GUTTER = 18;

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
  children: ReactNode;
}) {
  const [active, setActive] = useState(false);
  const [finePointer] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(any-pointer: fine)').matches,
  );
  const tooltipId = useId();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 380, damping: 34, mass: 0.55 });
  const springY = useSpring(y, { stiffness: 380, damping: 34, mass: 0.55 });
  const canPortal = typeof document !== 'undefined';

  const positionCard = (clientX: number, clientY: number) => {
    const left = clientX + PANEL_WIDTH + GUTTER > window.innerWidth
      ? clientX - PANEL_WIDTH - GUTTER
      : clientX + GUTTER;
    const top = clientY + PANEL_HEIGHT + GUTTER > window.innerHeight
      ? Math.max(GUTTER, clientY - PANEL_HEIGHT - GUTTER)
      : clientY + GUTTER;
    x.set(Math.max(GUTTER, left));
    y.set(top);
  };

  const showFromElement = (element: HTMLAnchorElement) => {
    const rect = element.getBoundingClientRect();
    positionCard(rect.left + Math.min(rect.width / 2, 120), rect.bottom);
    setActive(true);
  };

  return (
    <>
      <a
        href={href}
        aria-describedby={active ? tooltipId : undefined}
        className="font-medium text-[var(--text)] underline decoration-[color-mix(in_srgb,var(--text)_30%,transparent)] underline-offset-[3px] transition-colors hover:decoration-[var(--accent-secondary)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)]"
        onMouseEnter={(event) => showFromElement(event.currentTarget)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={(event) => positionCard(event.clientX, event.clientY)}
        onFocus={(event) => showFromElement(event.currentTarget)}
        onBlur={() => setActive(false)}
      >
        {children}
      </a>
      {finePointer && canPortal && active && createPortal(
        <motion.div
          id={tooltipId}
          role="tooltip"
          className="pointer-events-none fixed left-0 top-0 z-[90] w-64 overflow-hidden rounded-lg border border-[var(--border-hover)] bg-[var(--bg-elevated)] p-2.5 shadow-[var(--shadow-lg)]"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
          style={{ x: springX, y: springY }}
        >
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-[var(--card-bg)]">
            <Image
              src={preview}
              alt=""
              fill
              sizes="236px"
              className="object-cover"
            />
          </div>
          <p className="mb-0 mt-2.5 text-[0.82rem] font-medium leading-snug text-[var(--text)]">
            {children}
          </p>
          <p className="mb-0 mt-1 text-[0.7rem] leading-[1.5] text-[var(--text-secondary)]">{desc}</p>
          <p className="mb-0 mt-2 text-[0.62rem] text-[var(--text-ghost)]">{caption}</p>
        </motion.div>,
        document.body,
      )}
    </>
  );
}
