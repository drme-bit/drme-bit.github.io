'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiMapPin, FiDownload, FiMail } from '@/shared/ui/Icon';
import { profile } from '@/entities/profile';
import { TextFlippingBoard } from '@/shared/ui/TextFlippingBoard/TextFlippingBoard';
import { TransitionLink } from '@/features/transitions';
import { useInView } from '@/shared/hooks/useInView';
import { loadActivity } from '../lib/github';
import type { CommitInfo, HeatmapData } from '../lib/github';
import { SqueezeCarousel } from './SqueezeCarousel';
import { PrinciplesComparison } from './PrinciplesComparison';
import { AboutMarquee } from './AboutMarquee';
import { HoverPreviewLink } from './HoverPreviewLink';

const reveal = (inView: boolean) =>
  `transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
  }`;

const STATUS_LINES = ['AVAILABLE FOR WORK', 'REPLY WITHIN 24H', 'ODESA · GMT+3'];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="m-0 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-ghost)]">
      {children}
    </p>
  );
}

function SectionLabel({ index, children }: { index: string; children: React.ReactNode }) {
  return (
    <h3 className="mt-10 flex items-baseline gap-3 border-t border-[var(--border)] pt-7 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-dim)]">
      <span className="text-[var(--accent-secondary)]">{index}</span>
      {children}
    </h3>
  );
}

export default function About() {
  const [headRef, headIn] = useInView<HTMLDivElement>({ threshold: 0.15 });
  const [bodyRef, bodyIn] = useInView<HTMLDivElement>({ threshold: 0.03 });
  const [snapshot, setSnapshot] = useState<{ commits: CommitInfo[]; data: HeatmapData } | null>(null);
  const [statusIdx, setStatusIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    loadActivity(profile.githubUsername).then((res) => {
      if (cancelled) return;
      setSnapshot({ commits: res.commits, data: res.data });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS_LINES.length);
    }, 9000);
    return () => {
      clearInterval(id);
    };
  }, []);

  const boardText = snapshot
    ? `5+ YEARS SHIPPING\n${snapshot.data.total} CONTRIBUTIONS\n${snapshot.commits.length} RECENT COMMITS\n${STATUS_LINES[statusIdx]}`
    : 'TUNING\nSIGNAL';

  return (
    <section
      id="about"
      className="relative flex w-full flex-col items-center overflow-x-clip border-t border-[var(--border)] py-20 md:py-28"
    >
      <div className="relative z-[1] mx-auto flex w-full max-w-[1360px] flex-col gap-12 px-5 md:gap-16 md:px-8">
        {/* ── Hero: name + billboard ── */}
        <div ref={headRef} className={`flex flex-col gap-8 ${reveal(headIn)}`}>
          <div className="flex flex-col gap-4">
            <Eyebrow>{'// about'}</Eyebrow>
            <h2 className="m-0 font-display text-[clamp(2.8rem,7vw,4.8rem)] font-semibold leading-[1.02] tracking-[var(--tracking-section)] text-[var(--text)]">
              {profile.name}
            </h2>
            <p className="m-0 max-w-[38ch] font-display text-[clamp(1.05rem,2vw,1.35rem)] font-medium leading-[1.4] tracking-[var(--tracking-tight)] text-[var(--text-secondary)]">
              {profile.brandTagline}
            </p>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
            <div className="flex min-w-0 flex-col gap-6">
              <p className="m-0 max-w-[26ch] font-display text-[clamp(1.4rem,2.8vw,2rem)] font-medium leading-[1.35] tracking-[var(--tracking-tight)] text-[var(--text)]">
                Full-stack developer from Odesa with ~5 years of hands-on experience — clean
                architecture, measurable performance, software that actually ships.
              </p>
              <p className="m-0 max-w-[52ch] text-[1rem] leading-[1.75] text-[var(--text-secondary)]">
                I learn fastest by building — from{' '}
                <HoverPreviewLink
                  href="/projects/gmod-roblox"
                  preview="/media/projects/project-gmod/images/pgm_overview.webp"
                  caption="GMod × Roblox — live ops"
                >
                  Roblox experiences
                </HoverPreviewLink>{' '}
                and moderation bots to full-stack apps like{' '}
                <HoverPreviewLink
                  href="/projects/nexagon"
                  preview="/media/projects/nexagon/images/nexagon_main.webp"
                  caption="Nexagon — server monitoring"
                >
                  Nexagon
                </HoverPreviewLink>
                . I{' '}
                <HoverPreviewLink
                  href="/blog"
                  preview="/images/perspective.webp"
                  caption="Notes on building"
                >
                  write about the process
                </HoverPreviewLink>{' '}
                along the way.
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-3 text-[0.8rem] text-[var(--text-dim)]">
                <span className="inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)]">
                  <span
                    className="h-[7px] w-[7px] animate-status-pulse rounded-full bg-[var(--accent-success)]"
                    aria-hidden="true"
                  />
                  Available for work
                </span>
                <span className="text-[var(--text-ghost)]" aria-hidden="true">
                  ·
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiMapPin size={13} aria-hidden="true" />
                  {profile.location}
                </span>
                <span className="text-[var(--text-ghost)]" aria-hidden="true">
                  ·
                </span>
                <a
                  href={`mailto:${profile.email}`}
                  className="vercel-link vercel-link--blue inline-flex items-center gap-1.5 font-medium text-[var(--text-secondary)]"
                >
                  <FiMail size={13} aria-hidden="true" />
                  <span>{profile.email}</span>
                  <span className="vercel-link-arrow" aria-hidden="true">
                    ↗
                  </span>
                </a>
              </div>
              <div>
                <TransitionLink
                  href="/resume"
                  className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-secondary)] px-5 py-2.5 text-[0.78rem] font-semibold text-[#02120f] no-underline shadow-[0_4px_20px_-4px_var(--accent-secondary-glow)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                >
                  <FiDownload size={15} aria-hidden="true" />
                  <span>Download résumé</span>
                  <span aria-hidden="true">→</span>
                </TransitionLink>
              </div>
            </div>

            <figure className="m-0 min-w-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card-bg)] shadow-[var(--shadow-md)] max-lg:max-w-[420px]">
              <div className="relative aspect-[4/5] overflow-hidden">
                <Image
                  src="/images/17969af76asf9y986ad9fy.webp"
                  alt={profile.name}
                  fill
                  sizes="(max-width: 1024px) 90vw, 400px"
                  quality={85}
                  className="animate-kenburns object-cover object-[center_20%] contrast-[1.02] grayscale-[0.25] transition-[filter] duration-500 hover:grayscale-0"
                />
              </div>
            </figure>
          </div>
        </div>

        {/* ── Body ── */}
        <div ref={bodyRef} className={`flex flex-col ${reveal(bodyIn)}`}>
          {/* ── Field notes: game quotes, inline between text ── */}
          <figure className="m-0 mt-12 flex flex-col gap-2 border-l-2 border-[var(--accent-secondary)] pl-6">
            <blockquote className="m-0 font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-medium leading-[1.3] tracking-[var(--tracking-tight)] text-[var(--text)]">
              “I&apos;d ask you to think outside the box on this, but it&apos;s obvious your box is
              broken. And has schizophrenia.”
            </blockquote>
            <figcaption className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-dim)]">
              — Lab Rat
            </figcaption>
          </figure>

          <SectionLabel index="01">How I ship</SectionLabel>
          <SqueezeCarousel />

          <SectionLabel index="02">Principles</SectionLabel>
          <PrinciplesComparison />

          {/* ── Field notes: game quotes, inline between text ── */}
          <figure className="m-0 mt-10 flex flex-col gap-2 border-l-2 border-[var(--accent-secondary)] pl-6">
            <blockquote className="m-0 font-display text-[clamp(1.5rem,3.2vw,2.2rem)] font-medium leading-[1.3] tracking-[var(--tracking-tight)] text-[var(--text)]">
              “Recent studies have shown that approximately 40% of authors are manic depressive. The
              rest of us just drink.”
            </blockquote>
            <figcaption className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-dim)]">
              — Through the Wall
            </figcaption>
          </figure>

          {/* ── Flipboard: full-bleed, no chrome, live stat rows ── */}
          <div className="relative left-1/2 w-[100vw] -translate-x-1/2 py-6">
            <TextFlippingBoard
              text={boardText}
              boardRows={4}
              className="w-full max-w-none rounded-none border-0 bg-transparent p-0 shadow-none md:rounded-none md:p-0 dark:bg-transparent dark:shadow-none"
            />
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-sm)] md:p-7">
            <p className="m-0 font-display text-[clamp(1.3rem,2.6vw,1.75rem)] font-semibold tracking-[var(--tracking-section)] text-[var(--text)]">
              Have a project in mind?
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2.5 rounded-[var(--radius-sm)] bg-[var(--text)] px-6 py-3.5 text-[0.74rem] font-semibold text-[var(--bg)] no-underline transition-all duration-200 hover:-translate-y-px hover:opacity-90"
            >
              <span>Get in touch</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

          <p className="m-0 mt-2 flex flex-wrap gap-x-2.5 gap-y-2 text-[0.68rem] text-[var(--text-ghost)]">
            <span className="font-semibold uppercase tracking-[0.12em]">Colophon</span>
            <span aria-hidden="true">·</span>
            <span>Set in Geist</span>
            <span aria-hidden="true">·</span>
            <span>Built with Next.js, React Three Fiber and GSAP</span>
            <span aria-hidden="true">·</span>
            <span>Departure board by Aceternity</span>
          </p>
        </div>
      </div>

      <div className="sticky bottom-0 z-[1000]">
        <AboutMarquee />
      </div>
    </section>
  );
}
