'use client';

import { LEVEL_LABELS, GROUP_COLORS } from '../lib';

interface SkillLevelProps {
  level: number;
  group: string;
}

export function SkillLevel({ level, group }: SkillLevelProps) {
  return (
    <div className="mb-4 flex items-center gap-3">
      <div className="h-1 flex-1 overflow-hidden rounded-[2px] [background:color-mix(in_srgb,var(--text-ghost)_20%,transparent)]">
        <div
          className="sp-level-fill h-full origin-left rounded-[2px]"
          style={{ width: `${(level / 5) * 100}%`, background: GROUP_COLORS[group] }}
        />
      </div>
      <span className="whitespace-nowrap font-mono text-[0.7rem] font-medium" style={{ color: GROUP_COLORS[group] }}>
        {LEVEL_LABELS[level]}
      </span>
    </div>
  );
}