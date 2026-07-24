'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Image from 'next/image'
import useReveal from '@/shared/hooks/useReveal';
import useHorizontalScroll from '@/shared/hooks/useHorizontalScroll';
import useMergedRef from '@/shared/hooks/useMergedRef';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import { PROJECTS } from '@/data/projectsData';
import { ICON_MAP, GROUP_COLORS } from '@/data/skillsData';
import { FiArrowRight, FiExternalLink, FiGithub } from 'react-icons/fi';
import styles from './Projects.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface Project {
  id: string;
  title: string;
  desc: string;
  fullDesc?: string;
  tech: string[];
  status?: string;
  image?: string | null;
  images?: string[];
  url?: string;
  repo?: string;
  features?: string[];
  logo?: string | null;
  stages?: { title: string; duration: string; desc: string }[];
  architecture?: string;
  challenges?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isActive: boolean;
}

/* ─── Data ───────────────────────────────────────────────── */

const STATUS_META: Record<string, { icon: string; cls: string; label: string }> = {
  ACTIVE: { icon: '>', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '//', cls: 'badge--archived', label: 'archived' },
};

/* ─── Sub-components ─────────────────────────────────────── */

function ProjectCard({ project, index, isActive }: ProjectCardProps) {
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
        {bgImage && <Image src={bgImage} alt="" className={styles['projects-card-bg-img']} fill/>}
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

/* ─── Projects ───────────────────────────────────────────── */

export default function Projects() {
  const [sectionRef, sectionVisible] = useReveal();
  const {
    progress,
    currentIndex,
    containerRef,
  } = useHorizontalScroll({
    itemCount: PROJECTS.length,
    snapThreshold: 0.15,
    firstItemDelay: 0.5,
  });
  const mergedRef = useMergedRef<HTMLElement>(containerRef, sectionRef);

  const count = PROJECTS.length;

  return (
    <section
      id="projects"
      ref={mergedRef}
      className={`${styles.section} ${styles['section--projects']} ${styles.reveal}${sectionVisible ? ` ${styles['is-visible']}` : ''}`}
      style={{ height: `${(count - 1) * 100 + 100}vh` }}
    >
      <div className={styles['projects-sticky']}>
        <div className={styles['projects-inner']}>
          <div className={styles['projects-top']}>
            <SectionTitle
              title="system registry"
              accent="_"
              visible={sectionVisible}
            />
            <div className={styles['projects-counter']}>
              <span className={styles['projects-counter-current']}>
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className={styles['projects-counter-sep']}>/</span>
              <span className={styles['projects-counter-total']}>
                {String(count).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className={styles['projects-viewport']}>
            <div className={styles['projects-track']} data-track>
              {PROJECTS.map((project: Project, i: number) => (
                <div key={project.id} className={styles['projects-track-item']}>
                  <ProjectCard
                    project={project}
                    index={i}
                    isActive={i === currentIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles['projects-footer']}>
            <div className={styles['projects-progress']}>
              <div className={styles['projects-progress-bar']}>
                <div
                  className={styles['projects-progress-fill']}
                  style={{ width: `${(progress * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
