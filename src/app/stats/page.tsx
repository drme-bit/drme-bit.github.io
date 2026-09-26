'use client';

import { useActivity } from '@/app/providers/ActivityProvider';
import { TransitionLink } from '@/features/transitions';
import TypingTest from '@/shared/ui/TypingTest/TypingTest';

/*  Achievement definitions  */

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'clicks' | 'skills' | 'projects' | 'sections' | 'time';
  check: (p: { clicks: number; skillsChecked: number; projectsViewed: number; sectionsRevealed: number; timeOnSite: number }) => boolean;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-click', title: 'First Blood', description: '100 clicks', category: 'clicks', check: (p) => p.clicks >= 100 },
  { id: 'clicker-500', title: 'Clicker', description: '500 clicks', category: 'clicks', check: (p) => p.clicks >= 500 },
  { id: 'clicker-1k', title: 'Centurion', description: '1,000 clicks', category: 'clicks', check: (p) => p.clicks >= 1000 },
  { id: 'clicker-5k', title: 'Destroyer', description: '5,000 clicks', category: 'clicks', check: (p) => p.clicks >= 5000 },
  { id: 'clicker-10k', title: 'Legend', description: '10,000 clicks', category: 'clicks', check: (p) => p.clicks >= 10000 },
  { id: 'skills-1', title: 'Curious', description: 'Checked 1 skill', category: 'skills', check: (p) => p.skillsChecked >= 1 },
  { id: 'skills-5', title: 'Explorer', description: 'Checked 5 skills', category: 'skills', check: (p) => p.skillsChecked >= 5 },
  { id: 'skills-10', title: 'Scholar', description: 'Checked 10 skills', category: 'skills', check: (p) => p.skillsChecked >= 10 },
  { id: 'projects-1', title: 'Observer', description: 'Viewed 1 projects', category: 'projects', check: (p) => p.projectsViewed >= 1 },
  { id: 'projects-3', title: 'Inspector', description: 'Viewed 3 projects', category: 'projects', check: (p) => p.projectsViewed >= 3 },
  { id: 'sections-3', title: 'Browser', description: 'Revealed 3 sections', category: 'sections', check: (p) => p.sectionsRevealed >= 3 },
  { id: 'sections-5', title: 'Scroller', description: 'Revealed 5 sections', category: 'sections', check: (p) => p.sectionsRevealed >= 5 },
  { id: 'time-60', title: 'Lingerer', description: '60 seconds on site', category: 'time', check: (p) => p.timeOnSite >= 60 },
  { id: 'time-300', title: 'Dedicated', description: '5 minutes on site', category: 'time', check: (p) => p.timeOnSite >= 300 },
  { id: 'time-900', title: 'Addicted', description: '15 minutes on site', category: 'time', check: (p) => p.timeOnSite >= 900 },
];

/*  Helpers ─ */

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getPercent(personal: number, global: number): string {
  if (global === 0) return '0';
  const pct = (personal / global) * 100;
  return pct >= 1 ? pct.toFixed(1) : pct.toFixed(2);
}

function SectionCard({ tag, extra, children }: { tag: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5 max-[700px]:p-4">
      <p className="m-0 mb-4 flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
        {tag}
        {extra}
      </p>
      {children}
    </section>
  );
}

/*  Contribution Bar ─ */

function ContributionBar({ label, personal, global: globalVal }: { label: string; personal: number; global: number }) {
  const pct = globalVal > 0 ? Math.min((personal / globalVal) * 100, 100) : 0;
  const share = getPercent(personal, globalVal);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[0.66rem] text-[var(--text-dim)]">{label}</span>
        <span className="font-mono text-[0.66rem] text-[var(--accent-secondary)]">{share}%</span>
      </div>
      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--glass)]">
        <div
          className="h-full rounded-full bg-[var(--accent-secondary)] transition-[width] duration-500"
          style={{ width: `${Math.max(pct, 0.5)}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between gap-3 font-mono text-[0.6rem] text-[var(--text-ghost)]">
        <span>you: {personal.toLocaleString()}</span>
        <span>global: {globalVal.toLocaleString()}</span>
      </div>
    </div>
  );
}

/*  Stats Page ─ */

export default function StatsPage() {
  const { personal, global, mounted } = useActivity();

  const unlocked = mounted ? ACHIEVEMENTS.filter((a) => a.check(personal)) : [];

  return (
    <div className="mx-auto w-full max-w-[880px] animate-rise px-5 pb-20 pt-28 max-[700px]:pt-24">
      <header>
        <p className="m-0 font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-ghost)]">
          <TransitionLink href="/">home</TransitionLink>
          <span aria-hidden="true"> / </span>
          <span className="text-[var(--text-dim)]">stats</span>
        </p>
        <h1 className="m-0 mt-3 font-display text-[clamp(2.4rem,6vw,3.6rem)] font-bold leading-none tracking-[var(--tracking-section)] text-foreground">
          site stats<span aria-hidden="true" className="text-[var(--accent-secondary)]">.</span>
        </h1>
        <p className="m-0 mt-3 max-w-[52ch] text-[0.9rem] leading-[1.65] text-muted-foreground">
          your activity &amp; contribution
        </p>
      </header>

      <div className="mt-10 flex flex-col gap-4">
        <SectionCard tag="global">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [global.totalClicks.toLocaleString(), 'total clicks'],
              [global.totalVisitors.toLocaleString(), 'visitors'],
              [global.totalSkillsChecked.toLocaleString(), 'skills explored'],
              [global.totalProjectsViewed.toLocaleString(), 'projects viewed'],
            ].map(([value, label]) => (
              <div key={label as string} className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-3">
                <span className="block font-display text-[1.3rem] font-semibold text-foreground">{value}</span>
                <span className="mt-0.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard tag="personal">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              [personal.clicks.toLocaleString(), 'clicks', `${getPercent(personal.clicks, global.totalClicks)}% of global`],
              [String(personal.skillsChecked), 'skills checked', `${getPercent(personal.skillsChecked, global.totalSkillsChecked)}% of global`],
              [String(personal.projectsViewed), 'projects viewed', `${getPercent(personal.projectsViewed, global.totalProjectsViewed)}% of global`],
              [String(personal.sectionsRevealed), 'sections revealed', `${getPercent(personal.sectionsRevealed, global.totalSectionsRevealed)}% of global`],
              [mounted ? formatTime(personal.timeOnSite) : '0s', 'time on site', 'this session'],
            ].map(([value, label, sub]) => (
              <div key={label as string} className="rounded-[var(--radius-sm)] border border-[var(--border)] px-3 py-3">
                <span className="block font-display text-[1.3rem] font-semibold text-foreground">{value}</span>
                <span className="mt-0.5 block font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">
                  {label}
                </span>
                <span className="mt-1 block font-mono text-[0.6rem] text-[var(--accent-secondary)]">{sub}</span>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard tag="contribution">
          <div className="flex flex-col gap-4">
            <ContributionBar label="clicks" personal={personal.clicks} global={global.totalClicks} />
            <ContributionBar label="skills explored" personal={personal.skillsChecked} global={global.totalSkillsChecked} />
            <ContributionBar label="projects viewed" personal={personal.projectsViewed} global={global.totalProjectsViewed} />
            <ContributionBar label="sections revealed" personal={personal.sectionsRevealed} global={global.totalSectionsRevealed} />
          </div>
        </SectionCard>

        <SectionCard
          tag="achievements"
          extra={
            <span className="ml-auto text-[var(--text-dim)]">
              {unlocked.length}/{ACHIEVEMENTS.length}
            </span>
          }
        >
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = ach.check(personal);
              return (
                <div
                  key={ach.id}
                  title={`${ach.title}: ${ach.description}`}
                  className={`rounded-[var(--radius-sm)] border px-3 py-2.5 transition-colors ${
                    isUnlocked
                      ? 'border-[var(--accent-secondary)]/40 bg-[var(--accent-secondary)]/[0.07]'
                      : 'border-[var(--border)] opacity-55'
                  }`}
                >
                  <span className={`block text-[0.8rem] font-semibold ${isUnlocked ? 'text-foreground' : 'text-[var(--text-dim)]'}`}>
                    {ach.title}
                  </span>
                  <span className="mt-0.5 block font-mono text-[0.6rem] text-[var(--text-ghost)]">
                    {ach.description}
                  </span>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard tag="typing test">
          <TypingTest />
        </SectionCard>

        <p className="m-0 text-center font-mono text-[0.62rem] text-[var(--text-ghost)]">
          stats reset on browser data clear &middot; global stats persist via firebase
        </p>
      </div>
    </div>
  );
}
