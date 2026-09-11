'use client';

import { useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FiArrowRight, FiExternalLink, FiGithub } from '@/shared/ui/atoms/Icon';
import { projects } from '../lib/registry';
import { STATUS_META } from '../lib/constants';
import type { Project } from '../lib/project-repository';
import type { StatusMeta } from '../lib/constants';
import ProjectsHero from './ProjectsHero';
import { Blog } from '@/features/blog/ui/Blog';

gsap.registerPlugin(ScrollTrigger);

/*  Status badge variants (card overlays are dark) ─ */

const BADGE_TW: Record<string, string> = {
  ACTIVE: 'border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.12)] text-[var(--accent-success)]',
  PAUSED: 'border-[rgba(125,211,252,0.3)] bg-[rgba(125,211,252,0.12)] text-[var(--accent-secondary)]',
  DEPRECATED: 'border-white/[0.08] bg-white/[0.04] text-white/40',
};

/*  Between-card hairline with accent node ─ */

function CardSeparator() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-[6vw] h-px opacity-60 [background-image:linear-gradient(to_right,transparent_0%,var(--border)_20%,color-mix(in_srgb,var(--accent-secondary)_20%,transparent)_50%,var(--border)_80%,transparent_100%)]"
    >
      <span className="absolute left-1/2 top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-secondary)] shadow-[0_0_12px_var(--accent-secondary-glow)]" />
    </div>
  );
}

/*  JS Marquee (smooth slowdown on hover) ─ */

function useMarquee(
  trackRef: React.RefObject<HTMLDivElement | null>,
  isReversed: boolean,
  setCount: number,
) {
  const speedRef = useRef(1);
  const targetSpeedRef = useRef(1);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(false);
  const initializedRef = useRef(false);
  const baseSpeed = 80;

  const tick = useCallback(() => {
    if (pausedRef.current) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const now = performance.now();
    const dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0;
    lastTimeRef.current = now;

    speedRef.current += (targetSpeedRef.current - speedRef.current) * Math.min(dt * 3, 1);

    const track = trackRef.current;
    if (!track || setCount <= 0) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    const half = track.scrollWidth / 2;
    if (half <= 0) {
      rafRef.current = requestAnimationFrame(tick);
      return;
    }

    if (!initializedRef.current) {
      if (isReversed) {
        offsetRef.current = -half;
      }
      initializedRef.current = true;
    }

    const dir = isReversed ? 1 : -1;
    offsetRef.current += dir * baseSpeed * speedRef.current * dt;

    if (isReversed) {
      if (offsetRef.current >= 0) {
        offsetRef.current -= half;
      }
    } else {
      if (Math.abs(offsetRef.current) >= half) {
        offsetRef.current += half;
      }
    }

    track.style.transform = `translateX(${offsetRef.current}px)`;
    rafRef.current = requestAnimationFrame(tick);
  }, [isReversed, trackRef, setCount]);

  useEffect(() => {
    lastTimeRef.current = 0;
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const onEnter = useCallback(() => {
    targetSpeedRef.current = 0.15;
  }, []);

  const onLeave = useCallback(() => {
    targetSpeedRef.current = 1;
  }, []);

  return { onEnter, onLeave, pausedRef };
}

/*  Projects List Component  */

export function ProjectsList() {
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const list = listRef.current;
    if (!list) return;

    const ctx = gsap.context(() => {
      const cards = Array.from(list.querySelectorAll('.pr-card'));
      cards.forEach((card) => {
        const gallery = card.querySelector('.pr-gallery');
        const content = card.querySelector('.pr-content');

        gsap.fromTo(
          [gallery, content],
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          },
        );
      });
    }, listRef);

    return () => ctx.revert();
  }, []);

  const allProjects = projects.all;

  return (
    <div ref={listRef} className="relative flex flex-col will-change-[transform,filter,opacity]">
      {allProjects.map((project, i) => {
        const meta = STATUS_META[project.status] || STATUS_META.ACTIVE;
        const images =
          project.images?.length > 0 ? project.images : project.image ? [project.image] : [];
        const isLast = i === allProjects.length - 1;

        return (
          <div key={project.id}>
            <ProjectCardItem project={project} index={i} meta={meta} images={images} />
            {!isLast && <CardSeparator />}
          </div>
        );
      })}
    </div>
  );
}

/*  Project Card ── */

function ProjectCardItem({
  project,
  index,
  meta,
  images,
}: {
  project: Project;
  index: number;
  meta: StatusMeta;
  images: string[];
}) {
  const router = useRouter();
  const isReversed = index % 2 !== 0;
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { onEnter, onLeave, pausedRef } = useMarquee(trackRef, isReversed, images.length);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  };

  // Quadruple (even count) ensures seamless loop at midpoint
  const marqueeImages = [...images, ...images, ...images, ...images];

  useGSAP(() => {
    const card = cardRef.current;
    if (!card) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        pausedRef.current = !entry.isIntersecting;
      },
      { threshold: 0 },
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="pr-card group/card relative w-full min-h-[520px] cursor-default overflow-hidden max-[700px]:min-h-[420px]"
      onMouseMove={handleMouseMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className="pr-gallery absolute inset-0 z-0">
        <div
          ref={trackRef}
          className="flex h-full w-max gap-3 will-change-transform"
        >
          {marqueeImages.map((src, i) => (
            <div
              key={`slide-${index}-${i}`}
              className="group/slide relative h-full w-[42vw] min-w-[280px] shrink-0 overflow-hidden rounded-[2px] max-[700px]:w-[65vw] max-[700px]:min-w-[220px]"
            >
              <img
                src={src}
                alt=""
                className="block h-full w-full object-cover transition-transform duration-[0.8s] ease-[var(--ease-out)] group-hover/slide:scale-[1.04]"
                loading={i < 4 ? 'eager' : 'lazy'}
                draggable={false}
              />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-0 z-[1] [background-image:linear-gradient(to_bottom,rgba(10,10,10,0.5)_0%,rgba(10,10,10,0.25)_35%,rgba(10,10,10,0.4)_65%,rgba(10,10,10,0.75)_100%)]" />
      </div>

      <div
        className={`pr-content relative z-[2] flex min-h-[520px] flex-col justify-end gap-3 p-[2.5rem_6vw] transition-transform duration-500 ease-[var(--ease-out)] max-[700px]:min-h-[420px] max-[700px]:gap-[0.6rem] max-[700px]:p-[2rem_1.25rem] ${
          isReversed ? 'items-end text-right group-hover/card:-translate-y-1' : 'items-start group-hover/card:-translate-y-1'
        }`}
      >
        <div className={`flex items-center gap-4 ${isReversed ? 'flex-row-reverse' : ''}`}>
          <span
            className={`inline-flex items-center gap-[0.4rem] rounded-full border px-[0.7rem] py-[0.3rem] font-mono text-[0.6rem] uppercase tracking-[0.1em] backdrop-blur-lg ${
              BADGE_TW[project.status] || BADGE_TW.ACTIVE
            }`}
          >
            <meta.icon size={11} className="shrink-0 text-[0.8em] opacity-80" />
            {meta.label}
          </span>
          <span className="font-mono text-[0.55rem] tracking-[0.12em] text-white/35">
            ./project_{String(index + 1).padStart(3, '0')}
          </span>
        </div>

        <h3
          className={`m-0 max-w-[700px] font-display text-[clamp(1.8rem,4vw,3rem)] font-bold leading-[1.1] text-white max-[700px]:text-[clamp(1.4rem,6vw,2rem)] ${
            isReversed ? 'ml-auto' : ''
          }`}
        >
          {project.title}
        </h3>
        <p className="m-0 max-w-[560px] font-sans text-[clamp(0.82rem,1vw,0.92rem)] leading-[1.7] text-white/70 max-[700px]:max-w-full max-[700px]:text-[0.8rem]">
          {project.desc}
        </p>

        <div className={`flex flex-wrap gap-[0.4rem] ${isReversed ? 'justify-end' : ''}`}>
          {project.techSkills.slice(0, 6).map((t) => {
            const Icon = t.icon;
            return (
              <span
                key={t.name}
                className="inline-flex items-center gap-[0.3rem] rounded-full border border-white/10 bg-black/35 px-[0.6rem] py-[0.25rem] font-mono text-[0.6rem] tracking-[0.03em] text-white/75 backdrop-blur-lg"
              >
                {Icon && <Icon className="text-[0.7em] opacity-70" />}
                {t.name}
              </span>
            );
          })}
          {project.techSkills.length > 6 && (
            <span className="px-1 py-[0.25rem] font-mono text-[0.5rem] text-white/35">
              +{project.techSkills.length - 6}
            </span>
          )}
        </div>

        {project.features && project.features.length > 0 && (
          <div className={`flex flex-col gap-[0.35rem] ${isReversed ? 'items-end' : ''}`}>
            {project.features.slice(0, 3).map((f, i) => (
              <span
                key={i}
                className={`flex items-center gap-2 font-sans text-[0.72rem] leading-[1.4] text-white/60 ${
                  isReversed ? 'flex-row-reverse' : ''
                }`}
              >
                <span className="size-1 shrink-0 rounded-full bg-[var(--accent-secondary)] opacity-60" />
                {f}
              </span>
            ))}
          </div>
        )}

        <div
          className={`mt-1 flex w-full max-w-[560px] items-center justify-between gap-4 border-t border-white/[0.08] pt-3 ${
            isReversed ? 'ml-auto flex-row-reverse' : ''
          }`}
        >
          <button
            type="button"
            className="group/cta inline-flex cursor-pointer items-center gap-[0.6rem] rounded-[var(--radius-sm)] border border-white/10 bg-white/[0.08] px-[1.2rem] py-[0.6rem] font-mono text-[0.75rem] font-medium text-white backdrop-blur-md transition-all duration-300 ease-[var(--ease-out)] hover:-translate-y-px hover:border-[rgba(125,211,252,0.35)] hover:bg-[rgba(125,211,252,0.15)] hover:text-[var(--accent-secondary)]"
            onClick={() => router.push(`/projects/${project.id}`)}
          >
            <span>cat details.md</span>
            <FiArrowRight className="text-[0.9em] transition-transform duration-300 ease-[var(--ease-out)] group-hover/cta:translate-x-[3px]" />
          </button>

          <div className="flex gap-2">
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Repository"
                className="flex size-[34px] items-center justify-center rounded-[var(--radius-sm)] border border-white/10 text-white/50 backdrop-blur transition-all duration-300 ease-[var(--ease-out)] hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.1)] hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <FiGithub />
              </a>
            )}
            {project.url && project.url !== '#' && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Live demo"
                className="flex size-[34px] items-center justify-center rounded-[var(--radius-sm)] border border-white/10 text-white/50 backdrop-blur transition-all duration-300 ease-[var(--ease-out)] hover:border-[rgba(125,211,252,0.3)] hover:bg-[rgba(125,211,252,0.1)] hover:text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink />
              </a>
            )}
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-px [background-image:linear-gradient(to_right,transparent_0%,rgba(125,211,252,0.4)_50%,transparent_100%)]"
      />
    </div>
  );
}

/*  Main Projects Component with ScrollTrigger ─ */

export function Projects() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const listWrapperRef = useRef<HTMLDivElement>(null);
  const blogRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const container = containerRef.current;
    const hero = heroRef.current;
    const listWrapper = listWrapperRef.current;
    const blog = blogRef.current;
    if (!container || !hero || !listWrapper || !blog) return;

    const ctx = gsap.context(() => {
      // 0. Seamless handoff from Experience: the solid hero rides up over the
      // previous section's buffer and settles at its natural sticky position,
      // so the opaque band never slams into the timeline's last card.
      gsap.fromTo(
        hero,
        { yPercent: 80, immediateRender: false },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top 100%',
            end: 'top top',
            scrub: true,
            immediateRender: false,
          },
        },
      );

      // 1. ProjectList slides up from behind Hero (which is sticky)
      gsap.fromTo(
        listWrapper,
        { yPercent: 20, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: container,
            start: 'top 80%',
            end: 'top 20%',
            scrub: true,
          },
        },
      );

      // 2. As Blog approaches and overlaps, ProjectList gets blur/grayscale/scale
      // Opacity only fades when Blog fully covers it
      gsap.to(listWrapper, {
        filter: 'blur(8px) grayscale(100%)',
        scale: 0.95,
        ease: 'none',
        scrollTrigger: {
          trigger: blog,
          start: 'top 70%',
          end: 'top 20%',
          scrub: true,
        },
      });

      // 3. Fade out ProjectList only when Blog fully covers it
      gsap.to(listWrapper, {
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: blog,
          start: 'top 20%',
          end: 'top 0%',
          scrub: true,
        },
      });

      // 3. Blog section slides over ProjectList
      gsap.fromTo(
        blog,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: blog,
            start: 'top 88%',
            end: 'top top',
            scrub: true,
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative min-h-[300vh] w-full">
      <div
        ref={heroRef}
        className="sticky top-0 z-[1] h-[100vh] w-full will-change-transform"
      >
        <ProjectsHero />
      </div>

      <div
        ref={listWrapperRef}
        className="relative z-[2] w-full overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-background shadow-[0_-12px_40px_rgba(0,0,0,0.3)] will-change-[transform,filter,opacity]"
      >
        <ProjectsList />
      </div>

      <Blog ref={blogRef} />
    </div>
  );
}