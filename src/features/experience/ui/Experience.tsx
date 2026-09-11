'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import { experienceData, ExperienceEntry } from '@/entities/experience';

gsap.registerPlugin(ScrollTrigger);

const pad = (n: number) => String(n).padStart(2, '0');

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const axisBaseRef = useRef<HTMLSpanElement>(null);
  const axisFillRef = useRef<HTMLSpanElement>(null);
  const entryRefs = useRef<(HTMLElement | null)[]>([]);

  const total = experienceData.length;
  const [vis, setVis] = useState<boolean[]>(() => experienceData.map(() => false));
  const [activeI, setActiveI] = useState(0);
  const activeRef = useRef(0);

  const scrollToEntry = (i: number) => {
    entryRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useGSAP(() => {
    const timeline = timelineRef.current;
    const axisBase = axisBaseRef.current;
    const axisFill = axisFillRef.current;
    if (!timeline || !axisFill || !axisBase) return;

    const entries = entryRefs.current;
    const segs: { top: number; h: number }[] = Array.from({ length: total }, () => ({ top: 0, h: 0 }));
    let maxTop = 0;
    let timelineTop = 0;

    // Rect-based geometry: immune to the reveal transform on entries (no
    // reliance on offsetParent chains, unlike a plain offsetTop approach).
    const measure = () => {
      const tRect = timeline.getBoundingClientRect();
      timelineTop = tRect.top + window.scrollY;
      entries.forEach((el, i) => {
        if (!el) return;
        const r = el.getBoundingClientRect();
        segs[i] = { top: r.top + window.scrollY - timelineTop, h: r.height };
      });
      const last = entries[total - 1];
      if (last) {
        const period = last.querySelector<HTMLElement>('h3');
        if (period) {
          const pr = period.getBoundingClientRect();
          maxTop = pr.top + window.scrollY - timelineTop + pr.height / 2;
        }
      }
      axisBase.style.height = `${maxTop}px`;
      axisFill.style.height = `${maxTop}px`;
    };

    const ctx = gsap.context(() => {
      gsap.set(axisFill, { scaleY: 0 });
      const fillTo = gsap.quickTo(axisFill, 'scaleY', { duration: 0.45, ease: 'power2.out' });

      // Single, continuous "read progress" line: it grows from the first
      // year to the last as you scroll, and the read-line (62% viewport)
      // marks which entry is current — that is the whole principle.
      const setState = () => {
        const readY = (window.scrollY || 0) + (window.innerHeight || 900) * 0.62;
        const within = Math.min(Math.max(readY - timelineTop, 0), maxTop);
        fillTo(maxTop ? within / maxTop : 0);

        let i = 0;
        for (let k = 0; k < total; k++) {
          if (within < segs[k].top) break;
          i = k;
        }
        if (i !== activeRef.current) {
          activeRef.current = i;
          setActiveI(i);
        }
      };

      entries.forEach((el, idx) => {
        if (!el) return;
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () => setVis((prev) => prev.map((v, k) => (k === idx ? true : v))),
        });
      });

      ScrollTrigger.create({
        trigger: timeline,
        start: 'top 72%',
        end: () => timelineTop + maxTop - (window.innerHeight || 900) * 0.62,
        scrub: 0.4,
        onRefresh: () => {
          measure();
          setState();
        },
        onUpdate: () => setState(),
      });
    }, sectionRef);

    const ro = new ResizeObserver(() => {
      measure();
      ScrollTrigger.refresh();
    });
    ro.observe(timeline);

    return () => {
      ctx.revert();
      ro.disconnect();
    };
  }, [total]);

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative isolate flex min-h-screen flex-col justify-center pb-0 pt-[6rem] max-[700px]:min-h-0"
    >
      <SectionTitle title="experience" accent=" & background" />

      <div className="relative mx-auto w-full max-w-[1650px] px-[4vw]">
        <div className="grid gap-x-[clamp(1.5rem,3vw,3.5rem)] [grid-template-columns:minmax(0,1fr)_clamp(170px,20vw,240px)] max-[880px]:grid-cols-1 max-[880px]:gap-x-0">
          {/*  ── Timeline: sticky year rail · axis · experience cards ── */}
          <div
            ref={timelineRef}
            className="relative w-full [--rail:clamp(150px,15vw,250px)] py-2 max-[880px]:[--rail:0px]"
          >
            {/*  Pending half — dotted, stays behind the growing line.  */}
            <span
              ref={axisBaseRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-[var(--rail)] top-0 w-[2px] opacity-60 [background-image:repeating-linear-gradient(to_bottom,var(--border)_0_3px,transparent_3px_9px)] max-[880px]:left-2"
            />

            {/*  Active half — one bright line, grows with your scroll.  */}
            <span
              ref={axisFillRef}
              aria-hidden="true"
              className="pointer-events-none absolute left-[var(--rail)] top-0 w-[2px] origin-top bg-[var(--accent-secondary)] will-change-transform max-[880px]:left-2"
            />

            {experienceData.map((e: ExperienceEntry, i: number) => {
              const revealed = vis[i];
              const active = activeI === i;
              const passed = activeI > i;
              const lastEntry = i === total - 1;
              return (
                <article
                  key={i}
                  ref={(el) => {
                    entryRefs.current[i] = el;
                  }}
                  className={`scroll-mt-[5.5rem] grid p-0 pb-[clamp(6.5rem,12vh,10rem)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [grid-template-columns:var(--rail)_60px_minmax(0,1fr)] last:pb-[100vh] max-[880px]:[grid-template-columns:1fr] max-[880px]:pb-14 ${
                    revealed ? 'translate-y-0 opacity-100' : 'translate-y-[18px] opacity-0'
                  }`}
                >
                  {/*  Sticky year — rides the rail until the next card takes over.  */}
                  <header
                    className={`${
                      lastEntry
                        ? 'static pb-3'
                        : 'sticky top-[5.5rem]'
                    } flex flex-col items-end gap-[0.45rem] self-start pr-6 max-[880px]:static max-[880px]:flex-row max-[880px]:items-baseline max-[880px]:justify-start max-[880px]:gap-3 max-[880px]:pl-[26px] max-[880px]:pr-0 max-[880px]:pb-1.5`}
                  >
                    <span
                      className={`font-mono text-[0.55rem] tracking-[0.16em] transition-colors duration-300 ${
                        active ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-ghost)]'
                      }`}
                    >
                      {pad(i + 1)}
                    </span>
                    <h3
                      className={`relative m-0 font-display text-[clamp(2rem,3.4vw,3.2rem)] font-bold leading-[1.02] tracking-[-0.02em] transition-colors duration-300 max-[880px]:text-[clamp(1.5rem,6vw,2rem)] max-[880px]:text-left ${
                        active
                          ? 'text-[var(--accent-secondary)]'
                          : passed || revealed
                            ? 'text-[var(--text-dim)]'
                            : 'text-[var(--text-ghost)]'
                      }`}
                    >
                      {e.period}
                      <span
                        aria-hidden="true"
                        className={`absolute top-1/2 -right-[30px] size-3 -translate-y-1/2 rounded-full border-[1.5px] bg-[var(--bg)] shadow-[0_0_0_5px_var(--bg)] transition-colors duration-300 max-[880px]:left-[-46px] max-[880px]:right-auto ${
                          active
                            ? 'border-[var(--accent-secondary)]'
                            : passed
                              ? 'border-[color-mix(in_srgb,var(--accent-secondary)_45%,var(--bg))]'
                              : 'border-[var(--border-hover)]'
                        }`}
                      />
                    </h3>
                  </header>

                  {/*  Experience block — divider between entries, no panel  */}
                  <div className="min-w-0 [grid-column:3] max-[880px]:[grid-column:1]">
                    <div
                      className={`group ${i === 0 ? 'pt-0' : 'border-t border-[var(--border)] pt-[clamp(1.5rem,2.5vw,2.4rem)]'}`}
                    >
                      <h4 className="m-0 font-display text-[clamp(1.4rem,2vw,1.9rem)] font-bold leading-[1.2] tracking-[-0.015em] text-[var(--text)]">
                        {e.role}
                      </h4>
                      <p className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.07em] text-[var(--text-dim)]">
                        {e.org}
                      </p>
                      <p className="mt-4 max-w-[720px] font-sans text-[clamp(0.84rem,1vw,0.94rem)] font-light leading-[1.75] text-[var(--text-secondary)]">
                        {e.desc}
                      </p>

                      {e.highlights && e.highlights.length > 0 && (
                        <ul className="mt-[1.1rem] flex list-none flex-col gap-2 p-0">
                          {e.highlights.map((h) => (
                            <li
                              key={h}
                              className="relative pl-[1.15rem] font-mono text-[0.68rem] tracking-[0.02em] text-[var(--text-dim)]"
                            >
                              <span
                                aria-hidden="true"
                                className="absolute left-0 top-[0.32em] size-[5px] rounded-full bg-[var(--accent-secondary)] opacity-80"
                              />
                              {h}
                            </li>
                          ))}
                        </ul>
                      )}

                      {e.tech && e.tech.length > 0 && (
                        <ul className="mt-[1.1rem] flex list-none flex-wrap gap-1.5 p-0">
                          {e.tech.map((t) => (
                            <li
                              key={t}
                              className="rounded-[var(--radius-full)] border border-[color-mix(in_srgb,var(--border)_80%,transparent)] bg-[color-mix(in_srgb,var(--text-ghost)_10%,transparent)] px-2.5 py-[3px] font-mono text-[0.6rem] tracking-[0.03em] text-[var(--text-dim)] transition-colors duration-200 hover:border-[var(--border-hover)] hover:text-[var(--text)]"
                            >
                              {t}
                            </li>
                          ))}
                        </ul>
                      )}

                      {e.gallery && e.gallery.length > 0 && (
                        <div className="mt-[1.35rem] grid grid-cols-2 gap-4 max-[700px]:gap-2.5">
                          {e.gallery.map((g) => (
                            <figure
                              key={g.src}
                              className="relative m-0 aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)]"
                            >
                              <Image
                                src={g.src}
                                alt={g.alt}
                                fill
                                sizes="(max-width: 768px) 92vw, (max-width: 1200px) 40vw, 560px"
                                className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.045]"
                              />
                            </figure>
                          ))}
                        </div>
                      )}

                      {e.link && (
                        <a
                          href={e.link}
                          className="mt-5 inline-flex w-fit items-center gap-[0.4em] font-mono text-[0.66rem] uppercase tracking-[0.08em] text-[var(--accent-secondary)] underline underline-offset-4 transition-colors duration-200 [text-decoration-color:color-mix(in_srgb,var(--accent-secondary)_35%,transparent)] hover:text-[var(--text)] hover:[text-decoration-color:var(--accent-secondary)]"
                        >
                          {e.linkText ?? 'view project'}
                          <span className="transition-transform duration-200 group-hover:translate-x-[3px]">
                            →
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/*  ── Sidebar: index of every experience (sticky, right) ── */}
          <aside className="max-[880px]:hidden">
            <nav
              aria-label="Experience list"
              className="sticky top-[5.5rem] flex flex-col pr-1"
            >
              <header className="mb-6 flex flex-col gap-[0.4rem]">
                <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[var(--text-ghost)]">
                  timeline
                </span>
                <span className="font-mono text-[0.62rem] tracking-[0.12em] text-[var(--text-dim)]">
                  {pad(activeI + 1)} / {pad(total)} — where you are
                </span>
              </header>

              <div className="flex flex-col">
                {experienceData.map((e: ExperienceEntry, i: number) => {
                  const active = activeI === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollToEntry(i)}
                      className={`group flex w-full cursor-pointer items-start gap-3 border-r-2 py-3 pr-5 pl-1 text-right transition-all duration-200 ${
                        active
                          ? 'border-[var(--accent-secondary)]'
                          : 'border-[var(--border)] opacity-60 hover:border-[var(--border-hover)] hover:opacity-100'
                      }`}
                    >
                      <span className="min-w-0 flex-col">
                        <span
                          className={`block font-display text-[1.02rem] font-semibold leading-[1.15] transition-colors duration-200 ${
                            active ? 'text-[var(--accent-secondary)]' : 'text-[var(--text)]'
                          }`}
                        >
                          {e.period}
                        </span>
                        <span className="mt-[0.1rem] block font-mono text-[0.55rem] uppercase tracking-[0.12em] text-[var(--text-ghost)]">
                          {e.role}
                        </span>
                      </span>
                      <span
                        className={`self-center pt-[0.2rem] font-mono text-[0.55rem] tracking-[0.16em] transition-colors duration-200 ${
                          active ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-ghost)]'
                        }`}
                      >
                        {pad(i + 1)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>
          </aside>
        </div>
      </div>
    </section>
  );
}