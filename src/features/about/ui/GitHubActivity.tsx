'use client';

import { useEffect, useMemo, useState } from 'react';
import { FiGitCommit } from '@/shared/ui/atoms/Icon';
import { useInView } from '@/shared/hooks/useInView';
import { profile } from '@/entities/profile';
import { loadActivity, buildHeatmap } from '../lib/github';
import type { CommitInfo, HeatmapCell } from '../lib/github';
import styles from './About.module.scss';

function HeatmapGrid({
  heatmap,
  counts,
  onHover,
}: {
  heatmap: HeatmapCell[][];
  counts: ReadonlyMap<string, number>;
  onHover: (cell: { date: string; count: number } | null) => void;
}) {
  const monthLabels = useMemo(() => {
    const out: Array<{ index: number; label: string }> = [];
    heatmap.forEach((week, i) => {
      for (const cell of week) {
        const date = new Date(`${cell.date}T00:00:00Z`);
        if (date.getUTCDate() === 1) {
          out.push({ index: i, label: date.toLocaleString('en-US', { month: 'short' }) });
          break;
        }
      }
    });
    return out;
  }, [heatmap]);

  const cellClass = (level: number) =>
    level === 0 ? styles['ab-heatmap-cell--0']
    : level === 1 ? styles['ab-heatmap-cell--1']
    : level === 2 ? styles['ab-heatmap-cell--2']
    : level === 3 ? styles['ab-heatmap-cell--3']
    : styles['ab-heatmap-cell--4'];

  return (
    <div className={styles['ab-heatmap']}>
      <div className={styles['ab-heatmap-months']}>
        {monthLabels.map((m) => (
          <span key={`${m.index}-${m.label}`} className={styles['ab-heatmap-month']} style={{ left: `${m.index * 13}px` }}>
            {m.label}
          </span>
        ))}
      </div>
      <div className={styles['ab-heatmap-grid']}>
        {heatmap.map((week, wi) => (
          <div key={wi} className={styles['ab-heatmap-col']}>
            {week.map((cell) => (
              <span
                key={cell.date}
                className={`${styles['ab-heatmap-cell']} ${cellClass(cell.level)}`}
                title={`${cell.date} · ${counts.get(cell.date) ?? 0} contributions`}
                onPointerEnter={() => onHover({ date: cell.date, count: counts.get(cell.date) ?? 0 })}
                onPointerLeave={() => onHover(null)}
              />
            ))}
          </div>
        ))}
      </div>
      <div className={styles['ab-heatmap-legend']} aria-hidden="true">
        <span>less</span>
        {[0, 1, 2, 3, 4].map((l) => (
          <span key={l} className={`${styles['ab-heatmap-cell']} ${cellClass(l)}`} />
        ))}
        <span>more</span>
      </div>
    </div>
  );
}

export function GitHubActivity() {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.1 });
  const [heatmap, setHeatmap] = useState<HeatmapCell[][]>(() => buildHeatmap(new Map(), new Map()));
  const [counts, setCounts] = useState<ReadonlyMap<string, number>>(new Map());
  const [total, setTotal] = useState(0);
  const [commits, setCommits] = useState<CommitInfo[]>([]);
  const [hot, setHot] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadActivity(profile.githubUsername).then((res) => {
      if (cancelled) return;
      setHeatmap(res.data.heatmap);
      setCounts(res.data.counts);
      setTotal(res.data.total);
      setCommits(res.commits);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const commitsByDate = useMemo(() => {
    const map = new Map<string, CommitInfo[]>();
    for (const c of commits) {
      const list = map.get(c.iso);
      if (list) list.push(c);
      else map.set(c.iso, [c]);
    }
    return map;
  }, [commits]);

  const hotCommits = hot ? (commitsByDate.get(hot.date) ?? []) : [];

  const readout = hot
    ? `${new Date(`${hot.date}T00:00:00Z`).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      })} · ${hot.count} contribution${hot.count === 1 ? '' : 's'}`
    : `${total} contributions`;

  return (
    <div
      ref={ref}
      className={`${styles['ab-github']}${inView ? ` ${styles['ab-github--in']}` : ''}`}
    >
      <div className={styles['ab-github-head']}>
        <div className={styles['ab-github-titles']}>
          <span className={styles['ab-github-title']}>
            <FiGitCommit size={13} className={styles['ab-github-bar-ico']} />
            contributions
          </span>
          <span className={styles['ab-github-sub']}>last 52 weeks · @{profile.githubUsername}</span>
        </div>
        <div className={styles['ab-github-read']}>
          <span className={`${styles['ab-github-readout']} ${hot ? styles['ab-github-readout--hot'] : ''}`}>
            {readout}
          </span>
          {hotCommits.length > 0 && (
            <div className={styles['ab-github-pop']}>
              <span className={styles['ab-github-pop-title']}>
                commits · {new Date(`${hot!.date}T00:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </span>
              {hotCommits.slice(0, 3).map((c) => (
                <div key={`${c.hash}-${c.repo}`} className={styles['ab-github-pop-row']}>
                  <span className={styles['ab-github-sha']}>{c.hash}</span>
                  <span className={styles['ab-github-msg']}>{c.message}</span>
                  <span className={styles['ab-github-repo']}>{c.repo}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className={styles['ab-github-body']}>
        <HeatmapGrid heatmap={heatmap} counts={counts} onHover={setHot} />
        <div className={styles['ab-commits']}>
          <span className={styles['ab-commits-label']}>latest commits</span>
          {commits.length === 0 ? (
            <div className={styles['ab-github-empty']}>no recent public pushes</div>
          ) : (
            commits.map((c, i) => (
              <div key={`${c.hash}-${i}`} className={styles['ab-github-commit']}>
                <span className={styles['ab-github-sha']}>{c.hash}</span>
                <span className={styles['ab-github-msg']}>{c.message}</span>
                <span className={styles['ab-github-repo']}>{c.repo}</span>
                <span className={styles['ab-github-date']}>{c.date}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}