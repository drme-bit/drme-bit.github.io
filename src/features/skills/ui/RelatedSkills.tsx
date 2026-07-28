'use client';

import { graph, GROUP_COLORS, ICON_MAP } from '../lib';
import styles from './Skills.module.scss';
import type { Skill } from '../lib';

interface RelatedSkillsProps {
  skill: Skill;
  onSelect: (skill: Skill) => void;
}

export function RelatedSkills({ skill, onSelect }: RelatedSkillsProps) {
  return (
    <div className={styles['skills-panel-related']}>
      <div className={styles['skills-panel-related-center']}>
        {skill.icon ? (
          <span className={styles['skills-panel-related-icon']} style={{ background: GROUP_COLORS[skill.group] }}>
            <skill.icon />
          </span>
        ) : (
          <span className={styles['skills-panel-related-node']} style={{ background: GROUP_COLORS[skill.group] }}>
            {skill.name.slice(0, 2)}
          </span>
        )}
      </div>
      {skill.relatedSkills.map((r, i) => (
        <span key={r.name} style={{ display: 'contents' }}>
          {i > 0 && <span className={styles['skills-panel-related-separator']} />}
          <button
            className={styles['skills-panel-related-item']}
            onClick={() => onSelect(r)}
          >
            <span className={styles['skills-panel-related-dot']} style={{ background: GROUP_COLORS[r.group] }}>
              {r.icon && <r.icon />}
            </span>
            <span className={styles['skills-panel-related-name']}>{r.name}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
