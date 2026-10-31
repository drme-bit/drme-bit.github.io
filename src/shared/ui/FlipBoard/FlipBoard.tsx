'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/shared/lib/cn';

/* Split-flap board (aceternity-style flipping text): each word flips in
   character by character with a rotateX flap. Reduced-motion safe. */

export function FlipBoard({
  words,
  interval = 2600,
  className,
}: {
  words: string[];
  interval?: number;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (words.length < 2) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;
    const t = setInterval(() => {
      setFlipping(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setFlipping(false);
      }, 180);
    }, interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  const word = words[index] ?? '';

  return (
    <span
      className={cn('will-change-auto inline-flex items-baseline', className)}
      aria-live="polite"
    >
      <span className="mr-2 select-none text-[var(--terminal-prompt-arrow)]">&gt;</span>
      <span className="will-change-auto inline-flex overflow-hidden">
        {word.split('').map((ch, i) => (
          <span
            key={`${index}-${i}`}
            className={cn(
              'will-change-auto inline-block will-change-transform',
              flipping ? 'animate-flip-out' : 'animate-flip-in',
            )}
            style={{ animationDelay: `${i * 18}ms` }}
          >
            {ch === ' ' ? ' ' : ch}
          </span>
        ))}
      </span>
      <span className="ml-0.5 inline-block h-[1em] w-[2px] animate-pulse bg-[var(--accent-secondary)]" />
    </span>
  );
}
