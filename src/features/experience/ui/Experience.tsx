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
      className="relative isolate flex min-h-screen flex-col justify-center pb-0 pt-[6rem] max-[700px]:min-h-0"
    >
      <div className="relative mx-auto grid w-full max-w-[1650px] grid-cols-[minmax(0,1fr)_200px] gap-x-8 px-[4vw] max-[1100px]:grid-cols-1">
        <div className="min-w-0">
          <Timeline
            data={experienceData.map((e) => ({
              title: e.period,
            content: (
              <div>
                <p className="mb-1 text-[15px] font-semibold text-neutral-900 md:text-base dark:text-neutral-100">
                  {e.role}
                </p>
                <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.12em] text-neutral-500 dark:text-neutral-500">
                  {e.org}
                </p>
                <p className="mb-6 max-w-[62ch] text-[13px] font-normal leading-[1.75] text-neutral-600 md:text-sm dark:text-neutral-400">
                  {e.desc}
                </p>
                {e.highlights && e.highlights.length > 0 && (
                  <ul className="m-0 mb-6 flex list-none flex-col gap-2 p-0">
                    {e.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2.5 text-[13px] leading-[1.6] text-neutral-700 md:text-sm dark:text-neutral-300"
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
                <div className="mb-8 flex flex-wrap gap-1.5">
                  {e.tech.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-neutral-200 px-2 py-0.5 font-mono text-[11px] text-neutral-600 dark:border-neutral-800 dark:text-neutral-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
                  {e.gallery && e.gallery.length > 0 && (
                    <div className="grid grid-cols-2 gap-4">
                      {e.gallery.map((g) => (
                        <Image
                          key={g.src}
                          src={g.src}
                          alt={g.alt}
                          width={500}
                          height={500}
                          sizes="(max-width: 768px) 44vw, 360px"
                          loading="lazy"
                          className="h-20 w-full rounded-lg object-cover shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset] md:h-44 lg:h-60"
                        />
                      ))}
                    </div>
                  )}
              {e.link && (
                <a
                  href={e.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-neutral-500 md:text-sm dark:text-neutral-100 dark:decoration-neutral-700 dark:hover:decoration-neutral-400"
                >
                  {e.linkText ?? 'view project'} →
                </a>
              )}
                </div>
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
            <span className="mb-4 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[var(--text-ghost)]">
              timeline
            </span>
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
            <span className="mt-4 font-mono text-[0.6rem] tracking-[0.1em] text-[var(--text-ghost)]">
              {pad(activeI + 1)} / {pad(experienceData.length)}
            </span>
          </nav>
        </aside>
      </div>
    </section>
  );
}
