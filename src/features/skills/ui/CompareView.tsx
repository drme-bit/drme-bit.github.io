'use client';

import { FiMousePointer } from '@/shared/ui/atoms/Icon';
import type { Skill } from '../lib';

interface CompareViewProps {
  skillA: Skill;
  skillB: Skill | null;
  renderSkillPanel: (skill: Skill, isCompare?: boolean) => React.ReactNode;
}

export function CompareView({ skillA, skillB, renderSkillPanel }: CompareViewProps) {
  return (
    <div className="grid grid-cols-[1fr_auto_1fr]">
      <div className="min-w-0 overflow-hidden">{renderSkillPanel(skillA)}</div>
      <div className="flex items-center justify-center px-2">
        <span className="font-mono text-[0.65rem] uppercase text-[var(--text-ghost)]">vs</span>
      </div>
      <div className="flex min-w-0 items-center overflow-hidden">
        {skillB ? (
          renderSkillPanel(skillB, true)
        ) : (
          <div className="flex min-h-[200px] w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-[var(--border)] bg-[var(--glass)] font-mono text-[0.65rem] text-[var(--text-ghost)]">
            <FiMousePointer />
            <span>Click a skill on the globe</span>
          </div>
        )}
      </div>
    </div>
  );
}