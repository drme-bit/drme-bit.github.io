'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsHeroProps {
  onRevealComplete?: () => void;
}

export default function ProjectsHero({ onRevealComplete }: ProjectsHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    const underline = underlineRef.current;
    const tag = tagRef.current;
    const grid = gridRef.current;
    const content = contentRef.current;
    if (!section || !content) return;

    const ctx = gsap.context(() => {
      const enter = { start: 'top 82%', toggleActions: 'play none none reverse' as const };

      if (tag) {
        gsap.fromTo(
          tag,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: section, ...enter } },
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
            scrollTrigger: { trigger: section, ...enter },
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
            scrollTrigger: { trigger: section, ...enter },
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
            scrollTrigger: { trigger: section, ...enter },
          },
        );
      }

      // Grid overlay: fade + settle in (the old strokeDashoffset trick targeted
      // <line> nodes that the pattern never created — replaced with a real reveal).
      if (grid) {
        gsap.fromTo(
          grid,
          { opacity: 0, scale: 1.05 },
          {
            opacity: 0.6,
            scale: 1,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: section, ...enter },
          },
        );
      }

      // Parallax drift while the sticky hero scrolls past — subtle, on the
      // compositor, doesn't touch the entrance tweens (separate elements).
      if (section) {
        gsap.to(content, {
          yPercent: -6,
          ease: 'none',
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [onRevealComplete]);

  return (
    <div
      ref={sectionRef}
      className="relative left-0 top-0 flex h-[100vh] w-full items-center justify-center overflow-hidden bg-[var(--accent-secondary)] pb-8 will-change-transform rounded-b-[24px]"
    >
      {/*  Decorative grid ── */}
      <div ref={gridRef} aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-60">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/*  Corner ticks ── */}
      <span aria-hidden="true" className="absolute left-6 top-6 font-mono text-[0.8rem] text-[rgba(0,0,0,0.35)] select-none max-[700px]:left-4 max-[700px]:top-4">
        ┌
      </span>
      <span aria-hidden="true" className="absolute right-6 top-6 font-mono text-[0.8rem] text-[rgba(0,0,0,0.35)] select-none max-[700px]:right-4 max-[700px]:top-4">
        ┐
      </span>
      <span aria-hidden="true" className="absolute bottom-6 left-6 font-mono text-[0.8rem] text-[rgba(0,0,0,0.35)] select-none max-[700px]:left-4 max-[700px]:bottom-4">
        └
      </span>
      <span aria-hidden="true" className="absolute bottom-6 right-6 font-mono text-[0.8rem] text-[rgba(0,0,0,0.35)] select-none max-[700px]:right-4 max-[700px]:bottom-4">
        ┘
      </span>

      {/*  Content ── */}
      <div ref={contentRef} className="relative z-10 flex flex-col items-center gap-2 text-center">
        <span
          ref={tagRef}
          className="mb-1 rounded-full border border-[rgba(0,0,0,0.12)] bg-[rgba(0,0,0,0.08)] px-2.5 py-1 font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[rgba(0,0,0,0.5)]"
        >
          01 / 03
        </span>

        <h1 ref={titleRef} className="m-0 font-display text-[clamp(4rem,12vw,10rem)] font-extrabold leading-none tracking-[-0.03em] text-[rgba(0,0,0,0.9)] max-[700px]:text-[clamp(3rem,15vw,5rem)]">
          PROJECTS
        </h1>

        <span
          ref={underlineRef}
          aria-hidden="true"
          className="mt-3 block h-[3px] w-[clamp(3rem,12vw,10rem)] scale-x-0 bg-[rgba(0,0,0,0.85)]"
        />

        <p ref={subtitleRef} className="m-0 font-mono text-[clamp(0.7rem,1vw,0.85rem)] lowercase tracking-[0.1em] text-[rgba(0,0,0,0.5)]">
          what i&apos;ve built
        </p>
      </div>

      {/*  Scroll indicator ── */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 animate-scroll-bounce flex-col items-center gap-1 font-mono text-[0.55rem] tracking-[0.1em] text-[rgba(0,0,0,0.4)]"
      >
        <span>scroll</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-scroll-arrow">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </div>
  );
}