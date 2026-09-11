'use client';

import { GROUP_COLORS } from '../lib';
import type { Skill } from '../lib';

interface RelatedSkillsProps {
  skill: Skill;
  onSelect: (skill: Skill) => void;
}

export function RelatedSkills({ skill, onSelect }: RelatedSkillsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="shrink-0">
        {skill.icon ? (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-full [&>svg]:size-5 [&>svg]:text-[var(--bg)]"
            style={{ background: GROUP_COLORS[skill.group] }}
          >
            <skill.icon />
          </span>
        ) : (
          <span
            className="flex size-[36px] shrink-0 items-center justify-center rounded-full font-mono text-[0.6rem] font-semibold text-[var(--bg)]"
            style={{ background: GROUP_COLORS[skill.group] }}
          >
            {skill.name.slice(0, 2)}
          </span>
        )}
      </div>
      {skill.relatedSkills.map((r, i) => (
        <span key={r.name} style={{ display: 'contents' }}>
          {i > 0 && <span className="w-5 shrink-0 border-t border-[var(--border)]" />}
          <button
            className="group flex shrink-0 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--glass)] px-2.5 py-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--accent-secondary)_40%,transparent)] hover:bg-[var(--glass-strong)]"
            onClick={() => onSelect(r)}
          >
            <span
              className="flex size-2 shrink-0 items-center justify-center rounded-full [&>svg]:size-[6px] [&>svg]:text-[var(--bg)]"
              style={{ background: GROUP_COLORS[r.group] }}
            >
              {r.icon && <r.icon />}
            </span>
            <span className="whitespace-nowrap font-mono text-[0.65rem] text-[var(--text-dim)] transition-colors duration-200 group-hover:text-[var(--text)]">
              {r.name}
            </span>
          </button>
        </span>
      ))}
    </div>
  );
}