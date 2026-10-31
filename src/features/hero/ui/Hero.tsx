'use client';

//React
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import {
  FiArrowDown,
  FiDownload,
} from '@/shared/ui/Icon';
//GSAP
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
//Other
import { FlipBoard } from '@/shared/ui/FlipBoard/FlipBoard';
import { TransitionLink } from '@/features/transitions';
import useGithubStats from '@/shared/hooks/useGithubStats';
import { TYPEWRITER_STRINGS } from '@/entities/hero';
import { profile } from '@/entities/profile';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';
import { useChat } from '@/app/providers/ChatProvider';

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(ScrollTrigger);

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
      className="group relative mx-auto aspect-square w-[min(42vw,500px)] max-w-full max-md:w-[min(48vw,200px)]"
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
      <div className="pointer-events-none absolute inset-[8%] rounded-full border border-[var(--border)] opacity-70" />
      <div className="pointer-events-none absolute inset-[18%] rounded-full border border-dashed border-[var(--border)] opacity-70" />
      <div className="pointer-events-none absolute inset-[24%] rounded-full bg-[radial-gradient(circle,var(--accent-secondary-glow)_0%,transparent_70%)] blur-xl" />
      <span className="pointer-events-none absolute left-[12%] top-[23%] h-2 w-2 rounded-full bg-[var(--accent)] shadow-[0_0_18px_var(--accent-secondary-glow)]" />
      <span className="pointer-events-none absolute right-[13%] top-[41%] h-1.5 w-1.5 rounded-full bg-[#18a874] shadow-[0_0_16px_rgba(24,168,116,0.45)]" />
      <span className="pointer-events-none absolute bottom-[21%] left-[23%] h-1.5 w-1.5 rounded-full bg-[var(--accent-secondary)]" />
      <Image
        src="/images/mascot/guide-cat-lowpoly.png"
        alt="Dr.ME, the portfolio mascot"
        width={1280}
        height={1280}
        priority
        className="relative z-[1] h-full w-full object-contain drop-shadow-[0_24px_48px_var(--accent-secondary-glow)] transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none"
      />
      <div className="pointer-events-none absolute -right-[1%] top-[24%] hidden items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-dim)] xl:flex">
        <span className="h-px w-8 bg-[var(--border)]" />
        systems
      </div>
      <div className="pointer-events-none absolute -left-[3%] bottom-[24%] hidden items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-dim)] xl:flex">
        interfaces
        <span className="h-px w-8 bg-[var(--border)]" />
      </div>
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
  const { open: isChatOpen, panelWidth } = useChat();
  const reservedRight = isChatOpen ? panelWidth + 72 : 56;
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
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    },
    { scope: sectionRef, dependencies: [show] },
  );

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

      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(10px)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [show] },
  );

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);

  const scrollDown = useCallback(() => {
    scrollToTarget('#about');
  }, []);

  const hero = (
    <section
      id="hero"
      ref={sectionRef}
      style={{ '--workspace-reserved-right': `${reservedRight}px` } as React.CSSProperties}
      className="pointer-events-none fixed inset-0 z-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden xl:right-[var(--workspace-reserved-right)] xl:w-auto"
    >
      <div
        ref={overlayRef}
        className="pointer-events-none fixed inset-0 z-[1] flex flex-col items-center justify-center will-change-[opacity] xl:right-[var(--workspace-reserved-right)]"
      >
        <div className="pointer-events-auto relative z-10 grid w-full max-w-[1180px] grid-cols-[1fr_0.95fr] items-center gap-[clamp(2rem,7vw,7rem)] px-[6vw] max-md:grid-cols-1 max-md:gap-1 max-md:px-6 max-md:pt-[5vh]">
          <div className="flex flex-col items-start text-left max-md:order-2 max-md:items-center max-md:text-center">
            <div className="mb-5 flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-dim)] max-md:mb-4 max-md:text-[0.55rem]">
            <span className="relative flex h-2 w-2 items-center justify-center" aria-hidden="true">
              <span className="absolute h-2 w-2 motion-safe:animate-ping rounded-full bg-[#18a874] opacity-35" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-[#18a874]" />
            </span>
            Independent developer <span className="text-[var(--text-ghost)]">/</span> Odesa, UA
            </div>

            <h1
              ref={nameRef}
              className="mb-3 flex flex-col leading-[0.92] tracking-[-0.055em] max-md:mb-2"
            >
              <span className="font-display text-[clamp(3.1rem,6vw,6.6rem)] font-semibold text-[var(--text)] max-md:text-[clamp(2.8rem,12vw,4.2rem)]">
                {profile.firstName}
              </span>
              <span className="font-display text-[clamp(3.1rem,6vw,6.6rem)] font-semibold text-[var(--text-secondary)] max-md:text-[clamp(2.8rem,12vw,4.2rem)]">
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

            <div className="mb-4 flex items-center gap-2 font-mono text-[0.62rem] tracking-[0.035em] text-[var(--text-dim)] max-md:mb-3 max-md:gap-1.5 max-md:text-[0.55rem]" aria-label="Areas of work">
              <span>game systems</span>
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <span>web apps</span>
              <span className="h-1 w-1 rounded-full bg-[var(--accent)]" aria-hidden="true" />
              <span>automation</span>
            </div>

            <p
              ref={taglineRef}
              className="m-0 max-w-[30ch] font-mono text-[0.72rem] lowercase leading-relaxed tracking-[0.08em] text-[var(--text-secondary)] max-md:text-[0.62rem]"
            >
              {profile.location} · available · replies &lt; 24h
            </p>
          </div>

          <div className="max-md:order-1 max-md:-mb-3">
            <HeroMascot mascotRef={mascotRef} />
          </div>
        </div>

        <button
          ref={scrollRef}
          className="pointer-events-auto fixed bottom-8 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1.5 border-none bg-none p-1.5 text-[var(--text-dim)] transition-colors duration-300 hover:text-[var(--text-secondary)] max-md:bottom-[1.2rem] max-md:p-2.5 xl:left-[calc((100vw-var(--workspace-reserved-right))/2)]"
          onClick={scrollDown}
          aria-label="Scroll down"
        >
          <FiArrowDown size={13} />
        </button>
      </div>
    </section>
  );

  return show ? createPortal(hero, document.body) : null;
}
