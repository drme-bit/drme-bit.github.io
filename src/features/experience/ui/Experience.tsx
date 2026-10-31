'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Timeline } from '@/components/ui/timeline';
import { Check } from '@/shared/ui/Icon';
import { experienceData } from '@/entities/experience';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';

/*  Experience section — shadcn-style Timeline (components/ui) fed by
    experienceData, plus a sticky times rail on the right.  */

const pad = (n: number) => String(n).padStart(2, '0');

export default function Experience() {
  const [activeI, setActiveI] = useState(0);

  useEffect(() => {
    const rows = experienceData
      .map((_, i) => document.getElementById(`timeline-entry-${i}`))
      .filter((el): el is HTMLElement => el !== null);
    if (rows.length === 0) return;

    const io = new IntersectionObserver(
      (list) => {
        list.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.id.replace('timeline-entry-', ''));
            if (Number.isFinite(idx)) setActiveI(idx);
          }
        });
      },
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 },
    );
    rows.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="experience"
      className="relative isolate flex flex-col pb-16 pt-12 max-[700px]:pb-12 max-[700px]:pt-8"
    >
      <div className="relative mx-auto grid w-full max-w-[1800px] grid-cols-[minmax(0,1fr)_160px] gap-x-6 pl-[9vw] pr-[3vw] max-[1100px]:grid-cols-1 max-[1100px]:px-5">
        <div className="min-w-0">
          <Timeline
            data={experienceData.map((e) => ({
              title: e.period,
            content: (
              <article className="grid grid-cols-1 gap-5 rounded-lg bg-transparent p-3 sm:gap-6 sm:p-4 md:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] md:gap-8 md:p-7">
                <div className="min-w-0">
                  <p className="mb-1 text-[15px] font-semibold text-[var(--text)] md:text-base">
                    {e.role}
                  </p>
                  <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--text-dim)]">
                    {e.org}
                  </p>
                  <p className="mb-6 max-w-[62ch] text-[13px] font-normal leading-[1.75] text-[var(--text-secondary)] md:text-sm">
                    {e.desc}
                  </p>
                  {e.highlights && e.highlights.length > 0 && (
                    <ul className="m-0 mb-6 flex list-none flex-col gap-2 p-0">
                      {e.highlights.map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2.5 text-[13px] leading-[1.6] text-[var(--text-secondary)] md:text-sm"
                        >
                          <Check
                            size={14}
                            aria-hidden="true"
                            className="mt-0.5 shrink-0 text-[var(--accent-secondary)]"
                          />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {e.tech && e.tech.length > 0 && (
                    <div className="mb-6 flex flex-wrap gap-1.5">
                      {e.tech.map((t) => (
                        <span
                          key={t}
                          className="rounded-md border border-[var(--border)] bg-[var(--bg)] px-2 py-0.5 font-mono text-[11px] text-[var(--text-dim)]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {e.link && (
                    <a
                      href={e.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-[var(--text)] underline decoration-[var(--border-hover)] underline-offset-4 transition-colors hover:decoration-[var(--text)] md:text-sm"
                    >
                      {e.linkText ?? 'view project'} →
                    </a>
                  )}
                </div>
                {e.gallery && e.gallery.length > 0 && (
                  <div className="grid grid-cols-2 content-start gap-2 md:gap-2.5">
                    {e.gallery.map((g, i) => (
                      <Image
                        key={g.src}
                        src={g.src}
                        alt={g.alt}
                        width={700}
                        height={500}
                        sizes="(max-width: 768px) 44vw, 24vw"
                        loading="lazy"
                        className={`w-full rounded-md object-cover transition-transform duration-300 hover:scale-[1.02] ${i === 0 && e.gallery!.length % 2 === 1 ? 'col-span-2 aspect-[1.8/1]' : 'aspect-[1.2/1]'}`}
                      />
                    ))}
                  </div>
                )}
              </article>
              ),
            }))}
          />
        </div>

        {/* ── Sticky times rail ── */}
        <aside className="max-[1100px]:hidden">
          <nav
            aria-label="Experience periods"
            className="sticky top-40 flex flex-col"
          >
            <div className="flex flex-col">
              {experienceData.map((e, i) => {
                const active = activeI === i;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => scrollToTarget(`#timeline-entry-${i}`)}
                    className={`group flex w-full cursor-pointer items-baseline gap-3 border-l-2 py-2.5 pl-4 text-left transition-all duration-200 ${
                      active
                        ? 'border-[var(--accent-secondary)]'
                        : 'border-[var(--border)] opacity-50 hover:border-[var(--border-hover)] hover:opacity-100'
                    }`}
                  >
                    <span
                      className={`font-mono text-[0.55rem] tracking-[0.12em] transition-colors duration-200 ${
                        active ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-ghost)]'
                      }`}
                    >
                      {pad(i + 1)}
                    </span>
                    <span
                      className={`font-display text-[0.95rem] font-semibold leading-tight transition-colors duration-200 ${
                        active ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-dim)]'
                      }`}
                    >
                      {e.period}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>
      </div>
    </section>
  );
}
