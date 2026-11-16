'use client';

import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/*  Shared bento shell: a graphic fills the card and the label sits directly on it,
    over a soft gradient scrim (no panel behind the text).

    `detail` is revealed on hover (lg and up): the text block is anchored to the bottom
    of the card and grows upward over the photo, so the card itself never changes size
    and neighbouring cards never move. Below lg there is no hover, so everything is shown
    and the cards simply stack.  */

/*  Scrim: fades from the page background color at the bottom to transparent at the top,
    so the photo stays visible while the text keeps its contrast in both themes.  */
const SCRIM =
  'bg-[linear-gradient(to_top,color-mix(in_srgb,var(--bg)_97%,transparent)_0%,color-mix(in_srgb,var(--bg)_92%,transparent)_30%,color-mix(in_srgb,var(--bg)_72%,transparent)_58%,color-mix(in_srgb,var(--bg)_28%,transparent)_85%,transparent_100%)]';

/*  Soft halo behind the glyphs instead of a box behind the whole text.  */
const TEXT_SHADOW =
  '[text-shadow:0_1px_2px_color-mix(in_srgb,var(--bg)_70%,transparent),0_0_18px_color-mix(in_srgb,var(--bg)_60%,transparent)]';

export interface BentoCardProps {
  eyebrow: ReactNode;
  title: string;
  description: string;
  /** Longer text revealed on hover. */
  detail?: string;
  graphic?: ReactNode;
  /** Text alternative for the graphic (the graphic itself stays aria-hidden). */
  graphicLabel?: string;
  className?: string;
  emphasis?: boolean;
}

export function BentoCard({
                            eyebrow,
                            title,
                            description,
                            detail,
                            graphic,
                            graphicLabel,
                            className,
                            emphasis = false,
                          }: BentoCardProps) {
  return (
    <article
      className={cn(
        'group relative isolate flex min-h-[240px] flex-col justify-end overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card-bg)]',
        'transition-colors duration-500 hover:border-[var(--border-hover)]',
        className,
      )}
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 transition-transform duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.035]">
          {graphic}
        </div>
        <div className={cn('absolute inset-0', SCRIM)} />
        {/* Extra darkening while the detail is open, so the longer text stays readable. */}
        {detail && (
          <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--bg)_55%,transparent)] opacity-0 transition-opacity duration-500 lg:group-hover:opacity-100" />
        )}
      </div>

      {graphicLabel && <p className="sr-only">{graphicLabel}</p>}

      {detail && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute right-4 top-3 hidden font-mono text-[0.9rem] leading-none text-[var(--text-dim)] transition-transform duration-500 lg:block lg:group-hover:rotate-45',
            TEXT_SHADOW,
          )}
        >
          +
        </span>
      )}

      <div className={cn('relative p-5 sm:p-6 lg:absolute lg:inset-x-0 lg:bottom-0', TEXT_SHADOW)}>
        <p className="m-0 flex items-center gap-1.5 font-mono text-[0.53rem] uppercase tracking-[0.16em] text-[var(--text-dim)]">
          {eyebrow}
        </p>
        <h4
          className={cn(
            'm-0 mt-2 font-display font-medium leading-[1.18] tracking-[var(--tracking-tight)] text-[var(--text)]',
            emphasis ? 'text-[clamp(1.3rem,2.2vw,1.85rem)]' : 'text-[1.08rem]',
          )}
        >
          {title}
        </h4>
        <p
          className={cn(
            'm-0 mt-2 max-w-[48ch] leading-[1.6] text-[var(--text-secondary)]',
            emphasis ? 'text-[0.88rem]' : 'text-[0.8rem]',
          )}
        >
          {description}
        </p>

        {detail && (
          <div className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid-rows-[0fr] lg:opacity-0 lg:group-hover:grid-rows-[1fr] lg:group-hover:opacity-100">
            <div className="min-h-0 overflow-hidden">
              <p
                className={cn(
                  'm-0 max-w-[56ch] pt-3 leading-[1.65] text-[var(--text)]',
                  emphasis ? 'text-[0.86rem]' : 'text-[0.78rem]',
                )}
              >
                {detail}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}