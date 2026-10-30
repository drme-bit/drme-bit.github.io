'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FiMapPin, FiMail } from '@/shared/ui/Icon';
import { profile } from '@/entities/profile';
import { TextFlippingBoard } from '@/shared/ui/TextFlippingBoard/TextFlippingBoard';
import { TransitionLink } from '@/features/transitions';
import { useInView } from '@/shared/hooks/useInView';
import { loadActivity } from '../lib/github';
import type { CommitInfo, HeatmapData } from '../lib/github';
import { SqueezeCarousel } from './SqueezeCarousel';
import { PrinciplesComparison } from './PrinciplesComparison';
import { HoverPreviewLink } from './HoverPreviewLink';

const reveal = (inView: boolean) =>
  `transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
  }`;

const STATUS_LINES = ['AVAILABLE FOR WORK', 'REPLY WITHIN 24H', 'ODESA · GMT+3'];

function SectionHeading({ id, title, detail }: { id: string; title: string; detail: string }) {
  return (
    <div className="mb-6 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-2 border-t border-[var(--border)] pt-5">
      <h3 id={id} className="m-0 font-display text-[clamp(1.35rem,2.5vw,1.8rem)] font-medium tracking-[var(--tracking-tight)] text-[var(--text)]">
        {title}
      </h3>
      <p className="m-0 max-w-[42ch] text-[0.85rem] leading-[1.6] text-[var(--text-dim)]">
        {detail}
      </p>
    </div>
  );
}

const inlineLinkClass =
  'font-medium text-[var(--text)] underline decoration-[color-mix(in_srgb,var(--text)_30%,transparent)] underline-offset-[3px] transition-colors hover:decoration-[var(--accent-secondary)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)]';

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
    const id = setInterval(() => setStatusIdx((i) => (i + 1) % STATUS_LINES.length), 9000);
    return () => clearInterval(id);
  }, []);

  const boardText = snapshot
    ? `5+ YEARS SHIPPING\n${snapshot.data.total} CONTRIBUTIONS\n${snapshot.commits.length} RECENT COMMITS\n${STATUS_LINES[statusIdx]}`
    : 'TUNING\nSIGNAL';

  return (
    <section
      id="about"
      className="relative flex w-full flex-col items-center overflow-x-clip border-t border-[var(--border)] py-20 md:py-28"
    >
      <div className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-col gap-16 px-5 md:gap-20 md:px-8">
        <div ref={headRef} className={`grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.58fr)] lg:gap-20 ${reveal(headIn)}`}>
          <div className="flex min-w-0 flex-col items-start">
            <p className="mb-4 text-[0.82rem] font-medium text-[var(--text-dim)]">A bit about me</p>
            <h2 className="m-0 max-w-[12ch] font-display text-[clamp(3rem,7vw,6.25rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-[var(--text)]">
              How I build
            </h2>
            <p className="mt-6 max-w-[42ch] font-display text-[clamp(1.2rem,2vw,1.55rem)] leading-[1.5] tracking-[var(--tracking-tight)] text-[var(--text-secondary)]">
              {profile.brandTagline}
            </p>
            <p className="mt-5 max-w-[58ch] text-[0.98rem] leading-[1.8] text-[var(--text-secondary)]">
              I’m a full-stack developer from Odesa with around five years of experience. I learn by
              building: from{' '}
              <HoverPreviewLink
                href="/projects/gmod-roblox"
                preview="/media/projects/project-gmod/images/pgm_overview.webp"
                caption="GMod × Roblox · live operations"
                desc="Live game systems, moderation tools, and experiences built for active player communities."
              >
                live game systems
              </HoverPreviewLink>{' '}
              to products like{' '}
              <HoverPreviewLink
                href="/projects/nexagon"
                preview="/media/projects/nexagon/images/nexagon_main.webp"
                caption="Nexagon · server monitoring"
                desc="A real-time game server monitoring platform built with Rust, React, and WebGPU."
              >
                Nexagon
              </HoverPreviewLink>
              . I also share practical notes on{' '}
              <HoverPreviewLink
                href="/blog"
                preview="/images/perspective.webp"
                caption="Notes on building"
                desc="Short notes on architecture, backends, design decisions, and shipping software."
              >
                what I learn along the way
              </HoverPreviewLink>
              .
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.82rem] text-[var(--text-dim)]">
              <span className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent-success)]" aria-hidden="true" />
                Available for work
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiMapPin size={14} aria-hidden="true" />
                {profile.location}
              </span>
              <a href={`mailto:${profile.email}`} className={`${inlineLinkClass} inline-flex items-center gap-1.5`}>
                <FiMail size={14} aria-hidden="true" />
                {profile.email}
              </a>
            </div>
            <TransitionLink href="/resume" className={`${inlineLinkClass} mt-5 text-[0.84rem]`}>
              Résumé
            </TransitionLink>
          </div>

          <figure className="group m-0 min-w-0 overflow-hidden rounded-lg border border-[var(--border)] max-lg:max-w-[520px]">
            <div className="relative aspect-[4/4.5] overflow-hidden">
              <Image
                src="/images/17969af76asf9y986ad9fy.webp"
                alt={profile.name}
                fill
                sizes="(max-width: 1024px) 90vw, 520px"
                quality={85}
                className="object-cover object-[center_20%] contrast-[1.02] transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
            </div>
          </figure>
        </div>

        <figure className="relative left-1/2 m-0 w-screen -translate-x-1/2 border-y border-[var(--border)] py-8 md:py-10">
          <figcaption className="mx-auto mb-4 flex w-full max-w-[1240px] flex-wrap items-baseline justify-between gap-2 px-5 text-[0.8rem] text-[var(--text-dim)] md:px-8">
            <span>Recent work, at a glance</span>
            <span>Live GitHub activity</span>
          </figcaption>
          <TextFlippingBoard
            text={boardText}
            boardRows={4}
            className="w-full max-w-none rounded-none border-0 bg-transparent p-0 shadow-none dark:bg-transparent dark:shadow-none"
          />
        </figure>

        <div ref={bodyRef} className={`flex flex-col gap-14 md:gap-16 ${reveal(bodyIn)}`}>
          <section aria-labelledby="about-practice-heading">
            <SectionHeading
              id="about-practice-heading"
              title="How I work"
              detail="A few parts of the process that shape what I build and how I ship it."
            />
            <SqueezeCarousel />
          </section>

          <section aria-labelledby="about-principles-heading">
            <SectionHeading
              id="about-principles-heading"
              title="What guides me"
              detail="Simple habits that keep projects useful, maintainable, and moving forward."
            />
            <PrinciplesComparison />
          </section>

          <p className="m-0 border-t border-[var(--border)] pt-5 text-[0.9rem] leading-[1.7] text-[var(--text-secondary)]">
            Have a project in mind?{' '}
            <a href="#contact" className={inlineLinkClass}>
              Tell me about it.
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
