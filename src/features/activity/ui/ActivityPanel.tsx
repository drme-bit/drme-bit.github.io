'use client';

import { useActivity } from '@/app/providers/ActivityProvider';
import TypingTest from '@/shared/ui/TypingTest/TypingTest';

interface Achievement {
  id: string;
  title: string;
  description: string;
  check: (activity: { clicks: number; skillsChecked: number; projectsViewed: number; sectionsRevealed: number; timeOnSite: number }) => boolean;
}

const achievements: Achievement[] = [
  { id: 'first-click', title: 'First Blood', description: '100 clicks', check: (a) => a.clicks >= 100 },
  { id: 'clicker-500', title: 'Clicker', description: '500 clicks', check: (a) => a.clicks >= 500 },
  { id: 'clicker-1k', title: 'Centurion', description: '1,000 clicks', check: (a) => a.clicks >= 1000 },
  { id: 'clicker-5k', title: 'Destroyer', description: '5,000 clicks', check: (a) => a.clicks >= 5000 },
  { id: 'clicker-10k', title: 'Legend', description: '10,000 clicks', check: (a) => a.clicks >= 10000 },
  { id: 'skills-1', title: 'Curious', description: 'Checked 1 skill', check: (a) => a.skillsChecked >= 1 },
  { id: 'skills-5', title: 'Explorer', description: 'Checked 5 skills', check: (a) => a.skillsChecked >= 5 },
  { id: 'skills-10', title: 'Scholar', description: 'Checked 10 skills', check: (a) => a.skillsChecked >= 10 },
  { id: 'projects-1', title: 'Observer', description: 'Viewed 1 project', check: (a) => a.projectsViewed >= 1 },
  { id: 'projects-3', title: 'Inspector', description: 'Viewed 3 projects', check: (a) => a.projectsViewed >= 3 },
  { id: 'sections-3', title: 'Browser', description: 'Revealed 3 sections', check: (a) => a.sectionsRevealed >= 3 },
  { id: 'sections-5', title: 'Scroller', description: 'Revealed 5 sections', check: (a) => a.sectionsRevealed >= 5 },
  { id: 'time-60', title: 'Lingerer', description: '60 seconds here', check: (a) => a.timeOnSite >= 60 },
  { id: 'time-300', title: 'Dedicated', description: '5 minutes here', check: (a) => a.timeOnSite >= 300 },
  { id: 'time-900', title: 'Addicted', description: '15 minutes here', check: (a) => a.timeOnSite >= 900 },
];

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes}m ${seconds % 60}s` : `${seconds}s`;
}

export default function ActivityPanel() {
  const { personal, mounted } = useActivity();
  const unlocked = mounted ? achievements.filter((item) => item.check(personal)).length : 0;
  const metrics = [
    [personal.clicks.toLocaleString(), 'clicks'],
    [String(personal.skillsChecked), 'skills explored'],
    [String(personal.projectsViewed), 'projects viewed'],
    [String(personal.sectionsRevealed), 'sections explored'],
    [mounted ? formatTime(personal.timeOnSite) : '0s', 'time spent'],
  ];

  return (
    <section id="activity" className="scroll-mt-28 border-t border-[var(--border)] py-16 md:py-20" aria-labelledby="activity-heading">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <div>
          <p className="m-0 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">A little side quest</p>
          <h2 id="activity-heading" className="mb-0 mt-3 font-display text-[clamp(2rem,4vw,3.25rem)] font-semibold leading-[1.02] tracking-[var(--tracking-tight)] text-[var(--text)]">Your activity</h2>
          <p className="mb-0 mt-3 max-w-[42ch] text-[0.9rem] leading-[1.7] text-[var(--text-secondary)]">A few playful details collected while you explore. This activity stays in this browser.</p>

          <dl className="mb-0 mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3">
            {metrics.map(([value, label]) => (
              <div key={label} className="grid border-t border-[var(--border)] pt-3">
                <dt className="order-2 mt-1 font-mono text-[0.58rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">{label}</dt>
                <dd className="order-1 m-0 font-display text-[1.5rem] font-medium tabular-nums text-[var(--text)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="min-w-0">
          <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-[var(--border)] pb-3">
            <h3 className="m-0 text-[0.95rem] font-medium text-[var(--text)]">Achievements</h3>
            <span className="font-mono text-[0.66rem] tabular-nums text-[var(--text-ghost)]">{unlocked} / {achievements.length} unlocked</span>
          </div>
          <ul className="m-0 grid list-none grid-cols-2 gap-x-6 gap-y-3 p-0 sm:grid-cols-3">
            {achievements.map((item) => {
              const complete = mounted && item.check(personal);
              return (
                <li key={item.id} className={`border-l-2 py-1 pl-3 ${complete ? 'border-[var(--accent-secondary)]' : 'border-[var(--border)] opacity-55'}`}>
                  <span className="block text-[0.76rem] font-medium text-[var(--text)]">{item.title}</span>
                  <span className="mt-0.5 block font-mono text-[0.58rem] text-[var(--text-ghost)]">{item.description}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-8 border-t border-[var(--border)] pt-5">
            <h3 className="mb-3 mt-0 text-[0.95rem] font-medium text-[var(--text)]">Take a typing break</h3>
            <TypingTest />
          </div>
        </div>
      </div>
    </section>
  );
}
