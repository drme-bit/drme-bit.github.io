'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiArrowRight, FiGithub } from 'react-icons/fi';
import { PROJECTS, STATUS } from '@/data/projectsData';
import styles from './ProjectsList.module.scss';

interface Project {
  id: string;
  title: string;
  url: string;
  repo?: string;
  desc: string;
  tech: string[];
  status: string;
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const status = STATUS[project.status as keyof typeof STATUS] || STATUS.ACTIVE;
  const router = useRouter();

  return (
    <div
      className={styles.card}
      style={{ animationDelay: `${index * 0.08}s` }}
      onClick={() => router.push(`/project/${project.id}`)}
    >
      <div className={styles.cardHeader}>
        <div className={styles.cardTitle}>{project.title}</div>
        <span className={`${styles.badge} ${styles[status.cls]}`}>
          {status.icon} {status.label}
        </span>
      </div>

      <p className={styles.cardDesc}>{project.desc}</p>

      <div className={styles.cardTech}>
        {project.tech.slice(0, 5).map((t) => (
          <span key={t} className={styles.techTag}>{t}</span>
        ))}
        {project.tech.length > 5 && (
          <span className={styles.techMore}>+{project.tech.length - 5}</span>
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

  return (
    <div className={`${styles.page}${mounted ? ` ${styles['is-mounted']}` : ''}`}>
      {/* Grid */}
      <main className={styles.grid}>
        {PROJECTS.map((project, i) => (
          <ProjectCard key={project.id} project={project as Project} index={i} />
        ))}
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <Link href="/" className={styles.footerHome}>
          <FiArrowLeft size={14} />
          <span>back to home</span>
        </Link>
      </footer>
    </div>
  );
}
