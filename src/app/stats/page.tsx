'use client';

import { useActivity } from '@/app/providers/ActivityProvider';
import TypingTest from '@/shared/ui/molecules/TypingTest/TypingTest';
import styles from './Stats.module.scss';

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

/*  Contribution Bar ─ */

function ContributionBar({ label, personal, global: globalVal }: { label: string; personal: number; global: number }) {
  const pct = globalVal > 0 ? Math.min((personal / globalVal) * 100, 100) : 0;
  const share = getPercent(personal, globalVal);

  return (
    <div className={styles.contrib}>
      <div className={styles.contribHead}>
        <span className={styles.contribLabel}>{label}</span>
        <span className={styles.contribShare}>{share}%</span>
      </div>
      <div className={styles.contribBar}>
        <div className={styles.contribFill} style={{ width: `${Math.max(pct, 0.5)}%` }} />
      </div>
      <div className={styles.contribValues}>
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
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Hero */}
        <header className={styles.hero}>
          <h1 className={styles.heroTitle}>
            site stats<span className={styles.heroDot}>.</span>
          </h1>
          <p className={styles.heroDesc}>your activity &amp; contribution</p>
        </header>

        {/* Global Overview */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>global</span>
          </div>
          <div className={styles.grid4}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{global.totalClicks.toLocaleString()}</span>
              <span className={styles.statLabel}>total clicks</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{global.totalVisitors.toLocaleString()}</span>
              <span className={styles.statLabel}>visitors</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{global.totalSkillsChecked.toLocaleString()}</span>
              <span className={styles.statLabel}>skills explored</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{global.totalProjectsViewed.toLocaleString()}</span>
              <span className={styles.statLabel}>projects viewed</span>
            </div>
          </div>
        </div>

        {/* Your Stats */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>personal</span>
          </div>
          <div className={styles.grid3}>
            <div className={styles.statPanel}>
              <span className={styles.statPanelValue}>{personal.clicks.toLocaleString()}</span>
              <span className={styles.statPanelLabel}>clicks</span>
              <span className={styles.statPanelPct}>{getPercent(personal.clicks, global.totalClicks)}% of global</span>
            </div>
            <div className={styles.statPanel}>
              <span className={styles.statPanelValue}>{personal.skillsChecked}</span>
              <span className={styles.statPanelLabel}>skills checked</span>
              <span className={styles.statPanelPct}>{getPercent(personal.skillsChecked, global.totalSkillsChecked)}% of global</span>
            </div>
            <div className={styles.statPanel}>
              <span className={styles.statPanelValue}>{personal.projectsViewed}</span>
              <span className={styles.statPanelLabel}>projects viewed</span>
              <span className={styles.statPanelPct}>{getPercent(personal.projectsViewed, global.totalProjectsViewed)}% of global</span>
            </div>
            <div className={styles.statPanel}>
              <span className={styles.statPanelValue}>{personal.sectionsRevealed}</span>
              <span className={styles.statPanelLabel}>sections revealed</span>
              <span className={styles.statPanelPct}>{getPercent(personal.sectionsRevealed, global.totalSectionsRevealed)}% of global</span>
            </div>
            <div className={styles.statPanel}>
              <span className={styles.statPanelValue}>{mounted ? formatTime(personal.timeOnSite) : '0s'}</span>
              <span className={styles.statPanelLabel}>time on site</span>
              <span className={styles.statPanelPct}>this session</span>
            </div>
          </div>
        </div>

        {/* Contribution */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>contribution</span>
          </div>
          <div className={styles.contribList}>
            <ContributionBar label="clicks" personal={personal.clicks} global={global.totalClicks} />
            <ContributionBar label="skills explored" personal={personal.skillsChecked} global={global.totalSkillsChecked} />
            <ContributionBar label="projects viewed" personal={personal.projectsViewed} global={global.totalProjectsViewed} />
            <ContributionBar label="sections revealed" personal={personal.sectionsRevealed} global={global.totalSectionsRevealed} />
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>
              achievements <span className={styles.achCount}>{unlocked.length}/{ACHIEVEMENTS.length}</span>
            </span>
          </div>
          <div className={styles.achGrid}>
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = ach.check(personal);
              return (
                <div
                  key={ach.id}
                  className={`${styles.achCard}${isUnlocked ? ` ${styles['achCard--on']}` : ''}`}
                  title={`${ach.title}: ${ach.description}`}
                >
                  <span className={styles.achTitle}>{ach.title}</span>
                  <span className={styles.achDesc}>{ach.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Typing Test */}
        <div className={styles.card}>
          <div className={styles.sectionHead}>
            <span className={styles.sectionTag}>typing test</span>
          </div>
          <TypingTest />
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <span className={styles.footerText}>
            stats reset on browser data clear &middot; global stats persist via firebase
          </span>
        </footer>
      </div>
    </div>
  );
}
