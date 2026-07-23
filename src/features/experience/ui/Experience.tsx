'use client';

import { useEffect, useRef, useCallback } from 'react';
import useReveal from '@/shared/hooks/useReveal';
import useCursorParallax from '@/shared/hooks/useCursorParallax';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import styles from './Experience.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  desc: string;
}

/* ─── Data ───────────────────────────────────────────────── */

const ENTRIES: ExperienceEntry[] = [
  {
    period: '2024 — present',
    role: 'Freelance Roblox Developer',
    org: 'Self-employed',
    desc: 'Developed commission-based games across multiple genres: anime-themed experiences (JoJo, One Piece), an item trading economy game, and the creepypasta horror game "Vault 8166". Built interactive gameplay systems and server-side logic using Luau.',
  },
  {
    period: '2024',
    role: 'Diploma Project — Nexagon',
    org: 'Software Engineering Bachelor',
    desc: 'Created Nexagon, a platform for monitoring and managing game servers. Features real-time tracking, server management tools, and planned hosting integration. Served as the thesis projects for my Professional Junior Bachelor degree.',
  },
  {
    period: '2023 — present',
    role: 'Bot Developer',
    org: 'Freelance',
    desc: 'Built custom Telegram and Discord bots for moderation, community management, automation, and game server integration. Focused on reliable, self-hosted solutions using Python and Node.js.',
  },
];

/* ─── Experience ─────────────────────────────────────────── */

export default function Experience() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const entryRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tailRef = useRef<HTMLSpanElement | null>(null);
  const headRef = useRef<HTMLSpanElement | null>(null);

  const update = useCallback(() => {
    const el = timelineRef.current;
    if (!el) return;

    const vh = window.innerHeight;
    const rect = el.getBoundingClientRect();
    const total = rect.height - vh;
    const scrolled = -rect.top;
    const p = Math.max(0, Math.min(1, total > 0 ? scrolled / total : 0));

    if (tailRef.current) tailRef.current.style.height = `${p * 100}%`;
    if (headRef.current) headRef.current.style.top = `${p * 100}%`;

    const threshold = vh * 0.1 + p * vh * 0.8;

    entryRefs.current.forEach((entryEl) => {
      if (!entryEl) return;
      const dot = entryEl.querySelector(`.${styles['tl-dot']}`);
      if (!dot) return;
      const dotRect = dot.getBoundingClientRect();
      if (threshold >= dotRect.top + dotRect.height / 2) {
        entryEl.classList.add(styles['is-visible']);
      } else {
        entryEl.classList.remove(styles['is-visible']);
      }
    });
  }, []);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        update();
      });
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', update);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [update]);

  return (
    <section id="experience" ref={ref} className={`${styles.section} ${styles['section--experience']} ${styles.reveal}${visible ? ` ${styles['is-visible']}` : ''}`}>
      <SectionTitle
        title="experience"
        accent=" & background"
        visible={visible}
      />
      <div className={styles['section-inner']} style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>

        <div className={styles.timeline} ref={timelineRef}>
          <div className={styles['timeline-line']}>
            <span ref={tailRef} className={styles['tl-tail']} />
            <span ref={headRef} className={styles['tl-head']} />
          </div>

          {ENTRIES.map((e: ExperienceEntry, i: number) => (
            <div
              key={i}
              ref={(el) => { entryRefs.current[i] = el; }}
              className={`${styles['timeline-entry']} ${i % 2 === 0 ? styles['tl-left'] : styles['tl-right']}`}
            >
              <span className={styles['tl-dot']} />
              <div className={styles['tl-body']}>
                <span className={styles['tl-period']}>{e.period}</span>
                <span className={styles['tl-role']}>{e.role}</span>
                <span className={styles['tl-org']}>{e.org}</span>
                <p className={styles['tl-desc']}>{e.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
