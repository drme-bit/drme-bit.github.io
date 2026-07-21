'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useActivity } from '@/providers/ActivityProvider';
import styles from './Clicker.module.scss';

/* ─── Achievements ───────────────────────────────────────── */

interface Achievement {
  id: string;
  title: string;
  description: string;
  threshold: number;
  icon: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-click', title: 'First Blood', description: '100 clicks', threshold: 100, icon: '🎯' },
  { id: 'clicker-500', title: 'Clicker', description: '500 clicks', threshold: 500, icon: '🖱️' },
  { id: 'clicker-1k', title: 'Centurion', description: '1,000 clicks', threshold: 1000, icon: '⚔️' },
  { id: 'clicker-5k', title: 'Destroyer', description: '5,000 clicks', threshold: 5000, icon: '💀' },
  { id: 'clicker-10k', title: 'Legend', description: '10,000 clicks', threshold: 10000, icon: '👑' },
  { id: 'skills-checked', title: 'Explorer', description: 'Checked 5 skills', threshold: 5, icon: '🔍' },
  { id: 'projects-viewed', title: 'Curious', description: 'Viewed 3 projects', threshold: 3, icon: '📂' },
  { id: 'sections-revealed', title: 'Scroller', description: 'Revealed 5 sections', threshold: 5, icon: '📜' },
  { id: 'time-60', title: 'Lingerer', description: '60 seconds on site', threshold: 60, icon: '⏰' },
  { id: 'time-300', title: 'Dedicated', description: '5 minutes on site', threshold: 300, icon: '💎' },
];

function getLevel(clicks: number): { level: number; progress: number; next: number } {
  const levels = [0, 100, 500, 1000, 5000, 10000];
  for (let i = levels.length - 1; i >= 0; i--) {
    if (clicks >= levels[i]) {
      const next = levels[i + 1] ?? levels[i] + 10000;
      return {
        level: i + 1,
        progress: (clicks - levels[i]) / (next - levels[i]),
        next,
      };
    }
  }
  return { level: 1, progress: clicks / 100, next: 100 };
}

/* ─── Particles ──────────────────────────────────────────── */

interface Particle {
  id: number;
  x: number;
  y: number;
  char: string;
}

const PARTICLE_CHARS = ['+', '*', '·', '✦', '●'];

/* ─── Clicker ────────────────────────────────────────────── */

export default function Clicker() {
  const { personal, global, incrementClicks } = useActivity();
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  const particleId = useRef(0);
  const achievedRef = useRef<Set<string>>(new Set());

  const level = getLevel(personal.clicks);

  // Check achievements
  useEffect(() => {
    const checks = [
      { id: 'first-click', val: personal.clicks },
      { id: 'clicker-500', val: personal.clicks },
      { id: 'clicker-1k', val: personal.clicks },
      { id: 'clicker-5k', val: personal.clicks },
      { id: 'clicker-10k', val: personal.clicks },
      { id: 'skills-checked', val: personal.skillsChecked },
      { id: 'projects-viewed', val: personal.projectsViewed },
      { id: 'sections-revealed', val: personal.sectionsRevealed },
      { id: 'time-60', val: personal.timeOnSite },
      { id: 'time-300', val: personal.timeOnSite },
    ];

    for (const check of checks) {
      if (achievedRef.current.has(check.id)) continue;
      const ach = ACHIEVEMENTS.find((a) => a.id === check.id);
      if (ach && check.val >= ach.threshold) {
        achievedRef.current.add(check.id);
        setShowAchievement(ach.title);
        setTimeout(() => setShowAchievement(null), 3000);
      }
    }
  }, [personal]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      incrementClicks();

      // Spawn particles
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const newParticles: Particle[] = Array.from({ length: 5 }, () => ({
        id: particleId.current++,
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        char: PARTICLE_CHARS[Math.floor(Math.random() * PARTICLE_CHARS.length)],
      }));
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.includes(p)));
      }, 800);
    },
    [incrementClicks],
  );

  return (
    <div className={styles.clicker}>
      <div className={styles.clickerBar}>
        <span className={`${styles.dot} ${styles['dot--r']}`} />
        <span className={`${styles.dot} ${styles['dot--y']}`} />
        <span className={`${styles.dot} ${styles['dot--g']}`} />
        <span className={styles.barTitle}>clicker.exe</span>
      </div>

      <div className={styles.clickerBody}>
        {/* Level badge */}
        <div className={styles.levelBadge}>
          <span className={styles.levelIcon}>⚡</span>
          <span className={styles.levelText}>LVL {level.level}</span>
        </div>

        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${Math.min(level.progress * 100, 100)}%` }} />
        </div>
        <div className={styles.progressLabel}>
          {personal.clicks} / {level.next.toLocaleString()} clicks
        </div>

        {/* Main click button */}
        <div className={styles.clickArea}>
          <button className={styles.clickBtn} onClick={handleClick} type="button">
            <span className={styles.clickBtnInner}>CLICK</span>
            {particles.map((p) => (
              <span
                key={p.id}
                className={styles.particle}
                style={{ left: p.x, top: p.y }}
              >
                {p.char}
              </span>
            ))}
          </button>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statValue}>{personal.clicks.toLocaleString()}</span>
            <span className={styles.statLabel}>your clicks</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statValue}>{global.totalClicks.toLocaleString()}</span>
            <span className={styles.statLabel}>global clicks</span>
          </div>
        </div>

        {/* Achievements */}
        <div className={styles.achievements}>
          <div className={styles.achievementsTitle}>achievements</div>
          <div className={styles.achievementsGrid}>
            {ACHIEVEMENTS.slice(0, 6).map((ach) => {
              const unlocked = achievedRef.current.has(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`${styles.achievement}${unlocked ? ` ${styles['achievement--unlocked']}` : ''}`}
                  title={`${ach.title}: ${ach.description}`}
                >
                  <span className={styles.achievementIcon}>{ach.icon}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement toast */}
      {showAchievement && (
        <div className={styles.achievementToast}>
          <span>🏆</span> Achievement unlocked: {showAchievement}
        </div>
      )}
    </div>
  );
}
