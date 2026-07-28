'use client';

import { useRouter } from 'next/navigation';
import { FiX, FiChevronLeft, FiChevronRight, FiCopy } from '@/shared/ui/atoms/Icon';
import { graph, GROUP_COLORS } from '../lib';
import { projects } from '@/features/projects/lib/registry';
import { SkillLevel } from './SkillLevel';
import { RelatedSkills } from './RelatedSkills';
import { HistoryBar } from './HistoryBar';
import { CompareView } from './CompareView';
import type { Skill } from '../lib';
import styles from './Skills.module.scss';

interface SkillPanelProps {
  skill: Skill | null;
  history: Skill[];
  compareMode: boolean;
  compareSkill: Skill | null;
  onClose: () => void;
  onToggleCompare: () => void;
  onNavigateHistory: (direction: 'prev' | 'next') => void;
  onSelectHistory: (skill: Skill) => void;
  onSelectRelated: (skill: Skill) => void;
}

export function SkillPanel({
  skill,
  history,
  compareMode,
  compareSkill,
  onClose,
  onToggleCompare,
  onNavigateHistory,
  onSelectHistory,
  onSelectRelated,
}: SkillPanelProps) {
  const router = useRouter();

  const renderSkillPanel = (s: Skill, isCompare = false) => (
    <div className={styles['skills-panel-content']}>
      <div className={styles['skills-panel-header']}>
        <div
          className={styles['skills-panel-icon-wrap']}
          style={{ '--card-color': GROUP_COLORS[s.group] } as React.CSSProperties}
        >
          {s.icon && (
            <span className={styles['skills-panel-icon']}>
              <s.icon />
            </span>
          )}
        </div>
        <div className={styles['skills-panel-titles']}>
          <span className={styles['skills-panel-name']} style={{ color: GROUP_COLORS[s.group] }}>
            {s.name}
          </span>
          <span className={styles['skills-panel-group']}>
            {s.category}/{s.group}
          </span>
        </div>
      </div>

      <SkillLevel level={s.level} group={s.group} />

      {s.funLevel && <p className={styles['skills-panel-fun']}>&quot;{s.funLevel}&quot;</p>}

      {s.desc && <p className={styles['skills-panel-desc']}>{s.desc}</p>}

      {s.relatedSkills.length > 0 && (
        <div className={styles['skills-panel-section']}>
          <h4 className={styles['skills-panel-section-title']}>Works well with</h4>
          <RelatedSkills skill={s} onSelect={onSelectRelated} />
        </div>
      )}

      {s.usedInProjects.length > 0 && (
        <div className={styles['skills-panel-section']}>
          <h4 className={styles['skills-panel-section-title']}>Used In Projects</h4>
          <div className={styles['skills-panel-projects']}>
            {s.usedInProjects.map((project) => (
              <button
                key={project.id}
                className={styles['skills-panel-project-card']}
                onClick={() => {
                  onClose();
                  router.push(`/projects/${project.id}`);
                }}
              >
                <div className={styles['skills-panel-project-image']}>
                  {project.image && (
                    <img
                      src={project.image}
                      alt=""
                      className={styles['skills-panel-project-img']}
                    />
                  )}
                  <div className={styles['skills-panel-project-overlay']} />
                </div>
                <div className={styles['skills-panel-project-info']}>
                  <span className={styles['skills-panel-project-title']}>{project.title}</span>
                  <div className={styles['skills-panel-project-tech']}>
                    {project.techSkills.slice(0, 3).map((t) => (
                      <span key={t.name} className={styles['skills-panel-project-tech-tag']}>
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`${styles['skills-panel']} ${skill ? styles['is-open'] : ''}`}>
      {skill && (
        <>
          <div className={styles['skills-panel-toolbar']}>
            <button className={styles['skills-panel-close']} onClick={onClose} aria-label="Close panel">
              <FiX />
            </button>
            <div className={styles['skills-panel-toolbar-actions']}>
              {history.length > 1 && (
                <div className={styles['skills-panel-history-nav']}>
                  <button className={styles['skills-panel-nav-btn']} onClick={() => onNavigateHistory('prev')} aria-label="Previous skill">
                    <FiChevronLeft />
                  </button>
                  <button className={styles['skills-panel-nav-btn']} onClick={() => onNavigateHistory('next')} aria-label="Next skill">
                    <FiChevronRight />
                  </button>
                </div>
              )}
              <button
                className={`${styles['skills-panel-compare-btn']} ${compareMode ? styles['is-active'] : ''}`}
                onClick={onToggleCompare}
                aria-label="Compare skills"
              >
                <FiCopy />
              </button>
            </div>
          </div>

          <HistoryBar history={history} selectedSkill={skill} onSelect={onSelectHistory} />

          {compareMode ? (
            <CompareView skillA={skill} skillB={compareSkill} renderSkillPanel={renderSkillPanel} />
          ) : (
            renderSkillPanel(skill)
          )}
        </>
      )}
    </div>
  );
}
