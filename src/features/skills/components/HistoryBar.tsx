'use client';

import { FiClock } from 'react-icons/fi';
import type { SkillItem } from '../types/skills';
import styles from '../ui/Skills.module.scss';

interface HistoryBarProps {
  history: SkillItem[];
  selectedSkill: SkillItem | null;
  onSelect: (skill: SkillItem) => void;
}

export function HistoryBar({ history, selectedSkill, onSelect }: HistoryBarProps) {
  if (history.length === 0) return null;

  return (
    <div className={styles['skills-panel-history']}>
      <FiClock className={styles['skills-panel-history-icon']} />
      <div className={styles['skills-panel-history-list']}>
        {history.map((h) => (
          <button
            key={h.name}
            className={`${styles['skills-panel-history-item']} ${h.name === selectedSkill?.name ? styles['is-active'] : ''}`}
            onClick={() => onSelect(h)}
          >
            {h.name}
          </button>
        ))}
      </div>
    </div>
  );
}
