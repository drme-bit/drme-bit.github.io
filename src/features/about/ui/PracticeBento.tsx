'use client';

import Image from 'next/image';
import { BentoCard } from './BentoCard';
import { HIGHLIGHTS } from './data';

/*  Working habits as a story, one step of the loop per card (order comes from HIGHLIGHTS):
    Plan → Design → Build → Ship → Measure → Fix.

    Layout (lg, 6 cards): a tall lead card (01) with two stacked companions (02, 03),
    then a row of three (04, 05, 06). With a different number of cards the last row
    may be incomplete, so keep it at 6 (or 3 / 5 + lead).

    The screenshot is decorative inside the card (aria-hidden); its description is
    exposed once through `graphicLabel` instead.  */

export function PracticeBento() {
  return (
    <div className="flex flex-col gap-4">
      <p
        aria-hidden="true"
        className="m-0 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--text-dim)]"
      >
        {HIGHLIGHTS.map((highlight, index) => (
          <span key={highlight.title} className="inline-flex items-center gap-2">
            {highlight.eyebrow}
            {index < HIGHLIGHTS.length - 1 && <span className="text-[var(--text-ghost)]">→</span>}
          </span>
        ))}
      </p>

      <div className="grid gap-3 lg:grid-cols-6">
        {HIGHLIGHTS.map((highlight, index) => {
          const Icon = highlight.icon;
          const lead = index === 0;
          const step = String(index + 1).padStart(2, '0');
          return (
            <BentoCard
              key={highlight.title}
              emphasis={lead}
              className={
                lead ? 'min-h-[420px] lg:col-span-4 lg:row-span-2' : 'min-h-[300px] lg:col-span-2'
              }
              eyebrow={
                <>
                  <span className="text-[var(--text)]">{step}</span>
                  <span aria-hidden="true">·</span>
                  <Icon size={11} aria-hidden="true" />
                  {highlight.eyebrow}
                </>
              }
              title={highlight.title}
              description={highlight.desc}
              detail={highlight.detail}
              graphicLabel={highlight.imageAlt}
              graphic={
                <Image
                  src={highlight.image}
                  alt=""
                  fill
                  sizes={
                    lead ? '(max-width: 1024px) 100vw, 760px' : '(max-width: 1024px) 100vw, 380px'
                  }
                  quality={80}
                  className="object-cover"
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
}
