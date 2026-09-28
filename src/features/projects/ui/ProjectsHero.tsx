'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsHeroProps {
  onRevealComplete?: () => void;
  /** Scrolling container that actually moves. The hero itself is sticky,
      so ScrollTriggers must NOT use it as a trigger: a stuck element
      reports a frozen position and the reveal fires early (already
      finished on arrival) + replays on reverse. */
  triggerRef?: React.RefObject<HTMLDivElement | null>;
}

export default function ProjectsHero({ onRevealComplete, triggerRef }: ProjectsHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const underline = underlineRef.current;
    const tag = tagRef.current;
    const content = contentRef.current;
    if (!section || !content) return;
    // Fall back to the hero itself only if no scrolling ancestor given.
    const trigger = triggerRef?.current ?? section;

    const ctx = gsap.context(() => {
      // One-shot reveal as the container rolls in — no reverse replay.
      const enter = { trigger, start: 'top 65%', toggleActions: 'play none none none' as const };

      if (tag) {
        gsap.fromTo(
          tag,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { ...enter } },
        );
      }

      if (title) {
        gsap.fromTo(
          title,
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: { ...enter },
          },
        );
      }

      if (underline) {
        gsap.fromTo(
          underline,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            delay: 0.25,
            ease: 'power3.inOut',
            scrollTrigger: { ...enter },
          },
        );
      }

      if (subtitle) {
        gsap.fromTo(
          subtitle,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power2.out',
            scrollTrigger: { ...enter },
          },
        );
      }

      // Parallax drift across the whole pinned stretch. Trigger is the
      // scrolling container: the sticky section itself barely moves.
      if (section) {
        gsap.to(content, {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [onRevealComplete, triggerRef]);

  return (
    <div
      ref={sectionRef}
      className="relative left-0 top-0 flex h-[100vh] w-full items-center justify-center overflow-hidden bg-[#150d31] pb-8 will-change-transform rounded-b-[24px]"
    >
      {/*  Content — quiet editorial hand-off (the portal already did the wow) ── */}
      <span aria-hidden="true" className="absolute left-6 top-6 font-mono text-[0.8rem] text-[rgba(240,238,235,0.35)] select-none max-[700px]:left-4 max-[700px]:top-4">
        ┌
      </span>
      <span aria-hidden="true" className="absolute right-6 top-6 font-mono text-[0.8rem] text-[rgba(240,238,235,0.35)] select-none max-[700px]:right-4 max-[700px]:top-4">
        ┐
      </span>
      <span aria-hidden="true" className="absolute bottom-6 left-6 font-mono text-[0.8rem] text-[rgba(240,238,235,0.35)] select-none max-[700px]:left-4 max-[700px]:bottom-4">
        └
      </span>
      <span aria-hidden="true" className="absolute bottom-6 right-6 font-mono text-[0.8rem] text-[rgba(240,238,235,0.35)] select-none max-[700px]:right-4 max-[700px]:bottom-4">
        ┘
      </span>

      {/*  Content — quiet editorial hand-off (the portal already did the wow) ── */}
      <div ref={contentRef} className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-start gap-3 px-6 text-left sm:px-10">
        <span
          ref={tagRef}
          className="mb-1 rounded-[var(--radius-sm)] border border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.07)] px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[rgba(240,238,235,0.6)]"
        >
          Selected work
        </span>

        <h1 ref={titleRef} className="m-0 max-w-[16ch] font-display text-[clamp(2.4rem,6vw,4.5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-[#f0eeeb]">
          Three builds, full stories.
        </h1>

        <span
          ref={underlineRef}
          aria-hidden="true"
          className="mt-1 block h-[3px] w-[clamp(2.5rem,8vw,6rem)] scale-x-0 bg-[var(--accent-tertiary)]"
        />

        <p ref={subtitleRef} className="m-0 font-mono text-[clamp(0.7rem,1vw,0.85rem)] lowercase tracking-[0.1em] text-[rgba(240,238,235,0.55)]">
          game servers · bots · full-stack apps
        </p>

        <p className="m-0 mt-2 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[rgba(240,238,235,0.4)]">
          03 projects · scroll for details
        </p>
      </div>

      {/*  Scroll indicator ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-scroll-bounce flex-col items-center gap-1 font-mono text-[0.55rem] tracking-[0.1em] text-[rgba(240,238,235,0.45)]"
      >
        <span>scroll</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-scroll-arrow">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </div>
  );
}