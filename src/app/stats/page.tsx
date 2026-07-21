'use client';

import { useActivity } from '@/providers/ActivityProvider';
import Clicker from '@/shared/ui/molecules/Clicker/Clicker';
import TypingTest from '@/shared/ui/molecules/TypingTest/TypingTest';
import { FiGlobe, FiActivity, FiTrendingUp, FiAward, FiZap, FiTerminal } from 'react-icons/fi';
import styles from './Stats.module.scss';

/* ─── Achievement definitions ────────────────────────────── */

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
  { id: 'projects-1', title: 'Observer', description: 'Viewed 1 project', category: 'projects', check: (p) => p.projectsViewed >= 1 },
  { id: 'projects-3', title: 'Inspector', description: 'Viewed 3 projects', category: 'projects', check: (p) => p.projectsViewed >= 3 },
  { id: 'sections-3', title: 'Browser', description: 'Revealed 3 sections', category: 'sections', check: (p) => p.sectionsRevealed >= 3 },
  { id: 'sections-5', title: 'Scroller', description: 'Revealed 5 sections', category: 'sections', check: (p) => p.sectionsRevealed >= 5 },
  { id: 'time-60', title: 'Lingerer', description: '60 seconds on site', category: 'time', check: (p) => p.timeOnSite >= 60 },
  { id: 'time-300', title: 'Dedicated', description: '5 minutes on site', category: 'time', check: (p) => p.timeOnSite >= 300 },
  { id: 'time-900', title: 'Addicted', description: '15 minutes on site', category: 'time', check: (p) => p.timeOnSite >= 900 },
];

/* ─── Helpers ────────────────────────────────────────────── */

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
  if (pct >= 1) return pct.toFixed(1);
  return pct.toFixed(2);
}

function getRank(pct: number): { rank: string; color: string } {
  if (pct >= 10) return { rank: 'LEGENDARY', color: 'var(--accent-warm)' };
  if (pct >= 5) return { rank: 'ELITE', color: 'var(--accent-secondary)' };
  if (pct >= 2) return { rank: 'VETERAN', color: 'var(--accent)' };
  if (pct >= 0.5) return { rank: 'REGULAR', color: 'var(--text)' };
  return { rank: 'NEWCOMER', color: 'var(--text-dim)' };
}

/* ─── Contribution Bar ───────────────────────────────────── */

function ContributionBar({
  label,
  personal,
  global: globalVal,
}: {
  label: string;
  personal: number;
  global: number;
}) {
  const pct = globalVal > 0 ? Math.min((personal / globalVal) * 100, 100) : 0;
  const share = getPercent(personal, globalVal);

  return (
    <div className={styles.contrib}>
      <div className={styles.contribHeader}>
        <span className={styles.contribLabel}>{label}</span>
        <span className={styles.contribShare}>{share}%</span>
      </div>
      <div className={styles.contribBar}>
        <div
          className={styles.contribFill}
          style={{ width: `${Math.max(pct, 0.5)}%` }}
        />
      </div>
      <div className={styles.contribValues}>
        <span>you: {personal.toLocaleString()}</span>
        <span>global: {globalVal.toLocaleString()}</span>
      </div>
    </div>
  );
}

/* ─── Stats Page ─────────────────────────────────────────── */

export default function StatsPage() {
  const { personal, global, mounted } = useActivity();

  const unlocked = mounted ? ACHIEVEMENTS.filter((a) => a.check(personal)) : [];
  const totalPct = global.totalClicks > 0 ? (personal.clicks / global.totalClicks) * 100 : 0;
  const { rank, color: rankColor } = getRank(totalPct);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h1 className={styles.title}>site stats</h1>
          <p className={styles.subtitle}>your activity & contribution</p>
        </div>

        {/* Profile Card */}
        <div className={styles.profileCard}>
          <div className={styles.profileLeft}>
            <div className={styles.profileAvatar}>
              <span className={styles.profileLevel}>⚡ LVL {mounted ? Math.floor(Math.log10(Math.max(personal.clicks, 1)) + 1) : 1}</span>
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>visitor</span>
              <span className={styles.profileRank} style={{ color: rankColor }}>{rank}</span>
            </div>
          </div>
          <div className={styles.profileRight}>
            <div className={styles.profileBigStat}>
              <span className={styles.profileBigValue}>{getPercent(personal.clicks, global.totalClicks)}%</span>
              <span className={styles.profileBigLabel}>of all clicks</span>
            </div>
          </div>
        </div>

        {/* Global Overview */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FiGlobe className={styles.sectionIcon} />
            global overview
          </h2>
          <div className={styles.overviewGrid}>
            <div className={styles.overviewCard}>
              <span className={styles.overviewValue}>{global.totalClicks.toLocaleString()}</span>
              <span className={styles.overviewLabel}>total clicks</span>
            </div>
            <div className={styles.overviewCard}>
              <span className={styles.overviewValue}>{global.totalVisitors.toLocaleString()}</span>
              <span className={styles.overviewLabel}>visitors</span>
            </div>
            <div className={styles.overviewCard}>
              <span className={styles.overviewValue}>{global.totalSkillsChecked.toLocaleString()}</span>
              <span className={styles.overviewLabel}>skills explored</span>
            </div>
            <div className={styles.overviewCard}>
              <span className={styles.overviewValue}>{global.totalProjectsViewed.toLocaleString()}</span>
              <span className={styles.overviewLabel}>projects viewed</span>
            </div>
          </div>
        </div>

        {/* Your Stats */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FiActivity className={styles.sectionIcon} />
            your stats
          </h2>
          <div className={styles.yourStatsGrid}>
            <div className={styles.yourStatCard}>
              <span className={styles.yourStatValue}>{personal.clicks.toLocaleString()}</span>
              <span className={styles.yourStatLabel}>clicks</span>
              <span className={styles.yourStatPct}>{getPercent(personal.clicks, global.totalClicks)}% of global</span>
            </div>
            <div className={styles.yourStatCard}>
              <span className={styles.yourStatValue}>{personal.skillsChecked}</span>
              <span className={styles.yourStatLabel}>skills checked</span>
              <span className={styles.yourStatPct}>{getPercent(personal.skillsChecked, global.totalSkillsChecked)}% of global</span>
            </div>
            <div className={styles.yourStatCard}>
              <span className={styles.yourStatValue}>{personal.projectsViewed}</span>
              <span className={styles.yourStatLabel}>projects viewed</span>
              <span className={styles.yourStatPct}>{getPercent(personal.projectsViewed, global.totalProjectsViewed)}% of global</span>
            </div>
            <div className={styles.yourStatCard}>
              <span className={styles.yourStatValue}>{personal.sectionsRevealed}</span>
              <span className={styles.yourStatLabel}>sections revealed</span>
              <span className={styles.yourStatPct}>{getPercent(personal.sectionsRevealed, global.totalSectionsRevealed)}% of global</span>
            </div>
            <div className={styles.yourStatCard}>
              <span className={styles.yourStatValue}>{mounted ? formatTime(personal.timeOnSite) : '0s'}</span>
              <span className={styles.yourStatLabel}>time on site</span>
              <span className={styles.yourStatPct}>this session</span>
            </div>
            <div className={styles.yourStatCard}>
              <span className={styles.yourStatValue}>{unlocked.length}/{ACHIEVEMENTS.length}</span>
              <span className={styles.yourStatLabel}>achievements</span>
              <span className={styles.yourStatPct}>{Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}% complete</span>
            </div>
          </div>
        </div>

        {/* Contribution Breakdown */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FiTrendingUp className={styles.sectionIcon} />
            your contribution
          </h2>
          <div className={styles.contribList}>
            <ContributionBar label="clicks" personal={personal.clicks} global={global.totalClicks} />
            <ContributionBar label="skills explored" personal={personal.skillsChecked} global={global.totalSkillsChecked} />
            <ContributionBar label="projects viewed" personal={personal.projectsViewed} global={global.totalProjectsViewed} />
            <ContributionBar label="sections revealed" personal={personal.sectionsRevealed} global={global.totalSectionsRevealed} />
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FiAward className={styles.sectionIcon} />
            achievements ({unlocked.length}/{ACHIEVEMENTS.length})
          </h2>
          <div className={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((ach) => {
              const isUnlocked = ach.check(personal);
              return (
                <div
                  key={ach.id}
                  className={`${styles.achCard}${isUnlocked ? ` ${styles['achCard--unlocked']}` : ''}`}
                  title={`${ach.title}: ${ach.description}`}
                >
                  <span className={styles.achTitle}>{ach.title}</span>
                  <span className={styles.achDesc}>{ach.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clicker */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FiZap className={styles.sectionIcon} />
            clicker
          </h2>
          <Clicker />
        </div>

        {/* Typing Test */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            <FiTerminal className={styles.sectionIcon} />
            typing test
          </h2>
          <TypingTest />
        </div>
      </div>
    </div>
  );
}
