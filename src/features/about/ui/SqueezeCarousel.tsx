'use client';

import { useCallback, useState } from 'react';
import Image from 'next/image';
import { HIGHLIGHTS } from './data';

/* Squeeze carousel: siblings compress to slivers, the active panel takes
   the room. Click-driven (no hover-intent fighting), arrows + arrows keys. */

export function SqueezeCarousel() {
  const [active, setActive] = useState(0);
  const total = HIGHLIGHTS.length;

  const go = useCallback(
    (dir: 1 | -1) => setActive((a) => (a + dir + total) % total),
    [total],
  );

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    },
    [go],
  );

  return (
    <div className="mt-5">
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="How I ship"
        onKeyDown={onKeyDown}
        className="flex h-[420px] gap-2 max-md:h-[480px] max-md:flex-col"
      >
        {HIGHLIGHTS.map((h, i) => {
          const Icon = h.icon;
          const selected = i === active;
          return (
            <div
              key={h.title}
              role="button"
              tabIndex={0}
              aria-expanded={selected}
              aria-label={`${h.title}${selected ? ' (current)' : ''}`}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setActive(i);
                }
              }}
              onMouseEnter={() => {
                setActive(i);
              }}
              style={{ flexGrow: selected ? 3.5 : 0.55, flexBasis: 0 }}
              className="relative min-h-0 min-w-0 cursor-pointer overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card-bg)] outline-none transition-[flex-grow,border-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:border-[var(--border-hover)] max-md:!flex-none max-md:data-[open=true]:h-[280px] max-md:data-[open=false]:h-[64px]"
              data-open={selected}
            >
              <Image
                src={h.image}
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                quality={80}
                className={`object-cover object-center transition-[filter,transform,opacity] duration-500 ${
                  selected ? 'scale-100 opacity-100 grayscale-0' : 'scale-[1.06] opacity-70 grayscale'
                }`}
              />
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.05)_40%,rgba(0,0,0,0.72))] transition-opacity duration-500 ${
                  selected ? 'opacity-100' : 'opacity-80'
                }`}
              />
              {/* Squeezed state: vertical label */}
              <div
                aria-hidden="true"
                className={`absolute inset-x-0 bottom-0 flex items-center gap-3 p-2 text-white transition-opacity duration-300 ${
                  selected ? 'pointer-events-none opacity-0' : 'opacity-100'
                }`}
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-white/25 bg-black/45 text-white">
                  <Icon size={15} />
                </span>
                <span className="[writing-mode:vertical-rl] font-display text-[0.8rem] font-semibold uppercase tracking-[0.12em] max-md:[writing-mode:horizontal-tb]">
                  {h.title}
                </span>
              </div>
              {/* Expanded state */}
              <div
                className={`absolute inset-x-0 bottom-0 flex flex-col items-start gap-2 p-5 text-white transition-[opacity,transform] delay-100 duration-400 ${
                  selected ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
                }`}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/45 px-2.5 py-1 font-mono text-[0.6rem] tracking-[0.08em]">
                  0{i + 1} — {h.tags?.[0] ?? 'workflow'}
                </span>
                <h4 className="m-0 font-display text-[clamp(1.2rem,2.4vw,1.7rem)] font-semibold tracking-[var(--tracking-tight)]">
                  {h.title}
                </h4>
                <p className="m-0 max-w-[46ch] text-[0.85rem] leading-[1.6] text-white/85">{h.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
