'use client';

import { LEVEL_LABELS } from '../lib/constants';
import { GROUP_COLORS } from '@/data/skillsData';
import styles from '../ui/Skills.module.scss';

interface SkillLevelProps {
  level: number;
  group: string;
}

export function SkillLevel({ level, group }: SkillLevelProps) {
  return (
    <div className={styles['skills-panel-level']}>
      <div className={styles['skills-panel-level-bar']}>
        <div
          className={styles['skills-panel-level-fill']}
          style={{ width: `${(level / 5) * 100}%`, background: GROUP_COLORS[group] }}
        />
      </div>
      <span className={styles['skills-panel-level-label']} style={{ color: GROUP_COLORS[group] }}>
        {LEVEL_LABELS[level]}
      </span>
    </div>
  );
}
