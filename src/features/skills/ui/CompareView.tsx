'use client';

import { FiMousePointer } from '@/shared/ui/atoms/Icon';
import styles from './Skills.module.scss';
import type { Skill } from '../lib';

interface CompareViewProps {
  skillA: Skill;
  skillB: Skill | null;
  renderSkillPanel: (skill: Skill, isCompare?: boolean) => React.ReactNode;
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
