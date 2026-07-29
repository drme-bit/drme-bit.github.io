'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { TransitionLink } from '@/features/transitions';
import { FiArrowRight, FiGithub } from '@/shared/ui/atoms/Icon';
import { projects } from '@/features/projects/lib/registry';
import { STATUS_META } from '@/features/projects/lib/constants';
import { ICON_MAP } from '@/features/skills/lib/registry';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Project } from '@/features/projects/lib/project-repository';
import styles from './ProjectsList.module.scss';

gsap.registerPlugin(ScrollTrigger);

function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || STATUS_META.ACTIVE;
  return (
    <span className={`${styles.badge} ${styles[meta.cls] || ''}`}>
      <meta.icon size={10} />
      {meta.label}
    </span>
  );
}

function TechChip({ name }: { name: string }) {
  const Icon = ICON_MAP[name];
  return (
    <span className={styles.techChip}>
      {Icon && <Icon className={styles.techIcon} />}
      {name}
    </span>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width) * 100}%`);
    el.style.setProperty('--mouse-y', `${((e.clientY - rect.top) / rect.height) * 100}%`);
  }, []);

  return (
    <div
      ref={cardRef}
      className={styles.card}
      onMouseMove={handleMouseMove}
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      <div className={styles.cardGlow} />

      <div className={styles.cardHeader}>
        <span className={styles.cardIndex}>{String(index + 1).padStart(2, '0')}</span>
        <StatusBadge status={project.status} />
      </div>

      <h2 className={styles.cardTitle}>{project.title}</h2>

      <p className={styles.cardDesc}>{project.desc}</p>

      <div className={styles.cardTech}>
        {project.techNames.slice(0, 5).map((t) => (
          <TechChip key={t} name={t} />
        ))}
        {project.techNames.length > 5 && (
          <span className={styles.techMore}>+{project.techNames.length - 5}</span>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardLink}>
          view project <FiArrowRight size={11} className={styles.cardArrow} />
        </span>
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cardRepo}
            onClick={(e) => e.stopPropagation()}
          >
            <FiGithub size={13} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProjectsList() {
  const [mounted, setMounted] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useGSAP(
    () => {
      const title = titleRef.current;
      const subtitle = subtitleRef.current;
      const stats = statsRef.current;

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      if (title) tl.fromTo(title, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8 }, 0.1);
      if (subtitle) tl.fromTo(subtitle, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.25);
      if (stats) tl.fromTo(stats, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5 }, 0.35);

      if (!gridRef.current) return;
      const cards = gridRef.current.querySelectorAll(`.${styles.card}`);
      if (cards.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
      }
    },
    { scope: gridRef },
  );

  const allProjects = projects.all;
  const stats = projects.stats;

  return (
    <div className={`${styles.page}${mounted ? ` ${styles['is-mounted']}` : ''}`}>
      <header className={styles.hero}>
        <div className={styles.heroGrid} />

        <div className={styles.heroContent}>
          <nav className={styles.heroBreadcrumb}>
            <TransitionLink href="/">home</TransitionLink>
            <span className={styles.bcSep}>/</span>
            <span className={styles.bcCurrent}>projects</span>
          </nav>

          <h1 ref={titleRef} className={styles.heroTitle}>
            pr<span className={styles.heroAccent}>o</span>jects<span className={styles.heroDot}>.</span>
          </h1>

          <p ref={subtitleRef} className={styles.heroDesc}>
            what i&apos;ve built
          </p>

          <div ref={statsRef} className={styles.heroStats}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.total}</span>
              <span className={styles.statLabel}>total</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.active}</span>
              <span className={styles.statLabel}>active</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.paused}</span>
              <span className={styles.statLabel}>paused</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>{stats.deprecated}</span>
              <span className={styles.statLabel}>archived</span>
            </div>
          </div>
        </div>
      </header>

      <main ref={gridRef} className={styles.grid}>
        {allProjects.map((project, i) => (
          <ProjectCard key={project.id} project={project} index={i} />
        ))}
      </main>

      <footer className={styles.footer}>
        <TransitionLink href="/" className={styles.footerHome}>
          <span className={styles.footerArrow}>&larr;</span> back to home
        </TransitionLink>
      </footer>
    </div>
  );
}
