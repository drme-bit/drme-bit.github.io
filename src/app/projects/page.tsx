'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight, FiGithub } from '@/shared/ui/atoms/Icon';
import { projects } from '@/features/projects/lib/registry';
import { STATUS_META } from '@/features/projects/lib/constants';
import styles from './ProjectsList.module.scss';

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
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{project.title}</div>
        <span className={`${styles.badge} ${styles[meta.cls]}`}>
          <meta.icon size={11} /> {meta.label}
        </span>
      </div>

      <p className={styles.cardDesc}>{project.desc}</p>

      <div className={styles.cardTech}>
        {project.techNames.slice(0, 5).map((t) => (
          <span key={t} className={styles.techTag}>{t}</span>
        ))}
        {project.techNames.length > 5 && (
          <span className={styles.techMore}>+{project.techNames.length - 5}</span>
        )}
      </div>

      <div className={styles.cardFooter}>
        <span className={styles.cardLink}>
          view project <FiArrowRight size={12} />
        </span>
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.cardRepo}
            onClick={(e) => e.stopPropagation()}
          >
            <FiGithub size={12} />
          </a>
        )}
      </div>
    </div>
  );
}

export default function ProjectsList() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const allProjects = projects.all;

  return (
    <div className={`${styles.page}${mounted ? ` ${styles['is-mounted']}` : ''}`}>
      <main className={styles.grid}>
        {allProjects.map((project, i) => (
          <ProjectCard key={project.id} project={project as any} index={i} />
        ))}
      </main>

      <footer className={styles.footer}>
        <Link href="/" className={styles.footerHome}>
          <FiArrowLeft size={14} />
          <span>back to home</span>
        </Link>
      </footer>
    </div>
  );
}
