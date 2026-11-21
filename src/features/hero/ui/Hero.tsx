'use client';

//React
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  FiDownload,
} from '@/shared/ui/Icon';
//GSAP
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
//Other
import { FlipBoard } from '@/shared/ui/FlipBoard/FlipBoard';
import { TransitionLink } from '@/features/transitions';
import useGithubStats from '@/shared/hooks/useGithubStats';
import { TYPEWRITER_STRINGS } from '@/entities/hero';
import { profile } from '@/entities/profile';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

gsap.registerPlugin(CustomEase);

/*  Types  */

interface GithubStats {
  repos: number;
  followers: number;
}

/*  Shared resume CTA — solid accent button, no pill  */

export const RESUME_BUTTON =
  'inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--text)] px-5 py-2.5 text-[0.78rem] font-semibold text-[var(--bg)] no-underline transition-colors duration-200 hover:bg-[var(--accent-secondary)]';

/*  Sub-components  */

function HeroMascot({ mascotRef }: { mascotRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={mascotRef}
      className="group relative mx-auto aspect-square w-[min(42vw,500px)] max-w-full max-md:w-[min(52vw,184px)]"
      onPointerMove={(event) => {
        if (event.pointerType !== 'mouse') return;
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        const image = event.currentTarget.querySelector('img');
        if (image) image.style.transform = `perspective(900px) rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateY(-4px)`;
      }}
      onPointerLeave={(event) => {
        const image = event.currentTarget.querySelector('img');
        if (image) image.style.transform = '';
      }}
    >

      <Image
        src="/images/mascot/guide-cat-lowpoly.png"
        alt="Dr.ME, the portfolio mascot"
        width={1280}
        height={1280}
        priority
        className="relative z-[1] h-full w-full object-contain drop-shadow-[0_24px_48px_var(--accent-secondary-glow)] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
      />
    </div>
  );
}

function ResumeRow({
  stats,
  resumeRef,
}: {
  stats: GithubStats | null;
  resumeRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div
      ref={resumeRef}
      className="mb-3 flex flex-wrap items-center justify-start gap-3 max-md:mb-2 max-md:justify-center max-md:gap-2"
    >
      <TransitionLink href="/resume" className={RESUME_BUTTON}>
        <FiDownload size={15} />
        <span>resume</span>
      </TransitionLink>

      {stats && (
        <>
          <span
            className="h-[3px] w-[3px] rounded-full bg-[var(--text-ghost)]"
            aria-hidden="true"
          />
          <span className="font-mono text-[0.7rem] tracking-[0.04em] text-[var(--text-dim)]">
            {stats.repos} repos
          </span>
          <span
            className="h-[3px] w-[3px] rounded-full bg-[var(--text-ghost)]"
            aria-hidden="true"
          />
          <span className="font-mono text-[0.7rem] tracking-[0.04em] text-[var(--text-dim)]">
            {stats.followers} followers
          </span>
        </>
      )}
    </div>
  );
}

/*  Hero ─ */

export default function Hero() {
  const [show, setShow] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const { open: isWorkspaceOpen, panelWidth } = useWorkspace();
  const reservedRight = isWorkspaceOpen ? panelWidth + 72 : 56;
  const stats = useGithubStats(profile.githubUsername);
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const mascotRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const roleRef = useRef<HTMLDivElement | null>(null);
  const resumeRef = useRef<HTMLDivElement | null>(null);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);
  const scrollRef = useRef<HTMLButtonElement | null>(null);

  useGSAP(
    () => {
      if (!show) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo(
        mascotRef.current,
        { scale: 0.8, opacity: 0, y: 20, filter: 'blur(8px)' },
        { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 },
      )
        .fromTo(
          nameRef.current,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7 },
          '-=0.4',
        )
        .fromTo(
          roleRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4',
        )
        .fromTo(
          resumeRef.current,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.3',
        )
        .fromTo(
          taglineRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.3',
        )
        .fromTo(
          scrollRef.current,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.2',
        );

    },
    { scope: sectionRef, dependencies: [show] },
  );

  useEffect(() => {
    const t = setTimeout(() => {
      setPortalTarget(document.body);
      setShow(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!show) return;

    const updateVisibility = () => {
      const overlay = overlayRef.current;
      const about = document.getElementById('about');
      if (!overlay || !about) return;

      const aboutTop = about.getBoundingClientRect().top;
      const fadeStart = window.innerHeight * 0.9;
      const fadeEnd = window.innerHeight * 0.65;
      const progress = Math.min(1, Math.max(0, (fadeStart - aboutTop) / (fadeStart - fadeEnd)));

      overlay.style.opacity = String(1 - progress);
      overlay.style.visibility = progress >= 1 ? 'hidden' : 'visible';
      overlay.style.transform = `scale(${1 - progress * 0.05})`;
      overlay.style.filter = `blur(${progress * 10}px)`;
    };

    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility);
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [show]);

  const hero = (
    <section
      id="hero"
      ref={sectionRef}
      style={{ '--workspace-reserved-right': `${reservedRight}px` } as React.CSSProperties}
      className="pointer-events-none fixed inset-x-0 top-0 z-20 flex h-svh w-full flex-col items-center justify-center overflow-hidden xl:right-[var(--workspace-reserved-right)] xl:w-auto"
    >
      <div
        ref={overlayRef}
        className="pointer-events-none absolute inset-0 z-[1] flex flex-col items-center justify-center will-change-[opacity]"
      >
        <div className="pointer-events-auto relative z-10 grid w-full max-w-[1180px] grid-cols-[1fr_0.95fr] items-center gap-[clamp(2rem,7vw,7rem)] px-[6vw] max-md:-translate-y-[2svh] max-md:grid-cols-1 max-md:gap-2 max-md:px-5">
          <div className="flex flex-col items-start text-left max-md:order-2 max-md:items-center max-md:text-center">
            <h1
              ref={nameRef}
              className="mb-3 flex flex-col leading-[0.92] tracking-[-0.055em] max-md:mb-2"
            >
              <span className="font-display text-[clamp(3.1rem,6vw,6.6rem)] font-semibold text-[var(--text)] max-md:text-[clamp(2.35rem,10.4vw,3.8rem)]">
                {profile.firstName}
              </span>
              <span className="font-display text-[clamp(3.1rem,6vw,6.6rem)] font-semibold text-[var(--text-secondary)] max-md:text-[clamp(2.35rem,10.4vw,3.8rem)]">
                {profile.lastName}
              </span>
            </h1>

            <div
              ref={roleRef}
              className="mb-6 h-[1.4em] font-mono text-[clamp(0.7rem,1vw,0.85rem)] tracking-[0.06em] text-[var(--text-dim)] max-md:mb-4 max-md:text-[0.72rem]"
            >
              <FlipBoard words={TYPEWRITER_STRINGS} />
            </div>

            <ResumeRow stats={stats} resumeRef={resumeRef} />

            <p
              ref={taglineRef}
              className="m-0 max-w-[30ch] font-mono text-[0.72rem] lowercase leading-relaxed tracking-[0.08em] text-[var(--text-secondary)] max-md:text-[0.7rem]"
            >
              {profile.location} · available · replies &lt; 24h
            </p>
          </div>

          <div className="max-md:order-1">
            <HeroMascot mascotRef={mascotRef} />
          </div>
        </div>
      </div>
    </section>
  );

  return (
    <>
      <div aria-hidden="true" className="h-svh w-full" />
      {portalTarget ? createPortal(hero, portalTarget) : null}
    </>
  );
}
