'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { FiX, FiChevronLeft, FiChevronRight, FiCopy } from '@/shared/ui/atoms/Icon';
import { useActivity } from '@/app/providers/ActivityProvider';
import { GROUP_COLORS } from '../lib';
import { SkillLevel } from './SkillLevel';
import { RelatedSkills } from './RelatedSkills';
import { HistoryBar } from './HistoryBar';
import { CompareView } from './CompareView';
import type { Skill } from '../lib';

interface SkillPanelProps {
  skill: Skill | null;
  history: Skill[];
  compareMode: boolean;
  compareSkill: Skill | null;
  onClose: () => void;
  onToggleCompare: () => void;
  onNavigateHistory: (direction: 'prev' | 'next') => void;
  onSelectHistory: (skill: Skill) => void;
  onSelectRelated: (skill: Skill) => void;
}

export function SkillPanel({
  skill,
  history,
  compareMode,
  compareSkill,
  onClose,
  onToggleCompare,
  onNavigateHistory,
  onSelectHistory,
  onSelectRelated,
}: SkillPanelProps) {
  const router = useRouter();
  const { incrementSkillsChecked } = useActivity();
  const countedSkillRef = useRef<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (skill && skill.name !== countedSkillRef.current) {
      countedSkillRef.current = skill.name;
      incrementSkillsChecked();
    }
  }, [skill, incrementSkillsChecked]);

  const renderSkillPanel = (s: Skill, _isCompare = false) => (
    <div className="sp-content p-0">
      <div className="mb-5 flex items-center gap-3.5 pr-10">
        <div
          className="flex size-[52px] shrink-0 items-center justify-center rounded-[var(--radius-lg)] [background:color-mix(in_srgb,var(--card-color,var(--accent-secondary))_12%,transparent)]"
          style={{ '--card-color': GROUP_COLORS[s.group] } as React.CSSProperties}
        >
          {s.icon && (
            <span className="flex size-[26px] items-center justify-center text-[var(--card-color,var(--accent-secondary))] [&>svg]:size-[26px]">
              <s.icon />
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className="block font-display text-[1.4rem] font-bold leading-[1.2]" style={{ color: GROUP_COLORS[s.group] }}>
            {s.name}
          </span>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">
            {s.category}/{s.group}
          </span>
        </div>
      </div>

      <div className="-mt-2 mb-3.5 flex items-center justify-between gap-2.5">
        <span
          className="rounded-[var(--radius-xs)] border border-current px-2 py-[3px] font-mono text-[0.58rem] uppercase tracking-[0.08em] [background:color-mix(in_srgb,currentColor_8%,transparent)]"
          style={{ color: GROUP_COLORS[s.group] }}
        >
          {s.category}
        </span>
        <div className="flex items-center gap-2" title={`difficulty ${s.difficulty}/5`}>
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.08em] text-[var(--text-ghost)]">difficulty</span>
          <span className="flex gap-[3px]">
            {[1, 2, 3, 4, 5].map((d) => (
              <span
                key={d}
                className={`h-1 w-2.5 rounded-[2px] transition-opacity duration-300 ${d <= s.difficulty ? 'opacity-100' : 'opacity-25'}`}
                style={{ background: d <= s.difficulty ? GROUP_COLORS[s.group] : undefined }}
              />
            ))}
          </span>
        </div>
      </div>

      <SkillLevel level={s.level} group={s.group} />

      {s.funLevel && (
        <p className="mb-4 [border-left:3px_solid_var(--accent-secondary)] bg-[var(--accent-secondary-glow)] px-3.5 py-2.5 font-mono text-[0.75rem] italic leading-[1.5] text-[var(--accent-secondary)]">
          &quot;{s.funLevel}&quot;
        </p>
      )}

      {s.desc && <p className="mb-5 text-[0.85rem] leading-[1.7] text-[var(--text-secondary)]">{s.desc}</p>}

      {s.relatedSkills.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-2.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">
            Works well with
          </h4>
          <RelatedSkills skill={s} onSelect={onSelectRelated} />
        </div>
      )}

      {s.usedInProjects.length > 0 && (
        <div className="mb-5">
          <h4 className="mb-2.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">
            Used In Projects
          </h4>
          <div className="flex flex-col gap-2.5">
            {s.usedInProjects.map((project) => (
              <button
                key={project.id}
                className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--glass)] p-2.5 text-left transition-all duration-200 hover:translate-x-1 hover:border-[color-mix(in_srgb,var(--accent-tertiary)_40%,transparent)] hover:bg-[var(--glass-strong)]"
                onClick={() => {
                  onClose();
                  router.push(`/projects/${project.id}`);
                }}
              >
                <div className="relative size-[60px_44px] shrink-0 overflow-hidden rounded-[var(--radius-sm)]">
                  {project.image && <img src={project.image} alt="" className="size-full object-cover" />}
                  <div className="absolute inset-0 [background:linear-gradient(135deg,transparent_40%,color-mix(in_srgb,var(--bg)_60%,transparent))]" />
                </div>
                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
                  <span className="truncate font-mono text-[0.7rem] font-medium text-[var(--text)]">{project.title}</span>
                  <div className="flex flex-wrap gap-1">
                    {project.techSkills.slice(0, 3).map((t) => (
                      <span
                        key={t.name}
                        className="rounded-[3px] bg-[color-mix(in_srgb,var(--accent-tertiary)_10%,transparent)] px-1.5 py-0.5 font-mono text-[0.5rem] text-[var(--accent-tertiary)]"
                      >
                        {t.name}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      ref={panelRef}
      className={`absolute right-6 top-1/2 z-[100] flex -translate-y-1/2 flex-col overflow-y-auto rounded-[var(--radius-xl)] border border-[var(--border)] bg-background p-6 shadow-[0_8px_40px_rgba(0,0,0,0.4)] transition-transform duration-500 ease-[var(--ease-out)] will-change-transform w-[360px] max-h-[70dvh] max-[900px]:right-4 max-[900px]:w-[320px] max-[900px]:max-h-[60dvh] max-[700px]:inset-x-4 max-[700px]:bottom-6 max-[700px]:top-auto max-[700px]:h-auto max-[700px]:w-auto max-[700px]:max-h-[55dvh] ${
        skill ? 'translate-x-0' : 'translate-x-[calc(100%+40px)]'
      } max-[700px]:translate-x-0 ${skill ? 'max-[700px]:translate-y-0' : 'max-[700px]:translate-y-[calc(100%+40px)]'} motion-reduce:transition-none`}
    >
      {skill && (
        <>
          <div className="mb-3 flex items-center justify-between">
            <button
              className="flex size-8 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--glass)] text-[var(--text-dim)] transition-all duration-200 hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
              onClick={onClose}
              aria-label="Close panel"
            >
              <FiX />
            </button>
            <div className="flex items-center gap-1.5">
              {history.length > 1 && (
                <div className="flex gap-1">
                  <button
                    className="flex size-7 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--glass)] text-[var(--text-dim)] transition-all duration-200 hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
                    onClick={() => onNavigateHistory('prev')}
                    aria-label="Previous skill"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    className="flex size-7 items-center justify-center rounded-[var(--radius-full)] border border-[var(--border)] bg-[var(--glass)] text-[var(--text-dim)] transition-all duration-200 hover:bg-[var(--glass-strong)] hover:text-[var(--text)]"
                    onClick={() => onNavigateHistory('next')}
                    aria-label="Next skill"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
              <button
                className={`flex size-8 items-center justify-center rounded-[var(--radius-full)] border bg-[var(--glass)] text-[var(--text-dim)] transition-all duration-200 hover:bg-[var(--glass-strong)] hover:text-[var(--text)] ${
                  compareMode
                    ? 'border-[var(--accent-secondary)] bg-[color-mix(in_srgb,var(--accent-secondary)_20%,transparent)] text-[var(--accent-secondary)]'
                    : 'border-[var(--border)]'
                }`}
                onClick={onToggleCompare}
                aria-label="Compare skills"
              >
                <FiCopy />
              </button>
            </div>
          </div>

          <HistoryBar history={history} selectedSkill={skill} onSelect={onSelectHistory} />

          <div className="[&_.sp-content_>*]:animate-[skills-panel-content-in_0.4s_cubic-bezier(0.16,1,0.3,1)_backwards] [&_.sp-content_>*]:[animation-delay:0.14s] [&_.sp-level-fill]:[transform-origin:left] [&_.sp-level-fill]:animate-[skills-panel-fill-in_0.6s_cubic-bezier(0.16,1,0.3,1)_backwards] [&_.sp-level-fill]:[animation-delay:0.46s] motion-reduce:[&_.sp-content_>*]:[animation:none] motion-reduce:[&_.sp-level-fill]:[animation:none]">
            {compareMode ? (
              <CompareView skillA={skill} skillB={compareSkill} renderSkillPanel={renderSkillPanel} />
            ) : (
              renderSkillPanel(skill)
            )}
          </div>
        </>
      )}
    </div>
  );
}