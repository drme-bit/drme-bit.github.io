'use client';

import { useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { FiArrowRight, FiExternalLink, FiGithub } from '@/shared/ui/atoms/Icon';
import { ICON_MAP } from '@/data/skillsData';
import { PROJECTS } from '@/data/projectsData';
import { STATUS_META } from '../lib/constants';
import ProjectsHero from '../components/ProjectsHero';
import { Blog } from '@/features/blog/ui/Blog';
import styles from '../ui/Projects.module.scss';

gsap.registerPlugin(ScrollTrigger);

/* ─── JS Marquee (smooth slowdown on hover) ──────────────── */

function useMarquee(
  trackRef: React.RefObject<HTMLDivElement | null>,
  isReversed: boolean,
) {
  const speedRef = useRef(1);
  const targetSpeedRef = useRef(1);
  const offsetRef = useRef(0);
  const rafRef = useRef<number>(0);
  const lastTimeRef = useRef(0);
  const pausedRef = useRef(false);
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

    const dir = isReversed ? 1 : -1;
    offsetRef.current += dir * baseSpeed * speedRef.current * dt;

    const track = trackRef.current;
    if (track) {
      const half = track.scrollWidth / 2;
      if (Math.abs(offsetRef.current) >= half) {
        offsetRef.current -= dir * half;
      }
      track.style.transform = `translateX(${offsetRef.current}px)`;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [isReversed, trackRef]);

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

/* ─── Projects List Component ────────────────────────────── */

export function ProjectsList() {
  const listRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const list = listRef.current;
    if (!list) return;

    const ctx = gsap.context(() => {
      const cards = Array.from(list.querySelectorAll(`.${styles.projectCard}`));
      cards.forEach((card) => {
        const gallery = card.querySelector(`.${styles.cardGallery}`);
        const content = card.querySelector(`.${styles.cardContent}`);

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
              toggleActions: 'play none none reverse',
            },
          },
        );
      });
    }, listRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={listRef} className={styles.projectList}>
      {PROJECTS.map((project, i) => {
        const meta = STATUS_META[project.status || 'ARCHIVED'] || STATUS_META.ARCHIVED;
        const images = project.images || (project.image ? [project.image] : []);
        const isLast = i === PROJECTS.length - 1;

        return (
          <div key={project.id}>
            <ProjectCardItem
              project={project}
              index={i}
              meta={meta}
              images={images}
            />
            {!isLast && <div className={styles.cardSeparator} />}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Project Card ───────────────────────────────────────── */

function ProjectCardItem({
  project,
  index,
  meta,
  images,
}: {
  project: any;
  index: number;
  meta: any;
  images: string[];
}) {
  const router = useRouter();
  const isReversed = index % 2 !== 0;
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const { onEnter, onLeave, pausedRef } = useMarquee(trackRef, isReversed);

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
      className={`${styles.projectCard} ${isReversed ? styles.isReversed : ''}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <div className={styles.cardGallery}>
        <div ref={trackRef} className={styles.galleryTrack}>
          {marqueeImages.map((src, i) => (
            <div key={`slide-${index}-${i}`} className={styles.gallerySlide}>
              <Image
                src={src}
                alt=""
                fill
                className={styles.galleryImg}
                sizes="100vw"
                priority={i < 3}
              />
            </div>
          ))}
        </div>
        <div className={styles.cardOverlay} />
      </div>

      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <span className={`${styles.cardBadge} ${styles[meta.cls] || ''}`}>
            <span className={styles.badgeDot}>{meta.icon}</span>
            {meta.label}
          </span>
          <span className={styles.cardId}>./project_{String(index + 1).padStart(3, '0')}</span>
        </div>

        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardDesc}>{project.desc}</p>

        <div className={styles.cardTech}>
          {project.tech.slice(0, 6).map((t: string) => {
            const Icon = ICON_MAP[t];
            return (
              <span key={t} className={styles.techTag}>
                {Icon && <Icon className={styles.techIcon} />}
                {t}
              </span>
            );
          })}
          {project.tech.length > 6 && (
            <span className={styles.techMore}>+{project.tech.length - 6}</span>
          )}
        </div>

        {project.features && project.features.length > 0 && (
          <div className={styles.cardFeatures}>
            {project.features.slice(0, 3).map((f: string, i: number) => (
              <span key={i} className={styles.feature}>
                <span className={styles.featureDot} />
                {f}
              </span>
            ))}
          </div>
        )}

        <div className={styles.cardActions}>
          <button
            className={styles.cardCta}
            onClick={() => router.push(`/project/${project.id}`)}
          >
            <span>cat details.md</span>
            <FiArrowRight className={styles.ctaIcon} />
          </button>

          <div className={styles.cardLinks}>
            {project.repo && (
              <a
                href={project.repo}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.cardLink}
                aria-label="Repository"
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
                className={styles.cardLink}
                aria-label="Live demo"
                onClick={(e) => e.stopPropagation()}
              >
                <FiExternalLink />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Projects Component with ScrollTrigger ───────────── */

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
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        },
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className={styles.projectsWrapper}>
      <div ref={heroRef} className={styles.heroSection}>
        <ProjectsHero />
      </div>

      <div ref={listWrapperRef} className={styles.listWrapper}>
        <ProjectsList />
      </div>

      <Blog ref={blogRef} />
    </div>
  );
}