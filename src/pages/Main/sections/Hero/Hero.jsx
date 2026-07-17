import { useState, useEffect, useRef, useCallback } from 'react';
import { FiGithub, FiLinkedin, FiMail, FiArrowDown } from 'react-icons/fi';
import useTypewriter from '@/hooks/useTypewriter';
import useGithubStats from '@/hooks/useGithubStats';
import { getAccentRGB } from '@/utils/color';
import { TOOLS } from '@/data/hero/tools';
import { TERMINALS } from '@/data/hero/terminals';
import { TYPEWRITER_STRINGS, GITHUB_USERNAME } from '@/data/hero/config';
import './Hero.scss';

/* ─── Sub-components ────────────────────────────────────────── */

function Terminals({ heroRef }) {
  const termRefs = useRef([]);
  const mouse = useRef({ x: -999, y: -999 });
  const yOffsets = useRef(TERMINALS.map((t) => t.y));

  useEffect(() => {
    const on = (e) => {
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
    let raf;
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
        el.style.opacity = op;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="h-terms" aria-hidden="true">
      {TERMINALS.map((term, i) => (
        <div
          key={term.title}
          ref={(el) => { termRefs.current[i] = el; }}
          className="h-term"
          style={{ left: `${term.x}%`, top: `${term.y}%`, width: term.w, height: term.h }}
        >
          <div className="h-term-bar">
            <span className="h-term-dots">
              <i className="h-dot-r" /><i className="h-dot-y" /><i className="h-dot-g" />
            </span>
            <span className="h-term-title">{term.title}</span>
          </div>
          <div className="h-term-body">
            {term.lines.map((l, li) =>
              l.prompt ? (
                <div key={li} className="h-term-line h-term-prompt">
                  <span className="h-prompt-arrow">➜</span>
                  <span className="h-prompt-path">{l.path}</span>
                  {l.branch && <span className="h-prompt-branch"> ({l.branch})</span>}
                </div>
              ) : (
                <div key={li} className="h-term-line" style={{ color: l.c }}>{l.t}</div>
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
    <div className={`h-avatar ${loaded ? 'is-visible' : ''}`}>
      <a
        href={`https://github.com/${GITHUB_USERNAME}`}
        target="_blank"
        rel="noopener noreferrer"
        className="h-avatar-link"
      >
        <div className="h-avatar-glow" />
        <img
          src={`https://github.com/${GITHUB_USERNAME}.png`}
          alt={GITHUB_USERNAME}
          className="h-avatar-img"
          onLoad={() => setLoaded(true)}
        />
      </a>
    </div>
  );
}

function ToolStrip() {
  return (
    <div className="h-tools">
      <div className="h-tools-track">
        {[...TOOLS, ...TOOLS].map((t, i) => (
          <span key={`${t.label}-${i}`} className="h-tool">
            {t.icon({ size: 16 })}
            <span className="h-tool-label">{t.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function ContactRow({ stats }) {
  const links = [
    { Icon: FiGithub, href: `https://github.com/${GITHUB_USERNAME}`, label: 'GitHub' },
    { Icon: FiLinkedin, href: 'https://linkedin.com/in/vyacheslav-tkachik-2a3b8a277', label: 'LinkedIn' },
    { Icon: FiMail, href: 'mailto:vacheslavtkachik@gmail.com', label: 'Email' },
  ];

  return (
    <div className="h-contacts">
      {links.map(({ Icon, href, label }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith('mailto') ? undefined : '_blank'}
          rel={href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
          className="h-contact"
          aria-label={label}
        >
          <Icon size={14} />
        </a>
      ))}
      {stats && (
        <>
          <span className="h-dot" />
          <span className="h-stat">{stats.repos} repos</span>
          <span className="h-dot" />
          <span className="h-stat">{stats.followers} followers</span>
        </>
      )}
    </div>
  );
}

/* ─── Hero ──────────────────────────────────────────────────── */

export default function Hero() {
  const [show, setShow] = useState(false);
  const typed = useTypewriter(TYPEWRITER_STRINGS, 45, 2200);
  const stats = useGithubStats(GITHUB_USERNAME);
  const sectionRef = useRef(null);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const h = el.clientHeight;
      setOpacity(Math.max(0, Math.min(1, rect.bottom / h)));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollDown = useCallback(() => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <section id="hero" ref={sectionRef} className="section section--hero">
      <div
        className="h-overlay"
        style={{
          opacity,
          visibility: opacity < 0.01 ? 'hidden' : undefined,
        }}
      >
        <Terminals heroRef={sectionRef} />

        <div className={`h-main ${show ? 'is-show' : ''}`}>
          <Avatar />

          <h1 className="h-name">
            <span className="h-name-first">Vyacheslav</span>
            <span className="h-name-last">Tkachyk</span>
          </h1>

          <p className="h-role">
            {'> '}{typed}
            <span className="h-cursor" />
          </p>

          <ToolStrip />

          <ContactRow stats={stats} />

          <p className="h-tagline">full-stack · creative · open source</p>
        </div>

        <button className="h-scroll" onClick={scrollDown} aria-label="Scroll down">
          <div className="h-scroll-line" />
          <FiArrowDown size={13} />
        </button>
      </div>
    </section>
  );
}
