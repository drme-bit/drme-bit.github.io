'use client';

//React
import { useState, useEffect, useRef, useCallback } from 'react';
import { FiGithub, FiLinkedin, FiMail, FiArrowDown, FiDownload, SiDiscord } from '@/shared/ui/atoms/Icon';
//GSAP
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { useGSAP } from '@gsap/react';
//Other
import useTypewriter from '@/shared/hooks/useTypewriter';
import useGithubStats from '@/shared/hooks/useGithubStats';
import { TOOLS } from '@/data/hero/tools';
import { TERMINALS } from '@/data/hero/terminals';
import { TYPEWRITER_STRINGS } from '@/data/hero/config';
import { profile, socialLinks } from '@/shared/data/profile';
//Styles
import styles from './Hero.module.scss';

gsap.registerPlugin(CustomEase);
gsap.registerPlugin(ScrollTrigger);

/*  Types  */

interface TerminalLine {
  prompt?: boolean;
  path?: string;
  branch?: string;
  t?: string;
  c?: string;
}

interface Terminal {
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  speed: number;
  lines: TerminalLine[];
}

interface GithubStats {
  repos: number;
  followers: number;
}

interface TerminalsProps {
  heroRef: React.RefObject<HTMLElement | null>;
}

interface ContactRowProps {
  stats: GithubStats | null;
}

/*  Sub-components  */

function Terminals({ heroRef }: TerminalsProps) {
  const termRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mouse = useRef({ x: -999, y: -999 });
  const yOffsets = useRef(TERMINALS.map((t: Terminal) => t.y));

  useEffect(() => {
    const on = (e: MouseEvent) => {
      const hero = heroRef?.current;
      if (!hero) { mouse.current = { x: -999, y: -999 }; return; }
      const r = hero.getBoundingClientRect();
      if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
        mouse.current = { x: e.clientX, y: e.clientY };
      } else {
        mouse.current = { x: -999, y: -999 };
      }
    };
    window.addEventListener('mousemove', on, { passive: true });
    return () => window.removeEventListener('mousemove', on);
  }, [heroRef]);

  useEffect(() => {
    let raf: number;
    const tick = () => {
      const mx = mouse.current.x, my = mouse.current.y;
      termRefs.current.forEach((el, i) => {
        if (!el) return;
        const term = TERMINALS[i];

        yOffsets.current[i] += term.speed;
        if (yOffsets.current[i] > 110) yOffsets.current[i] = -20;

        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = cx - mx, dy = cy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 400;
        let op = 0.02;
        if (dist < radius) {
          const t = 1 - dist / radius;
          op = 0.02 + t * 0.35;
        }

        el.style.transform = `translateY(${yOffsets.current[i] - term.y}vh)`;
        el.style.opacity = String(op);
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className={styles['h-terms']} aria-hidden="true">
      {TERMINALS.map((term: Terminal, i: number) => (
        <div
          key={term.title}
          ref={(el) => { termRefs.current[i] = el; }}
          className={styles['h-term']}
          style={{ left: `${term.x}%`, top: `${term.y}%`, width: term.w, height: term.h }}
        >
          <div className={styles['h-term-bar']}>
            <span className={styles['h-term-dots']}>
              <i className={styles['h-dot-r']} /><i className={styles['h-dot-y']} /><i className={styles['h-dot-g']} />
            </span>
            <span className={styles['h-term-title']}>{term.title}</span>
          </div>
          <div className={styles['h-term-body']}>
            {term.lines.map((l: TerminalLine, li: number) =>
              l.prompt ? (
                <div key={li} className={`${styles['h-term-line']} ${styles['h-term-prompt']}`}>
                  <span className={styles['h-prompt-arrow']}>➜</span>
                  <span className={styles['h-prompt-path']}>{l.path}</span>
                  {l.branch && <span className={styles['h-prompt-branch']}> ({l.branch})</span>}
                </div>
              ) : (
                <div key={li} className={styles['h-term-line']} style={{ color: l.c }}>{l.t}</div>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function Avatar() {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`${styles['h-avatar']} ${loaded ? styles['is-visible'] : ''}`}>
      <a
        href={`https://github.com/${profile.githubUsername}`}
        target="_blank"
        rel="noopener noreferrer"
        className={styles['h-avatar-link']}
      >
        <div className={styles['h-avatar-glow']} />
        <img
          src={`https://github.com/${profile.githubUsername}.png`}
          alt={profile.githubUsername}
          className={styles['h-avatar-img']}
          onLoad={() => setLoaded(true)}
        />
      </a>
    </div>
  );
}

function ToolStrip() {
  return (
    <div className={styles['h-tools']}>
      <div className={styles['h-tools-track']}>
        {[...TOOLS, ...TOOLS].map((t, i) => (
          <span key={`${t.label}-${i}`} className={styles['h-tool']}>
            {t.icon({ size: 16 })}
            <span className={styles['h-tool-label']}>{t.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const heroIconMap = {
  github: FiGithub,
  linkedin: FiLinkedin,
  discord: SiDiscord,
} as const;

function ContactRow({ stats }: ContactRowProps) {
  return (
    <div className={styles['h-contacts']}>
      {socialLinks.map((link) => {
        const Icon = heroIconMap[link.icon];
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className={styles['h-contact']}
            aria-label={link.label}
          >
            <Icon size={14} />
          </a>
        );
      })}
      <a
        href={`mailto:${profile.email}`}
        className={styles['h-contact']}
        aria-label="Email"
      >
        <FiMail size={14} />
      </a>

      <a
        href={profile.resumeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles['h-resume']}
      >
        <FiDownload size={12} />
        <span>resume</span>
      </a>

      {stats && (
        <>
          <span className={styles['h-dot']} />
          <span className={styles['h-stat']}>{stats.repos} repos</span>
          <span className={styles['h-dot']} />
          <span className={styles['h-stat']}>{stats.followers} followers</span>
        </>
      )}
    </div>
  );
}

/*  Hero ─ */

export default function Hero() {
  const [show, setShow] = useState(false);
  const typed = useTypewriter(TYPEWRITER_STRINGS, 45, 2200);
  const stats = useGithubStats(profile.githubUsername);
  const sectionRef = useRef<HTMLElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useGSAP(
    () => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.5,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      });
    },
    { scope: sectionRef },
  );

  useGSAP(
    () => {
      if (!show) return;

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
      });

      tl.fromTo(
        `.${styles['h-avatar']}`,
        { scale: 0.8, opacity: 0, y: 20, filter: 'blur(8px)' },
        { scale: 1, opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8 },
      )
        .fromTo(
          `.${styles['h-name']}`,
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, stagger: 0.15 },
          '-=0.4',
        )
        .fromTo(
          `.${styles['h-role']}`,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.4',
        )
        .fromTo(
          `.${styles['h-tools']}`,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.3',
        )
        .fromTo(
          `.${styles['h-contacts']}`,
          { y: 15, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6 },
          '-=0.3',
        )
        .fromTo(
          `.${styles['h-tagline']}`,
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5 },
          '-=0.3',
        )
        .fromTo(
          `.${styles['h-scroll']}`,
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.5 },
          '-=0.2',
        );

      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.95,
        filter: 'blur(10px)',
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
          invalidateOnRefresh: true,
        },
      });
    },
    { scope: sectionRef, dependencies: [show] },
  );

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let rafId: number;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        const el = sectionRef.current;
        const overlay = overlayRef.current;
        if (!el || !overlay) return;
        const rect = el.getBoundingClientRect();
        const h = el.clientHeight;
        const next = Math.max(0, Math.min(1, rect.bottom / h));
        overlay.style.opacity = String(next);
        overlay.style.visibility = next < 0.01 ? 'hidden' : 'visible';
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollDown = useCallback(() => {
    document.getElementById('about')?.scrollIntoView();
  }, []);

  return (
    <section id="hero" ref={sectionRef} className={`${styles.section} ${styles['section--hero']}`}>
      <div ref={overlayRef} className={styles['h-overlay']}>
        <Terminals heroRef={sectionRef} />

        <div className={styles['h-main']}>
          <Avatar />

          <h1 className={styles['h-name']}>
            <span className={styles['h-name-first']}>{profile.firstName}</span>
            <span className={styles['h-name-last']}>{profile.lastName}</span>
          </h1>

          <p className={styles['h-role']}>
            {'> '}
            {typed}
            <span className={styles['h-cursor']} />
          </p>

          <ToolStrip />

          <ContactRow stats={stats} />

          <p className={styles['h-tagline']}>full-stack · creative · open source</p>
        </div>

        <button className={styles['h-scroll']} onClick={scrollDown} aria-label="Scroll down">
          <FiArrowDown size={13} />
        </button>
      </div>
    </section>
  );
}
