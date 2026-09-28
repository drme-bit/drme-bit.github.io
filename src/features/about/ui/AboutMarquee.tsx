'use client';

import { TOOLS } from '@/entities/hero';

/* In-flow ticker at the end of About: scrolls away naturally with the page.
   `relative z-50` keeps it above following sections' canvases and sticky
   layers without portals or visibility hacks. */

export function AboutMarquee() {
  return (
    <div
      aria-hidden="true"
      className="relative z-[50] mt-[clamp(2.5rem,5vw,4rem)] w-[100vw] overflow-hidden border-y border-[var(--border)] bg-[var(--bg)] py-6 [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)] [-webkit-mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]"
    >
      <div className="animate-marquee flex w-max will-change-transform hover:[animation-play-state:paused]">
        {[0, 1].map((rep) => (
          <div key={rep} className="flex items-center">
            {TOOLS.map((t, i) => {
              const Icon = t.icon;
              const outlined = i % 2 === 1;
              return (
                <span
                  key={`${t.label}-${i}`}
                  className={`inline-flex items-center gap-3 whitespace-nowrap px-8 font-display text-[clamp(1.1rem,2.4vw,1.7rem)] font-semibold tracking-[var(--tracking-tight)] ${
                    outlined
                      ? 'text-transparent [-webkit-text-stroke:1px_var(--text-dim)]'
                      : 'text-[var(--text)]'
                  }`}
                >
                  <Icon size={22} aria-hidden="true" className={outlined ? '' : 'text-[var(--accent-secondary)]'} />
                  {t.label}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
