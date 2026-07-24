'use client';

import { ICON_MAP, GROUP_COLORS, SKILLS_DATA } from '@/data/skillsData';
import type { SkillItem } from '../types/skills';
import styles from '../ui/Skills.module.scss';

interface RelatedSkillsProps {
  skill: SkillItem;
  onSelect: (skill: SkillItem) => void;
}

export function RelatedSkills({ skill, onSelect }: RelatedSkillsProps) {
  return (
    <div className={styles['skills-panel-related']}>
      <div className={styles['skills-panel-related-center']}>
        {ICON_MAP[skill.name] ? (
          <span className={styles['skills-panel-related-icon']} style={{ background: GROUP_COLORS[skill.group] }}>
            {(() => { const Icon = ICON_MAP[skill.name]; return <Icon />; })()}
          </span>
        ) : (
          <span className={styles['skills-panel-related-node']} style={{ background: GROUP_COLORS[skill.group] }}>
            {skill.name.slice(0, 2)}
          </span>
        )}
      </div>
      {skill.related.map((r, i) => {
        const relatedSkill = SKILLS_DATA.find((s: SkillItem) => s.name === r);
        const RelatedIcon = ICON_MAP[r];
        return (
          <span key={r} style={{ display: 'contents' }}>
            {i > 0 && <span className={styles['skills-panel-related-separator']} />}
            <button
              className={styles['skills-panel-related-item']}
              onClick={() => { if (relatedSkill) onSelect(relatedSkill); }}
            >
              <span className={styles['skills-panel-related-dot']} style={{ background: relatedSkill ? GROUP_COLORS[relatedSkill.group] : 'var(--border)' }}>
                {RelatedIcon && <RelatedIcon />}
              </span>
              <span className={styles['skills-panel-related-name']}>{r}</span>
            </button>
          </span>
        );
      })}
    </div>
  );
}
