export type HeatmapLevel = 0 | 1 | 2 | 3 | 4;

export interface HeatmapCell {
  date: string;
  level: HeatmapLevel;
}

export interface CommitInfo {
  hash: string;
  message: string;
  date: string;
  repo: string;
  iso: string;
}

export const HEATMAP_WEEKS = 52;

/*  GitHub contribution-graph level thresholds (same quartile math as github.com).  */

export function contributionLevel(count: number, yearMax: number): HeatmapLevel {
  if (count <= 0) return 0;
  if (yearMax <= 0) return 1;
  const ratio = count / yearMax;
  if (ratio <= 0.25) return 1;
  if (ratio <= 0.5) return 2;
  if (ratio <= 0.75) return 3;
  return 4;
}

function toISODate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

/*  Builds a 52×7 heatmap ending at `now` purely from real contribution counts.  */

export function buildHeatmap(
  counts: ReadonlyMap<string, number>,
  yearMax: ReadonlyMap<string, number>,
  pushDates: ReadonlySet<string> = new Set(),
  now: Date = new Date(),
): HeatmapCell[][] {
  return buildHeatmapData(counts, yearMax, pushDates, now).heatmap;
}

export interface HeatmapData {
  heatmap: HeatmapCell[][];
  counts: Map<string, number>;
  total: number;
}

export function buildHeatmapData(
  counts: ReadonlyMap<string, number>,
  yearMax: ReadonlyMap<string, number>,
  pushDates: ReadonlySet<string> = new Set(),
  now: Date = new Date(),
): HeatmapData {
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  const heatmap: HeatmapCell[][] = [];
  const windowCounts = new Map<string, number>();
  let total = 0;

  for (let col = HEATMAP_WEEKS - 1; col >= 0; col--) {
    const week: HeatmapCell[] = [];
    for (let d = 6; d >= 0; d--) {
      const date = new Date(today);
      date.setDate(date.getDate() - (col * 7 + d));
      const iso = toISODate(date);
      const count = counts.get(iso) ?? (pushDates.has(iso) ? 1 : 0);
      total += count;
      windowCounts.set(iso, count);
      week.push({ date: iso, level: contributionLevel(count, yearMax.get(iso.slice(0, 4)) ?? 0) });
    }
    heatmap.push(week);
  }

  return { heatmap, counts: windowCounts, total };
}

/*  Network helpers (browser-side). GitHub public endpoints allow CORS.  */

interface GithubEvent {
  type?: string;
  payload?: { head?: string };
  repo?: { name: string };
  created_at?: string;
}

function isPush(e: GithubEvent): e is GithubEvent & { payload: { head: string }; repo: { name: string } } {
  return e.type === 'PushEvent' && !!e.payload?.head && !!e.repo?.name;
}

async function commitDetails(e: GithubEvent): Promise<CommitInfo | null> {
  if (!isPush(e)) return null;
  const res = await fetch(`https://api.github.com/repos/${e.repo!.name}/commits/${e.payload!.head}`);
  if (!res.ok) return null;
  const data = (await res.json()) as { sha?: string; commit?: { message?: string } };
  if (!data.sha) return null;
  return {
    hash: data.sha.slice(0, 7),
    message: String(data.commit?.message ?? '').split('\n')[0],
    date: new Date(e.created_at ?? 0).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    repo: e.repo!.name.split('/')[1],
    iso: (e.created_at ?? '').slice(0, 10),
  };
}

export interface GithubActivity {
  commits: CommitInfo[];
  pushDates: Set<string>;
}

export async function fetchGithubActivity(username: string): Promise<GithubActivity> {
  const res = await fetch(`https://api.github.com/users/${username}/events/public?per_page=30`);
  if (!res.ok) return { commits: [], pushDates: new Set() };

  const events = (await res.json()) as GithubEvent[];
  const commits = (await Promise.all(events.filter(isPush).slice(0, 5).map(commitDetails))).filter(
    (c): c is CommitInfo => c !== null,
  );

  const pushDates = new Set<string>();
  for (const e of events) {
    if (e.type === 'PushEvent' && e.created_at) pushDates.add(e.created_at.slice(0, 10));
  }

  return { commits, pushDates };
}

export interface ContributionCounts {
  counts: Map<string, number>;
  yearMax: Map<string, number>;
}

/*  Real contribution counts — CORS-enabled public mirror of the GitHub graph.  */

export async function fetchContributionCounts(username: string): Promise<ContributionCounts> {
  const counts = new Map<string, number>();
  const yearMax = new Map<string, number>();
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(username)}`);
    if (!res.ok) return { counts, yearMax };
    const json = (await res.json()) as { contributions?: { date: string; count: number }[] };
    const contributions = Array.isArray(json.contributions) ? json.contributions : [];
    for (const c of contributions) {
      if (!c || typeof c.date !== 'string') continue;
      const count = Math.max(0, Math.floor(Number(c.count) || 0));
      counts.set(c.date, count);
      const year = c.date.slice(0, 4);
      yearMax.set(year, Math.max(yearMax.get(year) ?? 0, count));
    }
  } catch {
    /* network error */
  }
  return { counts, yearMax };
}

export async function loadActivity(
  username: string,
): Promise<{ commits: CommitInfo[]; data: HeatmapData }> {
  const [activity, realCounts] = await Promise.all([fetchGithubActivity(username), fetchContributionCounts(username)]);
  return {
    commits: activity.commits,
    data: buildHeatmapData(realCounts.counts, realCounts.yearMax, activity.pushDates),
  };
}
