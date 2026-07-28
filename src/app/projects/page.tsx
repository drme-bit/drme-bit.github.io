'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TransitionLink } from '@/features/transitions';
import { FiArrowRight, FiGithub } from '@/shared/ui/atoms/Icon';
import { projects } from '@/features/projects/lib/registry';
import { STATUS_META } from '@/features/projects/lib/constants';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ProjectsList.module.scss';

gsap.registerPlugin(ScrollTrigger);

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    url: string;
    repo?: string;
    desc: string;
    techNames: string[];
    status: string;
  };
  index: number;
}

function ProjectCard({ project, index }: ProjectCardProps) {
  const meta = STATUS_META[project.status] || STATUS_META.ACTIVE;
  const router = useRouter();

  return (
    <div
      className={styles.card}
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <span className={styles.cardIndex}>
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{project.title}</div>
        <span className={`${styles.badge} ${styles[meta.cls]}`}>
          <meta.icon size={10} /> {meta.label}
        </span>
      </div>

      <p className={styles.cardDesc}>{project.desc}</p>

      <div className={styles.cardTech}>
        {project.techNames.slice(0, 4).map((t) => (
          <span key={t} className={styles.techTag}>{t}</span>
        ))}
        {project.techNames.length > 4 && (
          <span className={styles.techMore}>+{project.techNames.length - 4}</span>
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

  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  useGSAP(
    () => {
      if (!gridRef.current) return;

      const cards = gridRef.current.querySelectorAll(`.${styles.card}`);
      if (cards.length) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          },
        );
      }
    },
    { scope: gridRef },
  );

  const allProjects = projects.all;

  return (
    <div className={`${styles.page}${mounted ? ` ${styles['is-mounted']}` : ''}`}>
      <header className={styles.hero}>
        <div className={styles.heroBreadcrumb}>
          <TransitionLink href="/">home</TransitionLink>
          <span>/</span>
          <span className={styles.heroBcCurrent}>projects</span>
        </div>

        <h1 className={styles.heroTitle}>
          projects<span className={styles.heroAccent}>.</span>
        </h1>
        <p className={styles.heroDesc}>
          A collection of things I&apos;ve built — from game server infrastructure
          to full-stack dashboards.
        </p>
        <div className={styles.heroLine} />
      </header>

      <main ref={gridRef} className={styles.grid}>
        {allProjects.map((project, i) => (
          <ProjectCard key={project.id} project={project as any} index={i} />
        ))}
      </main>

      <footer className={styles.footer}>
        <TransitionLink href="/" className={styles.footerHome}>
          &larr; back to home
        </TransitionLink>
      </footer>
    </div>
  );
}
