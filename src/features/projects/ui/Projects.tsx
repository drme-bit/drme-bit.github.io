'use client';

import { useRouter } from 'next/navigation';
import useReveal from '@/shared/hooks/useReveal';
import useHorizontalScroll from '@/shared/hooks/useHorizontalScroll';
import useMergedRef from '@/shared/hooks/useMergedRef';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import Carousel from '@/shared/ui/molecules/Carousel/Carousel';
import { PROJECTS } from '@/data/projectsData';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import styles from './Projects.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface Project {
  id: string;
  title: string;
  desc: string;
  tech: string[];
  status?: string;
  image?: string | null;
  images?: string[];
  url?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  isActive: boolean;
}

/* ─── Data ───────────────────────────────────────────────── */

const STATUS_META: Record<string, { icon: string; cls: string; label: string }> = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

/* ─── Sub-components ─────────────────────────────────────── */

function ProjectCard({ project, index, isActive }: ProjectCardProps) {
  const router = useRouter();
  const meta = STATUS_META[project.status || 'ARCHIVED'] || STATUS_META.ARCHIVED;

  const handleClick = () => {
    router.push(`/project/${project.id}`);
  };

  return (
    <div className={`${styles['project-card']}${isActive ? ` ${styles['is-active']}` : ''}`}>
      <div className={styles['project-card-image']}>
        <Carousel
          images={project.images?.filter(Boolean) || (project.image ? [project.image] : [])}
          isActive={isActive}
          showThumbs={true}
        />
      </div>

      <div className={styles['project-card-content']}>
        <div className={styles['project-card-header']}>
          <span className={styles['project-card-id']}>
            <span className={styles['project-card-prompt']}>$</span>
            ./project_{String(index + 1).padStart(3, '0')}
          </span>
          <span className={`${styles['project-badge']} ${styles[meta.cls] || ''}`}>
            <span className={styles['project-badge-dot']}>{meta.icon}</span>
            {meta.label}
          </span>
        </div>

        <h3 className={styles['project-card-title']}>{project.title}</h3>

        <p className={styles['project-card-desc']}>{project.desc}</p>

        <div className={styles['project-card-tech']}>
          {project.tech.slice(0, 6).map((t: string) => (
            <span key={t} className={styles['project-tech-tag']}>{t}</span>
          ))}
          {project.tech.length > 6 && (
            <span className={styles['project-tech-more']}>+{project.tech.length - 6}</span>
          )}
        </div>

        <div className={styles['project-card-actions']}>
          <button className={styles['project-cta']} onClick={handleClick}>
            <span>cat details.md</span>
            <FiArrowRight className={styles['project-cta-icon']} />
          </button>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles['project-link']}
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink />
            </a>
          )}
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
    scrollNext,
    scrollPrev,
    handlers,
  } = useHorizontalScroll({
    itemCount: PROJECTS.length,
    snapThreshold: 0.15,
    firstItemDelay: 0.12,
  });
  const mergedRef = useMergedRef<HTMLElement>(containerRef, sectionRef);

  const count = PROJECTS.length;

  return (
    <section
      id="projects"
      ref={mergedRef}
      className={`${styles.section} ${styles['section--projects']} ${styles.reveal}${sectionVisible ? ` ${styles['is-visible']}` : ''}`}
      style={{ height: `${(count + 0.12) * 100}vh` }}
    >
      <div className={styles['projects-sticky']}>
        <div className={styles['projects-bg-glow']} />
        
        {/* Floating Code Snippets */}
        <div className={styles['projects-ambient']}>
          <div className={styles['floating-code']}>const project = await load(id);</div>
          <div className={styles['floating-code']}>git commit -m &quot;feat: new project&quot;</div>
          <div className={styles['floating-code']}>export default function Project() {'{'}</div>
        </div>

        <div className={styles['projects-inner']}>
          <SectionTitle
            title="system registry"
            accent="_"
            visible={sectionVisible}
          />

          <div className={styles['projects-header']}>
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

          <div className={styles['projects-viewport']} {...handlers}>
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
              <div className={styles['projects-progress-terminal']}>
                <span className={styles['projects-progress-label']}>$</span>
                <span>loading projects...</span>
              </div>
              <div className={styles['projects-progress-bar']}>
                <div
                  className={styles['projects-progress-fill']}
                  style={{ width: `${(progress * 100).toFixed(1)}%` }}
                />
              </div>
              <span className={styles['projects-progress-count']}>
                {currentIndex + 1}/{count}
              </span>
            </div>

            <div className={styles['projects-nav']}>
              <button
                className={styles['projects-nav-btn']}
                onClick={scrollPrev}
                disabled={currentIndex === 0}
              >
                ←
              </button>
              <button
                className={styles['projects-nav-btn']}
                onClick={scrollNext}
                disabled={currentIndex === count - 1}
              >
                →
              </button>
            </div>
          </div>

          <p className={styles['projects-hint']}>
            <span className={styles['projects-hint-icon']}>↕</span>
            Scroll to explore
          </p>
        </div>
      </div>
    </section>
  );
}
