'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  FiGithub, FiSend, FiMessageSquare,
  FiLinkedin, FiMail, FiArrowUpRight,
  FiBriefcase, FiUsers, FiCalendar,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import styles from './ProfileCard.module.scss';

const SOCIAL_ICONS: Record<string, IconType> = {
  github: FiGithub,
  telegram: FiSend,
  discord: FiMessageSquare,
  linkedin: FiLinkedin,
  email: FiMail,
};

const STATS = [
  { icon: FiBriefcase, value: 5, suffix: '+', label: 'years' },
  { icon: FiGithub, value: 30, suffix: '+', label: 'projects' },
  { icon: FiUsers, value: 15, suffix: '+', label: 'clients' },
];

const SOCIALS = [
  { id: 'github', href: 'https://github.com/drme-bit' },
  { id: 'telegram', href: 'https://t.me/drmebit' },
  { id: 'discord', href: 'https://discord.gg/389417490809225216' },
  { id: 'linkedin', href: 'https://www.linkedin.com/in/vyacheslav-tkachik-2a3b8a277' },
  { id: 'email', href: 'mailto:vacheslavtkachik@gmail.com' },
];

function useCountUp(end: number, duration = 1500, enabled = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;
    let start = 0;
    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [end, duration, enabled]);

  return count;
}

function StatItem({
  icon: Icon,
  value,
  suffix,
  label,
  visible,
}: {
  icon: IconType;
  value: number;
  suffix: string;
  label: string;
  visible: boolean;
}) {
  const count = useCountUp(value, 1800, visible);
  return (
    <div className={styles.stat}>
      <Icon size={14} className={styles.statIcon} />
      <span className={styles.statValue}>
        {count}{suffix}
      </span>
      <span className={styles.statLabel}>{label}</span>
    </div>
  );
}

export default function ProfileCard({ visible = true }: { visible?: boolean }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 30 }}
      animate={visible ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className={styles.glow} />

      <div className={styles.avatarWrap}>
        <motion.div
          className={styles.avatar}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <span className={styles.avatarText}>SC</span>
        </motion.div>
        <span className={styles.availableDot} />
      </div>

      <div className={styles.info}>
        <h2 className={styles.name}>Slava Tkachik</h2>
        <p className={styles.role}>fullstack developer</p>
      </div>

      <div className={styles.stats}>
        {STATS.map((s) => (
          <StatItem key={s.label} {...s} visible={visible} />
        ))}
      </div>

      <div className={styles.socials}>
        {SOCIALS.map((s) => {
          const Icon = SOCIAL_ICONS[s.id];
          return (
            <motion.a
              key={s.id}
              href={s.href}
              target={s.href.startsWith('mailto') ? undefined : '_blank'}
              rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
              className={styles.socialIcon}
              whileHover={{ scale: 1.15, y: -3 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <Icon size={16} />
            </motion.a>
          );
        })}
      </div>

      <motion.a
        href="https://calendly.com/vacheslavtkachik/30min"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cta}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <FiCalendar size={14} />
        <span>let&apos;s work together</span>
        <FiArrowUpRight size={12} />
      </motion.a>

      <p className={styles.location}>based in ukraine · freelance & collaboration</p>
    </motion.div>
  );
}
