'use client';

import Image from 'next/image';
import { FiMapPin, FiMail } from '@/shared/ui/Icon';
import { profile } from '@/entities/profile';
import { TransitionLink } from '@/features/transitions';
import { useInView } from '@/shared/hooks/useInView';
import { PracticeBento } from './PracticeBento';
import { HoverPreviewLink } from './HoverPreviewLink';
import { SkillsGrid } from './SkillsGrid';
import Link from 'next/link';

const reveal = (inView: boolean) =>
  `transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
    inView ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
  }`;

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

  return (
    <section
      id="about"
      className="relative flex w-full flex-col items-center overflow-x-clip border-t border-[var(--border)] py-14 md:py-28"
    >
      <div className="relative z-[1] mx-auto flex w-full max-w-[1240px] flex-col gap-16 px-5 md:gap-20 md:px-8">
        <div
          ref={headRef}
          className={`grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_1px_minmax(260px,0.58fr)] lg:gap-16 ${reveal(headIn)}`}
        >
          <div className="flex min-w-0 flex-col items-start">
            <p className="mb-4 text-[0.82rem] font-medium text-[var(--text-dim)]">Introduction</p>
            <h2 className="m-0 max-w-[12ch] font-display text-[clamp(3rem,7vw,6.25rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-[var(--text)]">
              Building with intent
            </h2>
            <p className="mt-6 max-w-[42ch] font-display text-[clamp(1.2rem,2vw,1.55rem)] leading-[1.5] tracking-[var(--tracking-tight)] text-[var(--text-secondary)]">
              {profile.brandTagline}
            </p>
            <p className="mt-5 max-w-[58ch] text-[0.98rem] leading-[1.8] text-[var(--text-secondary)]">
              <b>Heellooo!</b> Welcome there, my name is Vyacheslav — a developer focused on
              learning everything new, building interesting and challenging products. I always open
              to new. My work ranges from{' '}
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
              . I also document{' '}
              <HoverPreviewLink
                href="/blog"
                preview="/images/perspective.webp"
                caption="Notes on building"
                desc="Short notes on architecture, backends, design decisions, and shipping software."
              >
                lessons from the process
              </HoverPreviewLink>{' '}
              as I go.
            </p>
            <div className="mt-7 max-w-[58ch]">
              <p className="m-0 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
                Currently
              </p>
              <p className="m-0 mt-1.5 text-[0.9rem] leading-[1.7] text-[var(--text-secondary)]">
                Most of my time goes into{' '}
                <Link href="/projects/nexagon" className={inlineLinkClass}>
                  Nexagon
                </Link>
                , a real-time server monitoring platform built with Rust, React and WebGPU — where
                performance, clarity, and reliability all have to meet.
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.82rem] text-[var(--text-dim)]">
              <span className="inline-flex items-center gap-1.5">
                <FiMapPin size={14} aria-hidden="true" />
                {profile.location}
              </span>
            </div>
          </div>

          <div aria-hidden="true" className="hidden h-full w-px bg-[var(--border)] lg:block" />

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

        <section aria-labelledby="about-me-heading" className={`mt-10 md:mt-16 ${reveal(headIn)}`}>
          <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(220px,0.72fr)_1px_minmax(0,1.28fr)] lg:gap-10">
            <figure className="group relative m-0 min-h-[260px] overflow-hidden rounded-lg lg:min-h-full">
              <Image
                src="/images/5465461019808308089-y.webp"
                alt="Vyacheslav working at his desk"
                fill
                sizes="(max-width: 1024px) 100vw, 360px"
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
              />
            </figure>

            <div aria-hidden="true" className="hidden w-px bg-[var(--border)] lg:block" />

            <div className="flex min-w-0 flex-col justify-center py-1">
              <p
                id="about-me-heading"
                className="m-0 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--text-ghost)]"
              >
                About me
              </p>
              <h3 className="m-0 mt-3 font-display text-[clamp(1.6rem,2.6vw,2.2rem)] font-medium leading-[1.1] tracking-[var(--tracking-tight)] text-[var(--text)]">
                Curious builder with a product mindset
              </h3>
              <div className="mt-5 space-y-4 text-[0.98rem] leading-[1.85] text-[var(--text-secondary)]">
                <p className="m-0">
                  Based in <b>Odesa, Ukraine</b>, I’ve spent the last few years learning by building
                  — moving between frontend, backend, and infrastructure depending on what a product
                  needs. I’m most comfortable when I can take ownership across the whole flow, from
                  an early idea and interface sketch to implementation, deployment, and iteration.
                </p>
                <p className="m-0">
                  I’m drawn to problems where engineering and product thinking meet: making complex
                  systems understandable, keeping performance predictable, and shaping details so
                  the result feels intentional rather than accidental.
                </p>
                <p className="m-0 text-[0.94rem] text-[var(--text-dim)]">
                  Outside of shipping features, I spend a lot of time exploring game tech, tooling,
                  and new approaches that make building software faster and more enjoyable.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3 text-[0.82rem] text-[var(--text-dim)]">
                <a
                  href={`mailto:${profile.email}`}
                  className={`${inlineLinkClass} inline-flex items-center gap-1.5`}
                >
                  <FiMail size={14} aria-hidden="true" />
                  {profile.email}
                </a>
              </div>
            </div>
          </div>
        </section>

        <div ref={bodyRef} className={`flex flex-col gap-14 md:gap-16 ${reveal(bodyIn)}`}>
          <section aria-labelledby="about-skills-heading">
            <SectionHeading
              id="about-skills-heading"
              title="Stack"
              detail="The tools I reach for daily, grouped by where they do the most work."
            />
            <SkillsGrid />
          </section>

          <section aria-labelledby="about-practice-heading">
            <SectionHeading
              id="about-practice-heading"
              title="How I work"
              detail="A few parts of the process that shape what I build and how I ship it."
            />
            <PracticeBento />
          </section>

          <footer className="border-t border-[var(--border)] pt-8">
            <p className="m-0 max-w-[62ch] text-[0.95rem] leading-[1.8] text-[var(--text-secondary)]">
              I care about building things that are useful, clear, and pleasant to maintain. If
              you&apos;d like to talk about a project or collaboration, feel free to{' '}
              <a href={`mailto:${profile.email}`} className={inlineLinkClass}>
                get in touch
              </a>{' '}
              or take a look at my{' '}
              <TransitionLink href="/resume" className={inlineLinkClass}>
                résumé
              </TransitionLink>
              .
            </p>
          </footer>
        </div>
      </div>
    </section>
  );
}
