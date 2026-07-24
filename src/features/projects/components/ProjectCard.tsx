'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image';
import { ICON_MAP } from '@/data/skillsData';
import { FiArrowRight, FiExternalLink, FiGithub } from 'react-icons/fi';
import { STATUS_META } from '../lib/constants';
import type { Project } from '../types/projects';
import styles from '../ui/Projects.module.scss';

interface ProjectCardProps {
  project: Project;
  index: number;
  isActive: boolean;
}

export function ProjectCard({ project, index, isActive }: ProjectCardProps) {
  const router = useRouter();
  const meta = STATUS_META[project.status || 'ARCHIVED'] || STATUS_META.ARCHIVED;

  const handleClick = () => {
    router.push(`/project/${project.id}`);
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--mouse-x', `${x}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}%`);
  }, []);

  const bgImage = project.image || project.images?.[0] || '';

  return (
    <div className={`${styles['projects-card']}${isActive ? ` ${styles['is-active']}` : ''}`}>
      <div className={styles['projects-card-bg']}>
        {bgImage && <Image src={bgImage} alt="" className={styles['projects-card-bg-img']} fill />}
        <div className={styles['projects-card-bg-overlay']} />
      </div>

      <div
        className={styles['projects-card-glass']}
        onMouseMove={handleMouseMove}
      >
        <div className={styles['projects-card-glass-inner']}>
          <div className={styles['projects-card-header']}>
            <span className={`${styles['projects-badge']} ${styles[meta.cls] || ''}`}>
              <span className={styles['projects-badge-dot']}>{meta.icon}</span>
              {meta.label}
            </span>
            <span className={styles['projects-card-id']}>
              ./project_{String(index + 1).padStart(3, '0')}
            </span>
          </div>

          <h3 className={styles['projects-card-title']}>{project.title}</h3>

          <p className={styles['projects-card-desc']}>{project.desc}</p>

          <div className={styles['projects-card-meta']}>
            {project.logo && (
              <div className={styles['projects-card-logo']}>
                <Image src={project.logo} alt="" width={28} height={28} />
              </div>
            )}
            {project.stages && project.stages.length > 0 && (
              <span className={styles['projects-meta-item']}>
                <span className={styles['projects-meta-value']}>{project.stages.length}</span>
                <span className={styles['projects-meta-label']}>stages</span>
              </span>
            )}
            {project.tech && (
              <span className={styles['projects-meta-item']}>
                <span className={styles['projects-meta-value']}>{project.tech.length}</span>
                <span className={styles['projects-meta-label']}>tech</span>
              </span>
            )}
          </div>

          <div className={styles['projects-card-tech']}>
            {project.tech.slice(0, 6).map((t: string) => {
              const Icon = ICON_MAP[t];
              return (
                <span key={t} className={styles['projects-tech-tag']}>
                  {Icon && <Icon className={styles['projects-tech-icon']} />}
                  {t}
                </span>
              );
            })}
            {project.tech.length > 6 && (
              <span className={styles['projects-tech-more']}>+{project.tech.length - 6}</span>
            )}
          </div>

          {project.features && project.features.length > 0 && (
            <div className={styles['projects-card-features']}>
              {project.features.slice(0, 2).map((f, i) => (
                <span key={i} className={styles['projects-feature']}>
                  <span className={styles['projects-feature-dot']} />
                  {f}
                </span>
              ))}
              {project.features.length > 2 && (
                <span className={styles['projects-feature-more']}>
                  +{project.features.length - 2} more
                </span>
              )}
            </div>
          )}

          {project.architecture && (
            <div className={styles['projects-card-arch']}>
              <span className={styles['projects-card-arch-label']}>arch</span>
              <span className={styles['projects-card-arch-text']}>
                {project.architecture.length > 80
                  ? project.architecture.slice(0, 80) + '...'
                  : project.architecture}
              </span>
            </div>
          )}

          {project.challenges && (
            <div className={styles['projects-card-challenges']}>
              <span className={styles['projects-card-challenges-label']}>challenges</span>
              <span className={styles['projects-card-challenges-text']}>
                {project.challenges.length > 80
                  ? project.challenges.slice(0, 80) + '...'
                  : project.challenges}
              </span>
            </div>
          )}

          <div className={styles['projects-card-actions']}>
            <button className={styles['projects-cta']} onClick={handleClick}>
              <span>cat details.md</span>
              <FiArrowRight className={styles['projects-cta-icon']} />
            </button>
            <div className={styles['projects-card-links']}>
              {project.repo && (
                <a
                  href={project.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles['projects-link']}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Repository"
                >
                  <FiGithub />
                </a>
              )}
              {project.url && project.url !== '#' && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles['projects-link']}
                  onClick={(e) => e.stopPropagation()}
                  aria-label="Live demo"
                >
                  <FiExternalLink />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
