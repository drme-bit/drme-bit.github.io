'use client';

import { useMemo, useState, type CSSProperties } from 'react';
import { FiCode } from '@/shared/ui/Icon';
import { GROUP_COLORS, ICON_MAP, SKILLS_DATA } from '@/entities/skill';
import type { SkillData, SkillGroup } from '@/entities/skill';

/*  Left: a readable list of stack areas (hover previews a layer, click keeps it isolated).
    Right: the icon wall, used as a backdrop that fades out toward the list.  */

const GROUP_META: Array<{ id: SkillGroup; label: string }> = [
  { id: 'frontend', label: 'Frontend' },
  { id: 'backend', label: 'Backend' },
  { id: 'tools', label: 'Tooling' },
];

const GROUP_ORDER: SkillGroup[] = ['frontend', 'backend', 'tools'];
const SLOT_COUNT = 30;
const HOLES = new Set([2, 5, 9, 12, 17, 21, 27]);

/*  Fade the wall out toward the list (left on desktop, top on mobile).
    Standard and -webkit- versions are both needed for Safari.  */
const WALL_FADE =
  '[mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.35)_30%,#000_70%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,rgba(0,0,0,0.35)_30%,#000_70%)] max-md:[mask-image:linear-gradient(to_bottom,transparent_0%,#000_45%)] max-md:[-webkit-mask-image:linear-gradient(to_bottom,transparent_0%,#000_45%)]';

/*  Round-robin the groups so icon colors stay mixed across the wall.  */

function interleavedSkills(): SkillData[] {
  const buckets = GROUP_ORDER.map((group) =>
    SKILLS_DATA.filter((skill) => skill.group === group).sort((a, b) => b.level - a.level),
  );
  const longest = Math.max(...buckets.map((bucket) => bucket.length));
  const ordered: SkillData[] = [];
  for (let index = 0; index < longest; index++) {
    for (const bucket of buckets) {
      if (bucket[index]) ordered.push(bucket[index]);
    }
  }
  return ordered;
}

export function SkillsGrid() {
  const slots = useMemo(() => {
    const ordered = interleavedSkills();
    let cursor = 0;
    return Array.from({ length: SLOT_COUNT }, (_, slot) =>
      HOLES.has(slot) ? null : (ordered[cursor++] ?? null),
    );
  }, []);

  const groups = useMemo(
    () =>
      GROUP_META.map((group) => ({
        ...group,
        skills: SKILLS_DATA.filter((skill) => skill.group === group.id).sort(
          (a, b) => b.level - a.level,
        ),
      })),
    [],
  );

  const [selected, setSelected] = useState<SkillGroup | null>(null);
  const [hovered, setHovered] = useState<SkillGroup | null>(null);
  const focus = hovered ?? selected;

  return (
    <div className="relative grid w-full grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-center gap-x-4 max-md:grid-cols-1 max-md:gap-y-6">
      {/* ── Left: group list ───────────────────────────── */}
      <div className="relative z-10 flex min-w-0 flex-col gap-5">
        <ul
          aria-label="Filter stack by area"
          className="m-0 flex list-none flex-col border-y border-[var(--border)] p-0"
        >
          {groups.map((group) => {
            const accent = GROUP_COLORS[group.id];
            const active = focus === group.id;
            const muted = focus !== null && !active;
            return (
              <li key={group.id} className="border-t border-[var(--border)] first:border-t-0">
                <button
                  type="button"
                  aria-pressed={selected === group.id}
                  onClick={() => setSelected((current) => (current === group.id ? null : group.id))}
                  onPointerEnter={() => setHovered(group.id)}
                  onPointerLeave={() => setHovered(null)}
                  onFocus={() => setHovered(group.id)}
                  onBlur={() => setHovered(null)}
                  style={{ '--group-accent': accent } as CSSProperties}
                  className="group relative flex w-full cursor-pointer flex-col gap-2 bg-transparent py-5 pl-5 pr-2 text-left outline-none transition-opacity duration-300 focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--group-accent)_35%,transparent)]"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-4 bottom-4 w-px origin-top bg-[var(--group-accent)] transition-transform duration-300 ${
                      active ? 'scale-y-100' : 'scale-y-0'
                    }`}
                  />
                  <span className={`flex items-center gap-3 transition-opacity duration-300 ${muted ? 'opacity-45' : 'opacity-100'}`}>
                    <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-[var(--group-accent)]" />
                    <span
                      className={`text-[1rem] font-medium tracking-[-0.01em] transition-colors duration-200 ${
                        active ? 'text-[var(--text)]' : 'text-[var(--text-secondary)]'
                      }`}
                    >
                      {group.label}
                    </span>
                    <span className="ml-auto font-mono text-[0.68rem] text-[var(--text-ghost)]">
                      {String(group.skills.length).padStart(2, '0')}
                    </span>
                  </span>
                  <span
                    className={`pl-[1.125rem] text-[0.8rem] leading-[1.65] transition-[color,opacity] duration-300 ${
                      active ? 'text-[var(--text-secondary)]' : 'text-[var(--text-dim)]'
                    } ${muted ? 'opacity-45' : 'opacity-100'}`}
                  >
                    {group.skills.map((skill) => skill.name).join(' · ')}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="m-0 font-mono text-[0.53rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
          Hover or select a layer to isolate it
        </p>
      </div>

      {/* ── Right: icon wall as a fading backdrop ──────── */}
      <div className={`flex min-w-0 justify-end md:-ml-12 ${WALL_FADE}`}>
        <ul
          aria-label="Technologies I work with"
          onPointerLeave={() => setHovered(null)}
          className="skill-wall m-0 grid w-full max-w-[480px] list-none grid-cols-6 gap-1 p-0"
        >
          {slots.map((skill, slot) => {
            if (!skill) {
              return (
                <li
                  key={`slot-${slot}`}
                  aria-hidden="true"
                  className="skill-slot aspect-square rounded-md"
                />
              );
            }
            const Icon = ICON_MAP[skill.name] ?? FiCode;
            const dim = focus !== null && focus !== skill.group;
            return (
              <li
                key={skill.name}
                title={`${skill.name} · ${skill.level}/5 — ${skill.desc}`}
                style={{ '--tile-accent': GROUP_COLORS[skill.group] } as CSSProperties}
                onPointerEnter={() => setHovered(skill.group)}
                className={`skill-tile flex aspect-square items-center justify-center rounded-md border bg-[var(--card-bg)] transition-[opacity,border-color,background-color,transform] duration-300 ${
                  dim ? 'opacity-20' : 'opacity-100'
                }`}
              >
                <Icon className="skill-tile__icon" size={24} aria-hidden="true" />
                <span className="sr-only">
                  {skill.name} — {skill.level} out of 5
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}