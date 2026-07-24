'use client';

import useReveal from '@/shared/hooks/useReveal';
import useHorizontalScroll from '@/shared/hooks/useHorizontalScroll';
import useMergedRef from '@/shared/hooks/useMergedRef';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import { PROJECTS } from '@/data/projectsData';
import { ProjectCard } from '../components/ProjectCard';
import styles from '../ui/Projects.module.scss';

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
    firstItemDelay: 0.25,
  });
  const mergedRef = useMergedRef<HTMLElement>(containerRef, sectionRef);

  const count = PROJECTS.length;

  return (
    <section
      id="projects"
      ref={mergedRef}
      className={`${styles.section} ${styles['section--projects']} ${styles.reveal}${sectionVisible ? ` ${styles['is-visible']}` : ''}`}
      style={{ height: `${(count - 1) * 100 + 80}vh` }}
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
              {PROJECTS.map((project, i: number) => (
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
