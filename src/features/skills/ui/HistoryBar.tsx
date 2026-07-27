'use client';

import { FiClock } from '@/shared/ui/atoms/Icon';
import styles from './Skills.module.scss';
import type { Skill } from '../lib';

interface HistoryBarProps {
  history: Skill[];
  selectedSkill: Skill | null;
  onSelect: (skill: Skill) => void;
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
