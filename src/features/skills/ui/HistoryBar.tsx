'use client';

import { FiClock } from '@/shared/ui/atoms/Icon';
import type { Skill } from '../lib';

interface HistoryBarProps {
  history: Skill[];
  selectedSkill: Skill | null;
  onSelect: (skill: Skill) => void;
}

export function HistoryBar({ history, selectedSkill, onSelect }: HistoryBarProps) {
  if (history.length === 0) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--glass)] px-2.5 py-2">
      <FiClock className="size-3.5 shrink-0 text-[var(--text-ghost)]" />
      <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {history.map((h) => (
          <button
            key={h.name}
            className={`whitespace-nowrap rounded-[var(--radius-sm)] border px-2 py-[3px] font-mono text-[0.6rem] text-[var(--text-dim)] transition-all duration-150 hover:bg-[var(--glass-strong)] hover:text-[var(--text)] ${
              h.name === selectedSkill?.name
                ? 'border-[color-mix(in_srgb,var(--accent-secondary)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-secondary)_15%,transparent)] text-[var(--accent-secondary)]'
                : 'border-transparent'
            }`}
            onClick={() => onSelect(h)}
          >
            {h.name}
          </button>
        ))}
      </div>
    </div>
  );
}