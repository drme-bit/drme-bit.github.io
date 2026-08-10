'use client';

import { useRef, useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import type { ComponentType } from 'react';
// gsap
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
// hooks
import useReducedMotion from '@/shared/hooks/useReducedMotion';
// data
import { RESUME_FILE } from '@/entities/profile';
import { profile } from '@/entities/profile';
// lib
import { loadActivity, buildHeatmap } from '../lib/github';
import type { CommitInfo, HeatmapCell } from '../lib/github';
// shared ui
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
// icons
import { FiMapPin, FiDownload, FiMail, FiZap, FiTerminal, FiHeart, FiGitCommit } from '@/shared/ui/atoms/Icon';
import { BsFillKanbanFill } from '@/shared/ui/atoms/Icon';
import { RiRobot2Fill } from '@/shared/ui/atoms/Icon';
// styles
import styles from './About.module.scss';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/*  Data  */

const BIO = [
  "Full-stack developer from Odesa, Ukraine with ~5 years of hands-on experience across web applications, backend services and game-server tooling. I care about clean architecture, measurable performance and software that actually ships.",
  "I learn fastest by building — so I'm always prototyping and shipping small things, from Roblox experiences and moderation bots to full-stack web apps and backend APIs.",
];

interface Highlight {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  tags?: string[];
  image: string;
}

const HIGHLIGHTS: Highlight[] = [
  {
    icon: BsFillKanbanFill,
    title: 'Kanban Workflow',
    desc: 'I ship in small, frequent iterations — tasks move with intention from Backlog to Done.',
    tags: ['productivity'],
    image: '/images/demonstration/kanban-demo.png',
  },
  {
    icon: RiRobot2Fill,
    title: 'AI-Augmented',
    desc: 'Copilot, Cursor and agents as force multipliers for speed, refactoring and code quality.',
    tags: ['tooling'],
    image: '/images/demonstration/jetbrains-ai-use-demo.png',
  },
  {
    icon: FiZap,
    title: 'Deep Focus',
    desc: 'When something doesn\u2019t work, I don\u2019t stop — every bug is a puzzle that just needs more time.',
    tags: ['mindset'],
    image: '/images/demonstration/me-coding-demo.png',
  },
];

const STATS: Array<{ value: number; suffix?: string; label: string }> = [
  { value: 5, suffix: '+', label: 'years coding' },
  { value: 9, label: 'languages' },
  { value: 6, label: 'projects' },
];

const NOW_LIST = [
  'shipping a small prototype every week',
  'leveling up in Rust & WebGPU',
  'automating workflows with bots',
];

const FUN_FACTS = ['coffee-first', 'pc builder since 2020', 'night owl', 'bot enthusiast'];

const MARQUEE = [
  'full-stack developer',
  'react',
  'typescript',
  'rust',
  'three.js',
  'node.js',
  'open source',
  'available for work',
  'from odesa, ukraine',
  'drme-bit',
];

/*  CounterStat ─ */

function CounterStat({ value, suffix, label }: { value: number; suffix?: string; label: string }) {
  const numRef = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = numRef.current;
      if (!el) return;
      if (prefersReducedMotion()) {
        el.textContent = `${value}${suffix ?? ''}`;
        return;
      }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: value,
        duration: 1.4,
        ease: 'power2.out',
        onUpdate: () => {
          el.textContent = `${Math.round(obj.v)}${suffix ?? ''}`;
        },
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
      });
    },
    { scope: numRef, dependencies: [reduced, value, suffix] },
  );

  return (
    <div className={styles['ab-stat']}>
      <span ref={numRef} className={styles['ab-stat-num']}>0</span>
      <span className={styles['ab-stat-label']}>{label}</span>
    </div>
  );
}

/*  AccordionPanel ─ */

function AccordionPanel({ highlight, index }: { highlight: Highlight; index: number }) {
  const Icon = highlight.icon;

  return (
    <div className={styles['ab-panel']} tabIndex={0}>
      <Image
        src={highlight.image}
        alt={highlight.title}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 560px"
        quality={85}
        className={styles['ab-panel-img']}
      />
      <div className={styles['ab-panel-shade']} aria-hidden="true" />
      <div className={styles['ab-panel-label']} aria-hidden="true">
        <span className={styles['ab-panel-index']}>0{index + 1}</span>
        <span className={styles['ab-panel-label-text']}>{highlight.title}</span>
      </div>
      <div className={styles['ab-panel-content']}>
        <span className={styles['ab-panel-icon']}><Icon size={15} /></span>
        <h4 className={styles['ab-panel-title']}>{highlight.title}</h4>
        <p className={styles['ab-panel-desc']}>{highlight.desc}</p>
        {highlight.tags && (
          <div className={styles['ab-chips']}>
            {highlight.tags.map((t) => (
              <span key={t} className={styles['ab-chip']}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/*  HeatmapGrid ─ */

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

/*  GitHubActivity ─ */

function GitHubActivity() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
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

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: ref.current, start: 'top 85%' },
        },
      );
    },
    { scope: ref, dependencies: [reduced] },
  );

  return (
    <div ref={ref} className={styles['ab-github']}>
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

/*  About ─ */

export default function About() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const titleBoxRef = useRef<HTMLDivElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = titleBoxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTitleVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.fromTo(
        `.${styles['ab-cmd']}`,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-header']}`, start: 'top 82%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-char']}`,
        { opacity: 0, yPercent: 120, rotate: 6 },
        {
          opacity: 1,
          yPercent: 0,
          rotate: 0,
          duration: 0.8,
          stagger: 0.045,
          ease: 'power4.out',
          scrollTrigger: { trigger: `.${styles['ab-name-big']}`, start: 'top 86%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-tag-word']}`,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-tagline']}`, start: 'top 90%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-head-chip']}`,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-head-side']}`, start: 'top 86%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-hairline']}`,
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 1.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-lead']}`, start: 'top 86%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-lead']} > .${styles['ab-lead-main']} > p`,
        { opacity: 0, x: -48, y: 22 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-lead-main']}`, start: 'top 85%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-lead-aside']}`,
        { opacity: 0, x: 48, y: 30 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-lead-aside']}`, start: 'top 85%' },
        },
      );

      const photoEl = photoRef.current;
      if (photoEl) {
        const img = photoEl.querySelector('img');
        if (img) {
          gsap.fromTo(
            img,
            { yPercent: -9, scale: 1.16 },
            {
              yPercent: 9,
              scale: 1.16,
              ease: 'none',
              scrollTrigger: {
                trigger: photoEl,
                start: 'top bottom',
                end: 'bottom top',
                scrub: true,
              },
            },
          );
        }
      }

      gsap.fromTo(
        `.${styles['ab-rail-label']}`,
        { opacity: 0, x: -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-work']}`, start: 'top 85%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-panel']}`,
        { opacity: 0, y: 34, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-accordion']}`, start: 'top 85%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-bot-side']}`,
        { opacity: 0, x: -48, y: 24 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-bottom']}`, start: 'top 85%' },
        },
      );

      gsap.fromTo(
        `.${styles['ab-bot-main']}`,
        { opacity: 0, x: 48, y: 24 },
        {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-bottom']}`, start: 'top 85%' },
        },
      );

      const marqueeEl = sectionRef.current?.querySelector<HTMLElement>(`.${styles['ab-marquee']}`);
      const marqueeTrack = marqueeEl?.querySelector<HTMLElement>(`.${styles['ab-marquee-track']}`);
      if (marqueeEl && marqueeTrack) {
        const tween = gsap.to(marqueeTrack, {
          xPercent: -50,
          duration: 26,
          ease: 'none',
          repeat: -1,
        });

        let paused = false;
        const setTimeScale = (v: number) =>
          gsap.to(tween, { timeScale: v, duration: 0.35, overwrite: true });
        const pauseOnHover = () => {
          paused = true;
          setTimeScale(0);
        };
        const resumeOnHover = () => {
          paused = false;
          setTimeScale(1);
        };
        marqueeEl.addEventListener('pointerenter', pauseOnHover);
        marqueeEl.addEventListener('pointerleave', resumeOnHover);

        const speed = ScrollTrigger.create({
          start: 0,
          end: 'max',
          onUpdate: (self) => {
            if (paused) return;
            setTimeScale(gsap.utils.clamp(0.4, 2.4, 1 + Math.abs(self.getVelocity()) / 1400));
          },
        });

        gsap.fromTo(
          marqueeEl,
          { opacity: 0, yPercent: 55, skewY: 4 },
          {
            opacity: 1,
            yPercent: 0,
            skewY: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: { trigger: marqueeEl, start: 'top 95%' },
          },
        );

        return () => {
          speed.kill();
          marqueeEl.removeEventListener('pointerenter', pauseOnHover);
          marqueeEl.removeEventListener('pointerleave', resumeOnHover);
        };
      }

      gsap.fromTo(
        `.${styles['ab-stat']}`,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: { trigger: `.${styles['ab-stats-strip']}`, start: 'top 90%' },
        },
      );
    },
    { scope: sectionRef, dependencies: [reduced] },
  );

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`${styles.section} ${styles['section--about']}`}
    >
      <div ref={titleBoxRef} className={styles['ab-title']}>
        <SectionTitle title="about" accent="_" visible={titleVisible} />
      </div>

      <div className={styles['ab-wrap']}>
        {/* ── Header · whoami left / identity chips right ── */}
        <div className={styles['ab-header']}>
          <div className={styles['ab-head-main']}>
            <p className={styles['ab-cmd']}>
              <span className={styles['ab-cmd-prompt']}>➜</span> whoami
            </p>
            <h2 className={styles['ab-name-big']} aria-label={profile.name}>
              {profile.name.split('').map((ch, i) => (
                <span key={i} aria-hidden="true" className={styles['ab-char']}>
                  {ch === ' ' ? '\u00A0' : ch}
                </span>
              ))}
            </h2>
            <p className={styles['ab-tagline']}>
              {profile.brandTagline.split(' ').map((word, i) => (
                <span key={i} className={styles['ab-tag-word']}>{word}</span>
              ))}
            </p>
          </div>

          <div className={styles['ab-head-side']}>
            <div className={`${styles['ab-status']} ${styles['ab-head-chip']}`}>
              <span className={styles['ab-status-dot']} />
              available for work
            </div>
            <div className={`${styles['ab-loc']} ${styles['ab-head-chip']}`}>
              <FiMapPin size={13} />
              <span>{profile.location}</span>
            </div>
            <a
              href={RESUME_FILE}
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles['ab-resume']} ${styles['ab-head-chip']}`}
            >
              <FiDownload size={13} />
              <span>download résumé</span>
            </a>
            <a
              href={`mailto:${profile.email}`}
              className={`${styles['ab-mail']} ${styles['ab-head-chip']}`}
            >
              <FiMail size={13} />
              <span>{profile.email}</span>
            </a>
            <div className={styles['ab-watermark']} aria-hidden="true">01</div>
          </div>
        </div>

        {/* ── Lead · bio left / photo right ── */}
        <div className={styles['ab-lead']}>
          <div className={styles['ab-lead-main']}>
            <span className={styles['ab-step']} aria-hidden="true">
              <i>01</i> intro
            </span>
            <div className={styles['ab-hairline']} aria-hidden="true" />
            {BIO.map((text, i) => (
              <p key={i}>{text}</p>
            ))}
          </div>
          <div className={styles['ab-lead-aside']}>
            <div ref={photoRef} className={styles['ab-photo-card']}>
              <div className={styles['ab-photo-frame']}>
                <Image
                  src="/images/17969af76asf9y986ad9fy.jpg"
                  alt={profile.name}
                  fill
                  className={styles['ab-photo-img']}
                  sizes="(max-width: 1024px) 90vw, 640px"
                  priority
                  quality={90}
                />
                <span className={styles['ab-photo-frame-ring']} aria-hidden="true" />
              </div>
              <div className={styles['ab-identity']}>
                <span className={styles['ab-name']}>{profile.name}</span>
                <span className={styles['ab-role']}>full-stack · react / three.js / rust / node.js</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── How I work · full-width accordion ── */}
        <div className={styles['ab-work']}>
          <div className={styles['ab-rail-label']} aria-hidden="true">
            <span className={styles['ab-rail-label-text']}>how I work</span>
            <span className={styles['ab-rail-label-index']}>02</span>
          </div>
          <div className={styles['ab-accordion']}>
            {HIGHLIGHTS.map((h, i) => (
              <AccordionPanel key={h.title} highlight={h} index={i} />
            ))}
          </div>
        </div>

        {/* ── Bottom · now + facts left / github right (zigzag) ── */}
        <div className={styles['ab-bottom']}>
          <div className={styles['ab-bot-side']}>
            <span className={styles['ab-step']} aria-hidden="true">
              <i>03</i> now
            </span>
            <div className={styles['ab-now']}>
              <div className={styles['ab-now-head']}>
                <FiTerminal size={13} />
                <span>currently</span>
              </div>
              <ul className={styles['ab-now-list']}>
                {NOW_LIST.map((item) => (
                  <li key={item}><span className={styles['ab-now-arrow']}>›</span>{item}</li>
                ))}
              </ul>
            </div>
            <div className={styles['ab-facts']}>
              <div className={styles['ab-now-head']}>
                <FiHeart size={13} />
                <span>beyond the code</span>
              </div>
              <div className={styles['ab-chips']}>
                {FUN_FACTS.map((f) => (
                  <span key={f} className={styles['ab-chip']}>{f}</span>
                ))}
              </div>
            </div>
          </div>
          <div className={styles['ab-bot-main']}>
            <GitHubActivity />
          </div>
        </div>

        {/* ── Stats strip ── */}
        <div className={styles['ab-stats-strip']}>
          {STATS.map((s) => (
            <CounterStat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </div>

      {/* ── Marquee · full-bleed ticker ── */}
      <div className={styles['ab-marquee']} aria-hidden="true">
        <div className={styles['ab-marquee-track']}>
          {[0, 1].map((rep) => (
            <div key={rep} className={styles['ab-marquee-group']}>
              {MARQUEE.map((token, i) => (
                <span key={i} className={styles['ab-marquee-item']}>
                  {token}
                  <span className={styles['ab-marquee-sep']}>·</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
