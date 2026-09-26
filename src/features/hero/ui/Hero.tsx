'use client';

//React
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { FiGithub, FiLinkedin, FiAtSign, FiArrowDown, FiDownload, SiDiscord } from '@/shared/ui/Icon';
//GSAP
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
//Other
import { FlipBoard } from '@/shared/ui/FlipBoard/FlipBoard';
import { TransitionLink } from '@/features/transitions';
import { Floating, FloatingElement } from '@/shared/ui/Floating/Floating';
import { TOOLS } from '@/entities/hero';
import { BACKDROP_PHOTOS } from '@/entities/gallery';
import useGithubStats from '@/shared/hooks/useGithubStats';
import { TERMINALS } from '@/entities/hero';
import { TYPEWRITER_STRINGS } from '@/entities/hero';
import { profile, socialLinks } from '@/entities/profile';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(ScrollTrigger);

/*  Types  */

interface TerminalLine {
  prompt?: boolean;
  path?: string;
  branch?: string;
  t?: string;
  c?: string;
}

interface Terminal {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  lines: TerminalLine[];
}

interface GithubStats {
  repos: number;
  followers: number;
}

interface TerminalsProps {
  heroRef: React.RefObject<HTMLElement | null>;
}

/*  Shared resume CTA — solid accent button, no pill  */

export const RESUME_BUTTON =
  'inline-flex items-center gap-2 rounded-[var(--radius-sm)] bg-[var(--accent-secondary)] px-5 py-2.5 text-[0.78rem] font-semibold text-[#02120f] no-underline shadow-[0_4px_20px_-4px_var(--accent-secondary-glow)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110';

/*  Sub-components  */

function Terminals({ heroRef }: TerminalsProps) {
  const termRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const yOffsets = useRef(TERMINALS.map((t: Terminal) => t.y));
  const visibleRef = useRef(true);
  // Cached centers: getBoundingClientRect forces layout — refresh rarely.
  const centersRef = useRef<{ x: number; y: number }[]>([]);
  const frameRef = useRef(0);

  useEffect(() => {
    const on = (e: MouseEvent) => {
      const hero = heroRef?.current;
      if (!hero) { mouse.current = { x: -999, y: -999 }; return; }
      const r = hero.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        mouse.current = { x: e.clientX, y: e.clientY };
      } else {
        mouse.current = { x: -999, y: -999 };
      }
    };
    window.addEventListener('mousemove', on, { passive: true });
    return () => window.removeEventListener('mousemove', on);
  }, [heroRef]);

  useEffect(() => {
    const hero = heroRef?.current;
    if (!hero || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => {
      visibleRef.current = entry.isIntersecting;
    });
    io.observe(hero);
    return () => io.disconnect();
  }, [heroRef]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      if (visibleRef.current) {
        const mx = mouse.current.x, my = mouse.current.y;
        frameRef.current += 1;
        const remeasure = frameRef.current % 6 === 0;
        termRefs.current.forEach((el, i) => {
          if (!el) return;
          const term = TERMINALS[i];

          yOffsets.current[i] += term.speed;
          if (yOffsets.current[i] > 110) yOffsets.current[i] = -20;

          let c = centersRef.current[i];
          if (!c || remeasure) {
            const rect = el.getBoundingClientRect();
            c = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
            centersRef.current[i] = c;
          }
          const dx = c.x - mx, dy = c.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const radius = 400;
          let op = 0.02;
          if (dist < radius) {
            const t = 1 - dist / radius;
            op = 0.02 + t * 0.35;
          }

          el.style.transform = `translateY(${yOffsets.current[i] - term.y}vh)`;
          el.style.opacity = String(op);
        });
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_75%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,black_15%,black_75%,transparent_100%)]"
    >
      {TERMINALS.map((term: Terminal, i: number) => (
        <div
          key={term.title}
          ref={(el) => { termRefs.current[i] = el; }}
          className="absolute overflow-hidden rounded-[var(--radius-sm)] border border-[var(--terminal-border)] bg-[var(--terminal-bg)] opacity-[0.03] backdrop-blur-[2px]"
          style={{ left: `${term.x}%`, top: `${term.y}%`, width: term.w, height: term.h }}
        >
          <div className="flex items-center gap-2 border-b border-[var(--terminal-bar-border)] bg-[var(--terminal-bar)] px-3 py-[7px]">
            <span className="flex gap-[5px]">
              <i className="h-2 w-2 rounded-full bg-[var(--dot-r)]" />
              <i className="h-2 w-2 rounded-full bg-[var(--dot-y)]" />
              <i className="h-2 w-2 rounded-full bg-[var(--dot-g)]" />
            </span>
            <span className="font-mono text-[0.58rem] text-[var(--terminal-title)]">{term.title}</span>
          </div>
          <div className="overflow-hidden px-[14px] py-[10px] font-mono text-[0.6rem] leading-[1.75]">
            {term.lines.map((l: TerminalLine, li: number) =>
              l.prompt ? (
                <div key={li} className="flex items-center whitespace-nowrap">
                  <span className="mr-1.5 font-semibold text-[var(--terminal-prompt-arrow)]">➜</span>
                  <span className="text-[var(--terminal-prompt-path)]">{l.path}</span>
                  {l.branch && <span className="text-[var(--terminal-prompt-branch)]"> ({l.branch})</span>}
                </div>
              ) : (
                <div key={li} className="whitespace-nowrap" style={{ color: l.c }}>{l.t}</div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar({ avatarRef }: { avatarRef: React.RefObject<HTMLDivElement | null> }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      ref={avatarRef}
      className={`relative transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        loaded ? 'translate-y-0 opacity-100' : 'translate-y-[18px] opacity-0'
      }`}
    >
      <a
        href={`https://github.com/${profile.githubUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        className="relative block"
      >
        <div className="animate-avatar-glow pointer-events-none absolute -inset-4 rounded-full bg-[radial-gradient(circle,var(--accent-secondary-glow)_0%,transparent_70%)] max-md:-inset-2.5" aria-hidden="true" />
        <Image
          src={`https://github.com/${profile.githubUsername}.png`}
          alt={profile.githubUsername}
          width={96}
          height={96}
          unoptimized
          className="h-[clamp(68px,8vw,96px)] w-[clamp(68px,8vw,96px)] rounded-full border-[1.75px] border-[var(--accent-muted)] object-cover grayscale-[0.15] transition-[filter,border-color,transform] duration-300 hover:rotate-[360deg] hover:border-[var(--accent)] hover:grayscale-0 hover:duration-1000 max-md:h-12 max-md:w-12"
          onLoad={() => setLoaded(true)}
        />
      </a>
    </div>
  );
}

const heroIconMap = {
  github: FiGithub,
  linkedin: FiLinkedin,
  discord: SiDiscord,
} as const;

function ResumeRow({ stats, resumeRef }: { stats: GithubStats | null; resumeRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div ref={resumeRef} className="mb-3 flex flex-wrap items-center justify-center gap-3">
      <TransitionLink
        href="/resume"
        className={RESUME_BUTTON}
      >
        <FiDownload size={15} />
        <span>resume</span>
      </TransitionLink>

      {stats && (
        <>
          <span className="h-[3px] w-[3px] rounded-full bg-[var(--text-ghost)]" aria-hidden="true" />
          <span className="font-mono text-[0.7rem] tracking-[0.04em] text-[var(--text-dim)]">{stats.repos} repos</span>
          <span className="h-[3px] w-[3px] rounded-full bg-[var(--text-ghost)]" aria-hidden="true" />
          <span className="font-mono text-[0.7rem] tracking-[0.04em] text-[var(--text-dim)]">{stats.followers} followers</span>
        </>
      )}
    </div>
  );
}

function SocialDock({ socialsRef }: { socialsRef: React.RefObject<HTMLDivElement | null> }) {
  return (
    <div
      ref={socialsRef}
      className="pointer-events-auto fixed right-6 bottom-8 z-[2] flex items-center gap-5 max-md:right-4 max-md:bottom-[1.2rem]"
    >
      {socialLinks.map((link) => {
        const Icon = heroIconMap[link.icon];
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-dim)] transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--accent)]"
            aria-label={link.label}
          >
            <Icon size={20} />
          </a>
        );
      })}
      <a
        href={`mailto:${profile.email}`}
        className="text-[var(--text-dim)] transition-all duration-200 hover:-translate-y-0.5 hover:text-[var(--accent)]"
        aria-label="Email"
      >
        <FiAtSign size={20} />
      </a>
    </div>
  );
}

/*  Floating backdrop: gallery photos + bare colored tool icons drifting
    with the mouse. One shared rAF loop, transform-only, transparent.  */

const TOOL_SPOTS = [
  'top-[26%] left-[21%]',
  'bottom-[32%] right-[21%]',
  'top-[24%] right-[29%]',
  'bottom-[30%] left-[23%]',
  'top-[31%] left-[13%]',
  'bottom-[11%] right-[34%]',
];

const TOOL_DEPTHS = [1.5, 2.2, 0.6, 2.8, 1, 1.4];

const TOOL_COLORS: Record<string, string> = {
  React: '#61DAFB',
  TypeScript: '#3178C6',
  Rust: '#CE422B',
  'Node.js': '#339933',
  Docker: '#2496ED',
  Python: '#3776AB',
};

const PHOTO_SPOTS = [
  'top-[9%] left-[4%] w-52',
  'top-[7%] right-[5%] w-48',
  'bottom-[15%] left-[5%] w-44',
  'bottom-[13%] right-[6%] w-52',
  'top-[37%] left-[2%] w-36',
  'top-[35%] right-[2%] w-36',
];

const PHOTO_DEPTHS = [1.2, 2, 1.8, 1.2, 2.6, 0.8];
const PHOTO_TILT = ['-rotate-2', 'rotate-2', 'rotate-[1.5deg]', '-rotate-[1.5deg]', 'rotate-2', '-rotate-2'];

function FloatingBackdrop() {
  const tools = Object.keys(TOOL_COLORS)
    .map((label) => ({ label, tool: TOOLS.find((t) => t.label === label) }))
    .filter((x): x is { label: string; tool: (typeof TOOLS)[number] } => Boolean(x.tool));
  return (
    <Floating sensitivity={-0.7} easingFactor={0.06} className="pointer-events-none overflow-hidden">
      {BACKDROP_PHOTOS.map((photo, i) => (
        <FloatingElement
          key={photo.src}
          depth={PHOTO_DEPTHS[i % PHOTO_DEPTHS.length]}
          className={`${PHOTO_SPOTS[i % PHOTO_SPOTS.length]} ${i > 3 ? 'max-lg:hidden' : ''}`}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            sizes="320px"
            className={`h-auto w-full rounded-[var(--radius-sm)] border border-[var(--border)] object-cover opacity-90 transition-opacity duration-200 hover:opacity-100 ${PHOTO_TILT[i % PHOTO_TILT.length]}`}
          />
        </FloatingElement>
      ))}
      {tools.map(({ label, tool }, i) => (
        <FloatingElement
          key={label}
          depth={TOOL_DEPTHS[i % TOOL_DEPTHS.length]}
          className={`${TOOL_SPOTS[i % TOOL_SPOTS.length]} ${i > 3 ? 'max-md:hidden' : ''}`}
        >
          <span className="block opacity-90 transition-all duration-200 hover:scale-110 hover:opacity-100">
            {tool.icon({ size: 30, color: TOOL_COLORS[label] })}
          </span>
        </FloatingElement>
      ))}
    </Floating>
  );
}

/*  Hero ─ */

export default function Hero() {
  const [show, setShow] = useState(false);
  const stats = useGithubStats(profile.githubUsername);
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const nameRef = useRef<HTMLHeadingElement | null>(null);
  const roleRef = useRef<HTMLDivElement | null>(null);
  const resumeRef = useRef<HTMLDivElement | null>(null);
  const contactsRef = useRef<HTMLDivElement | null>(null);
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
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      if (!show) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo(
        avatarRef.current,
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
          contactsRef.current,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.35',
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

  return (
    <section id="hero" ref={sectionRef} className="pointer-events-none fixed inset-0 z-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
      <div ref={overlayRef} className="pointer-events-none fixed inset-0 z-[1] flex flex-col items-center justify-center will-change-[opacity]">
        <Terminals heroRef={sectionRef} />
        <FloatingBackdrop />

        <div className="pointer-events-auto relative z-10 flex flex-col items-center px-[5vw] text-center max-md:pt-[12vh]">
          <Avatar avatarRef={avatarRef} />

          <h1 ref={nameRef} className="mb-[0.4rem] mt-[1.2rem] flex flex-col leading-none">
            <span className="animate-name-shimmer bg-[linear-gradient(135deg,var(--text)_0%,var(--accent)_40%,var(--accent-secondary)_100%)] bg-[length:200%_200%] bg-clip-text font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold tracking-[-0.04em] text-transparent max-md:text-[clamp(1.6rem,9vw,2.4rem)]">
              {profile.firstName}
            </span>
            <span className="font-display text-[clamp(2.2rem,5.5vw,4.5rem)] font-bold tracking-[-0.04em] text-[var(--text-dim)] max-md:text-[clamp(1.6rem,9vw,2.4rem)]">
              {profile.lastName}
            </span>
          </h1>

          <div ref={roleRef} className="mb-4 h-[1.4em] font-mono text-[clamp(0.7rem,1vw,0.85rem)] tracking-[0.06em] text-[var(--text-dim)] max-md:text-[0.8rem]">
            <FlipBoard words={TYPEWRITER_STRINGS} />
          </div>

          <ResumeRow stats={stats} resumeRef={resumeRef} />

          <p ref={taglineRef} className="m-0 font-mono text-[0.78rem] lowercase tracking-[0.08em] text-[var(--text-secondary)]">
            {profile.location} · available for work · replies in &lt; 24h
          </p>
        </div>

        <SocialDock socialsRef={contactsRef} />

        <button
          ref={scrollRef}
          className="pointer-events-auto fixed bottom-8 left-1/2 flex -translate-x-1/2 cursor-pointer flex-col items-center gap-1.5 border-none bg-none p-1.5 text-[var(--text-dim)] transition-colors duration-300 hover:text-[var(--text-secondary)] max-md:bottom-[1.2rem] max-md:p-2.5"
          onClick={scrollDown}
          aria-label="Scroll down"
        >
          <FiArrowDown size={13} />
        </button>
      </div>
    </section>
  );
}
