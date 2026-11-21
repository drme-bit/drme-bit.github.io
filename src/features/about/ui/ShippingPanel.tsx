'use client';

import { useMemo, useState } from 'react';
import { FiArrowUpRight, FiGithub } from '@/shared/ui/Icon';
import { profile } from '@/entities/profile';
import useGithubStats from '@/shared/hooks/useGithubStats';
import { computeCurrentStreak } from '../lib/github';
import type { CommitInfo, HeatmapData } from '../lib/github';

export interface GithubSnapshot {
  commits: CommitInfo[];
  data: HeatmapData;
}

/*  A quiet read on shipping cadence — weekly rhythm bars plus the latest
    pushes. Deliberately not a dashboard: no counts grid, no stat wall.  */

function formatDay(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function WeekBars({
  weeks,
  weekMax,
  active,
  onHover,
}: {
  weeks: Array<{ start: string; count: number }> | null;
  weekMax: number;
  active: number | null;
  onHover: (index: number | null) => void;
}) {
  return (
    <div
      aria-hidden="true"
      onPointerLeave={() => onHover(null)}
      className="mt-5 flex h-28 items-end gap-[3px] sm:h-32"
    >
      {Array.from({ length: 52 }, (_, index) => {
        const week = weeks?.[index];
        const ratio = week ? week.count / weekMax : 0;
        const height = !week ? 24 + ((index * 37) % 52) : week.count === 0 ? 4 : 10 + ratio * 90;
        const isActive = active === index;
        return (
          <span
            key={week ? week.start : index}
            onPointerEnter={() => onHover(index)}
            className={`min-w-0 flex-1 rounded-t-[2px] transition-[height,background-color,opacity] duration-300 ${
              weeks ? '' : 'animate-pulse bg-[var(--border)]'
            } ${isActive ? 'opacity-100' : 'opacity-80'}`}
            style={
              weeks
                ? {
                    height: `${height}%`,
                    backgroundColor:
                      (week?.count ?? 0) === 0
                        ? 'var(--border)'
                        : `color-mix(in srgb, var(--accent-secondary) ${Math.round(
                            28 + ratio * 62,
                          )}%, transparent)`,
                  }
                : { height: `${height}%` }
            }
          />
        );
      })}
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="m-0 font-mono text-[0.54rem] uppercase tracking-[0.1em] text-[var(--text-ghost)] max-[767px]:text-[0.68rem]">
        {label}
      </dt>
      <dd className="m-0 mt-1 font-display text-[0.9rem] font-medium tabular-nums leading-none text-[var(--text)]">
        {value}
      </dd>
    </div>
  );
}

export function ShippingPanel({ snapshot }: { snapshot: GithubSnapshot | null }) {
  const stats = useGithubStats(profile.githubUsername);
  const [hot, setHot] = useState<number | null>(null);

  const weeks = useMemo(() => {
    if (!snapshot) return null;
    return snapshot.data.heatmap.map((week) => {
      const count = week.reduce((sum, cell) => sum + (snapshot.data.counts.get(cell.date) ?? 0), 0);
      return { start: week[0].date, count };
    });
  }, [snapshot]);

  const weekMax = useMemo(() => Math.max(1, ...(weeks ?? []).map((week) => week.count)), [weeks]);

  const streak = useMemo(
    () => (snapshot ? computeCurrentStreak(snapshot.data.counts) : 0),
    [snapshot],
  );

  const activeDays = useMemo(() => {
    if (!snapshot) return 0;
    let total = 0;
    snapshot.data.counts.forEach((count) => {
      if (count > 0) total += 1;
    });
    return total;
  }, [snapshot]);

  const commits = snapshot?.commits ?? [];
  const total = snapshot?.data.total ?? 0;
  const hovered = hot != null ? weeks?.[hot] : null;

  return (
    <div className="grid gap-3 lg:grid-cols-6">
      <article className="relative flex min-h-[260px] flex-col justify-between overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card-bg)] p-5 sm:p-6 lg:col-span-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-[var(--accent-secondary)] opacity-[0.06] blur-3xl"
        />
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="m-0 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-[var(--text-ghost)] max-[767px]:text-[0.7rem]">
            Contribution rhythm
          </p>
          <span
            aria-live="polite"
            className={`font-mono text-[0.6rem] tabular-nums transition-colors max-[767px]:text-[0.7rem] ${
              hovered ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-ghost)]'
            }`}
          >
            {hovered
              ? hovered.count === 0
                ? `${formatDay(hovered.start)} · quiet week`
                : `${formatDay(hovered.start)} · ${hovered.count} contribution${hovered.count === 1 ? '' : 's'}`
              : 'last 52 weeks'}
          </span>
        </header>

        <WeekBars weeks={weeks} weekMax={weekMax} active={hot} onHover={setHot} />

        <div className="mt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
          <div>
            <p className="m-0 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-semibold leading-none tabular-nums text-[var(--text)]">
              {snapshot ? total : '—'}
            </p>
            <p className="m-0 mt-1.5 text-[0.72rem] text-[var(--text-dim)]">
              contributions this year
            </p>
          </div>
          <dl className="m-0 flex flex-wrap gap-x-6 gap-y-3">
            <Stat value={snapshot ? `${streak}d` : '—'} label="streak" />
            <Stat value={snapshot ? String(activeDays) : '—'} label="active days" />
            <Stat value={stats ? String(stats.repos) : '—'} label="repos" />
          </dl>
        </div>
      </article>

      <article className="flex flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--card-bg)] lg:col-span-2">
        <header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
          <span className="inline-flex items-center gap-2 text-[0.78rem] font-medium text-[var(--text)]">
            <FiGithub size={14} aria-hidden="true" />
            Latest pushes
          </span>
          <a
            href={`https://github.com/${profile.githubUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${profile.githubUsername} on GitHub`}
            className="inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.08em] text-[var(--text-dim)] no-underline transition-colors hover:text-[var(--accent-secondary)] max-[767px]:text-[0.7rem]"
          >
            {profile.githubUsername}
            <FiArrowUpRight size={11} aria-hidden="true" />
          </a>
        </header>

        {!snapshot ? (
          <div className="animate-pulse space-y-4 p-5" aria-hidden="true">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="space-y-1.5">
                <div className="h-2.5 w-4/5 rounded bg-[var(--border)]" />
                <div className="h-2 w-1/2 rounded bg-[var(--border)]" />
              </div>
            ))}
          </div>
        ) : commits.length === 0 ? (
          <p className="m-0 flex flex-1 items-center px-5 py-6 text-[0.74rem] leading-[1.6] text-[var(--text-dim)]">
            No public pushes in the recent event window.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col p-0">
            {commits.slice(0, 3).map((commit) => (
              <li
                key={`${commit.hash}-${commit.repo}`}
                className="border-b border-[var(--border)] px-5 py-4 last:border-b-0"
              >
                <p className="m-0 truncate text-[0.78rem] leading-[1.5] text-[var(--text)]">
                  {commit.message || 'No commit message'}
                </p>
                <p className="m-0 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[0.56rem] text-[var(--text-ghost)]">
                  <span className="rounded border border-[var(--border)] px-1 py-px text-[var(--text-dim)]">
                    {commit.hash}
                  </span>
                  <span className="truncate">{commit.repo}</span>
                  <span aria-hidden="true">·</span>
                  <span>{commit.date}</span>
                </p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}
