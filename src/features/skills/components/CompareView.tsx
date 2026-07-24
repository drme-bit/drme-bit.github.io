'use client';

import { FiMousePointer } from 'react-icons/fi';
import type { SkillItem } from '../types/skills';
import styles from '../ui/Skills.module.scss';

interface CompareViewProps {
  skillA: SkillItem;
  skillB: SkillItem | null;
  renderSkillPanel: (skill: SkillItem, isCompare?: boolean) => React.ReactNode;
}

export function CompareView({ skillA, skillB, renderSkillPanel }: CompareViewProps) {
  return (
    <div className={styles['skills-panel-compare']}>
      <div className={styles['skills-panel-compare-slot']}>
        {renderSkillPanel(skillA)}
      </div>
      <div className={styles['skills-panel-compare-divider']}>
        <span className={styles['skills-panel-compare-vs']}>vs</span>
      </div>
      <div className={`${styles['skills-panel-compare-slot']} ${styles['skills-panel-compare-slot--empty']}`}>
        {skillB ? (
          renderSkillPanel(skillB, true)
        ) : (
          <div className={styles['skills-panel-compare-placeholder']}>
            <FiMousePointer />
            <span>Click a skill on the globe</span>
          </div>
        )}
      </div>
    </div>
  );
}
