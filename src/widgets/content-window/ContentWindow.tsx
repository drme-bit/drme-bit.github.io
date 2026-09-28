import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type WindowTone = 'quiet' | 'raised';
export type WindowMotion = 'none' | 'slide-right';

interface ContentWindowProps {
  id: string;
  /** Visual priority: quiet surfaces blend in, raised ones grab attention. */
  tone?: WindowTone;
  /** Who owns the open/close animation. 'none' = always visible, no motion. */
  motion?: WindowMotion;
  open?: boolean;
  as?: 'div' | 'section';
  label?: string;
  className?: string;
  children: ReactNode;
}

const TONE: Record<WindowTone, string> = {
  // Main page surface: full-bleed, barely-there hairlines. Same bg as the
  // page cards so rhythm gaps never read as strips.
  quiet: 'border-y border-white/[0.07] bg-[var(--bg)]',
  // Priority surface: floating card with a stronger frame.
  raised:
    'rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-[var(--shadow-lg)] ring-1 ring-black/40',
};

const MOTION: Record<WindowMotion, string> = {
  none: '',
  'slide-right':
    'transition-[translate,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform',
};

/*  Window frame for all app surfaces. Owns frame styling (tone) and the
    open/close motion, so every window — page, chat, future ones — moves
    and looks the same way.  */

export default function ContentWindow({
  id,
  tone = 'quiet',
  motion = 'none',
  open = true,
  as = 'div',
  label,
  className,
  children,
}: ContentWindowProps) {
  const Tag = as;
  const animated = motion !== 'none';
  const hidden = animated && !open;

  return (
    <Tag
      id={id}
      data-window={id}
      data-tone={tone}
      aria-label={label}
      aria-hidden={animated ? !open : undefined}
      inert={animated && !open}
      className={cn(
        TONE[tone],
        MOTION[motion],
        animated && (hidden
          ? 'pointer-events-none translate-x-[calc(100%+24px)] opacity-0'
          : 'translate-x-0 opacity-100'),
        className,
      )}
    >
      {children}
    </Tag>
  );
}
