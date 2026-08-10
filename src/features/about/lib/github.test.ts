import { describe, it, expect } from 'vitest';
import { contributionLevel, buildHeatmap, buildHeatmapData, HEATMAP_WEEKS } from './github';
import type { HeatmapLevel } from './github';

describe('contributionLevel', () => {
  it('maps zero counts to empty', () => {
    expect(contributionLevel(0, 32)).toBe(0);
  });

  it('maps quartiles of the year max (GitHub algorithm)', () => {
    expect(contributionLevel(1, 32)).toBe(1);
    expect(contributionLevel(8, 32)).toBe(1);
    expect(contributionLevel(9, 32)).toBe(2);
    expect(contributionLevel(16, 32)).toBe(2);
    expect(contributionLevel(17, 32)).toBe(3);
    expect(contributionLevel(24, 32)).toBe(3);
    expect(contributionLevel(25, 32)).toBe(4);
    expect(contributionLevel(32, 32)).toBe(4);
  });

  it('degrades to level 1 when no year max is known', () => {
    expect(contributionLevel(3, 0)).toBe(1);
  });
});

describe('buildHeatmap', () => {
  const counts = new Map<string, number>([['2026-01-15', 29]]);
  const yearMax = new Map<string, number>([['2026', 29]]);

  it('builds 52 weeks of 7 days ending on the given date', () => {
    const heatmap = buildHeatmap(counts, yearMax, new Set(), new Date('2026-01-15T12:00:00Z'));
    expect(heatmap.length).toBe(HEATMAP_WEEKS);
    expect(heatmap[HEATMAP_WEEKS - 1].length).toBe(7);
    expect(heatmap[HEATMAP_WEEKS - 1][6].date).toBe('2026-01-15');
  });

  it('only emits levels 0..4', () => {
    const heatmap = buildHeatmap(counts, yearMax, new Set(), new Date('2026-01-15T12:00:00Z'));
    for (const week of heatmap) {
      for (const cell of week) {
        expect([0, 1, 2, 3, 4]).toContain(cell.level);
      }
    }
  });

  it('uses real counts with per-year max', () => {
    const heatmap = buildHeatmap(counts, yearMax, new Set(), new Date('2026-01-15T12:00:00Z'));
    const lastWeek = heatmap[HEATMAP_WEEKS - 1];
    expect(lastWeek[6].level).toBe(4);
    expect(lastWeek[5].level).toBe(0);
  });

  it('stays empty when no real data is available', () => {
    const heatmap = buildHeatmap(new Map(), new Map(), new Set(), new Date('2026-01-15T12:00:00Z'));
    const flat = heatmap.flat();
    expect(flat.length).toBe(HEATMAP_WEEKS * 7);
    expect(flat.every((c) => c.level === 0)).toBe(true);
  });

  it('falls back to push dates as a minimal real signal', () => {
    const pushDates = new Set(['2026-01-10']);
    const heatmap = buildHeatmap(new Map(), new Map(), pushDates, new Date('2026-01-15T12:00:00Z'));
    const flat = heatmap.flat();
    const cell = flat.find((c) => c.date === '2026-01-10');
    expect(cell?.level).toBe(1);
  });
});

describe('buildHeatmapData', () => {
  const counts = new Map<string, number>([
    ['2026-01-15', 3],
    ['2026-01-14', 2],
  ]);
  const yearMax = new Map<string, number>([['2026', 29]]);

  it('returns per-date counts for hover readouts', () => {
    const data = buildHeatmapData(counts, yearMax, new Set(), new Date('2026-01-15T12:00:00Z'));
    expect(data.counts.get('2026-01-15')).toBe(3);
    expect(data.counts.get('2026-01-14')).toBe(2);
    expect(data.counts.size).toBe(HEATMAP_WEEKS * 7);
  });

  it('totals every day in the 52-week window', () => {
    const data = buildHeatmapData(counts, yearMax, new Set(), new Date('2026-01-15T12:00:00Z'));
    expect(data.total).toBe(5);
  });

  it('keeps heatmap cells aligned with counts', () => {
    const data = buildHeatmapData(counts, yearMax, new Set(), new Date('2026-01-15T12:00:00Z'));
    expect(data.heatmap[HEATMAP_WEEKS - 1][6].level).toBe(1);
    expect(data.heatmap[HEATMAP_WEEKS - 1][5].level).toBe(1);
    expect(data.heatmap[HEATMAP_WEEKS - 1][4].level).toBe(0);
  });
});
