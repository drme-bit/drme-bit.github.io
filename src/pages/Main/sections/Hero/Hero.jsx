import { useState, useEffect, useRef, useCallback } from 'react';
import { SiReact, SiThreedotjs, SiVite, SiDocker, SiNodedotjs, SiPython, SiRust, SiTypescript, SiGit, SiLinux, SiPostgresql, SiRedis } from 'react-icons/si';
import { FiGithub, FiLinkedin, FiMail, FiArrowDown } from 'react-icons/fi';
import './Hero.scss';

const GITHUB_USERNAME = 'drme-bit';

const TOOLS = [
  { label: 'React', icon: SiReact },
  { label: 'Three.js', icon: SiThreedotjs },
  { label: 'Vite', icon: SiVite },
  { label: 'Docker', icon: SiDocker },
  { label: 'Node.js', icon: SiNodedotjs },
  { label: 'Python', icon: SiPython },
  { label: 'Rust', icon: SiRust },
  { label: 'TypeScript', icon: SiTypescript },
  { label: 'Git', icon: SiGit },
  { label: 'Linux', icon: SiLinux },
  { label: 'PostgreSQL', icon: SiPostgresql },
  { label: 'Redis', icon: SiRedis },
];

const STATS_CACHE = 'gh-stats:';

/* ─── Hooks ─────────────────────────────────────────────────── */

function useTypewriter(strings, speed = 50, hold = 2000) {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState('type');
  const charRef = useRef(0);

  useEffect(() => {
    charRef.current = 0;
    setText('');
    setPhase('type');
  }, [idx]);

  useEffect(() => {
    const s = strings[idx];
    if (phase === 'type') {
      if (charRef.current >= s.length) {
        const t = setTimeout(() => setPhase('hold'), hold);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        charRef.current++;
        setText(s.slice(0, charRef.current));
      }, speed);
      return () => clearTimeout(t);
    }
    if (phase === 'hold') {
      const t = setTimeout(() => setPhase('erase'), hold);
      return () => clearTimeout(t);
    }
    if (phase === 'erase') {
      if (charRef.current <= 0) {
        setIdx((i) => (i + 1) % strings.length);
        return;
      }
      const t = setTimeout(() => {
        charRef.current--;
        setText(s.slice(0, charRef.current));
      }, speed / 2);
      return () => clearTimeout(t);
    }
  }, [text, phase, idx, strings, speed, hold]);

  return text;
}

function useGithubStats(username) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const key = STATS_CACHE + username;
    try {
      const c = sessionStorage.getItem(key);
      if (c) { setStats(JSON.parse(c)); return; }
    } catch {}
    fetch(`https://api.github.com/users/${username}`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((d) => {
        if (cancelled) return;
        const s = { repos: d.public_repos, followers: d.followers };
        setStats(s);
        try { sessionStorage.setItem(key, JSON.stringify(s)); } catch {}
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [username]);

  return stats;
}

function useCountUp(target, duration = 800) {
  const [val, setVal] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    if (target == null || done.current) return;
    done.current = true;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      setVal(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return val;
}

/* ─── Sub-components ────────────────────────────────────────── */

const TERMINALS = [
  {
    x: 5, y: -10, w: 360, h: 220,
    speed: 0.12,
    title: 'zsh — ~/projects/nexagon',
    lines: [
      { prompt: true, path: '~/nexagon', branch: 'main' },
      { t: 'cargo run --release', c: '#7dd3fc' },
      { t: '   Compiling nexagon v0.1.0', c: 'rgba(232,228,223,0.35)' },
      { t: '   Finished release [optimized] (+3.2s)', c: 'rgba(167,243,208,0.6)' },
      { t: '   Running `target/release/nexagon`', c: 'rgba(232,228,223,0.35)' },
      { t: '🚀 Server listening on 0.0.0.0:8080', c: 'rgba(167,243,208,0.7)' },
    ],
  },
  {
    x: 55, y: -30, w: 340, h: 200,
    speed: 0.09,
    title: 'zsh — ~/projects/portfolio',
    lines: [
      { prompt: true, path: '~/portfolio', branch: 'hero-redesign' },
      { t: 'npm run dev', c: '#7dd3fc' },
      { t: '', c: '' },
      { t: '  VITE v8.1.0  ready in 320ms', c: 'rgba(167,243,208,0.6)' },
      { t: '', c: '' },
      { t: '  ➜  Local:   http://localhost:5173/', c: 'rgba(232,228,223,0.45)' },
      { t: '  ➜  Network: http://192.168.1.5:5173/', c: 'rgba(232,228,223,0.3)' },
    ],
  },
  {
    x: 30, y: -50, w: 330, h: 190,
    speed: 0.15,
    title: 'zsh — ~/leetcode',
    lines: [
      { prompt: true, path: '~/leetcode', branch: 'python' },
      { t: 'python3 solve.py --difficulty medium', c: '#7dd3fc' },
      { t: '', c: '' },
      { t: '  [✓] 0015.3sum          48ms', c: 'rgba(167,243,208,0.6)' },
      { t: '  [✓] 0042.trapping_water  32ms', c: 'rgba(167,243,208,0.6)' },
      { t: '  [✓] 0076.min_window    61ms', c: 'rgba(167,243,208,0.6)' },
      { t: '  ─── 12/15 passed ───', c: 'rgba(232,228,223,0.3)' },
    ],
  },
  {
    x: 65, y: -20, w: 320, h: 180,
    speed: 0.11,
    title: 'zsh — ~',
    lines: [
      { prompt: true, path: '~', branch: '' },
      { t: 'docker compose up -d', c: '#7dd3fc' },
      { t: '', c: '' },
      { t: '  ✔ Network portfolio_default  Created', c: 'rgba(167,243,208,0.5)' },
      { t: '  ✔ Container postgres         Started', c: 'rgba(167,243,208,0.5)' },
      { t: '  ✔ Container redis            Started', c: 'rgba(167,243,208,0.5)' },
    ],
  },
  {
    x: 10, y: -60, w: 310, h: 170,
    speed: 0.14,
    title: 'zsh — ~/projects/nexagon',
    lines: [
      { prompt: true, path: '~/nexagon', branch: 'feat/auth' },
      { t: 'git log --oneline -4', c: '#7dd3fc' },
      { t: 'f3a1c2d (HEAD → feat/auth) add jwt middleware', c: 'rgba(232,228,223,0.4)' },
      { t: '8b2e4a1 implement rate limiter', c: 'rgba(232,228,223,0.4)' },
      { t: 'c7d9f03 setup oauth2 provider', c: 'rgba(232,228,223,0.4)' },
      { t: 'e1a5b78 init auth module', c: 'rgba(232,228,223,0.4)' },
    ],
  },
  {
    x: 58, y: -45, w: 300, h: 160,
    speed: 0.1,
    title: 'zsh — ~/projects/roblox',
    lines: [
      { prompt: true, path: '~/roblox', branch: 'main' },
      { t: 'pytest tests/ -v', c: '#7dd3fc' },
      { t: '', c: '' },
      { t: '  tests/test_solver.py::test_coin_change PASSED', c: 'rgba(167,243,208,0.5)' },
      { t: '  tests/test_solver.py::test_lru_cache PASSED', c: 'rgba(167,243,208,0.5)' },
      { t: '  ═══════ 24 passed in 1.82s ═══════', c: 'rgba(232,228,223,0.35)' },
    ],
  },
];

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
          key={i}
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

function Particles() {
  const ref = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const on = (e) => { mouse.current = { x: e.clientX, y: e.clientY }; };
    window.addEventListener('mousemove', on, { passive: true });
    return () => window.removeEventListener('mousemove', on);
  }, []);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize();
    addEventListener('resize', resize);

    const N = 45;
    const LINK = 150;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * c.width,
      y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: -Math.random() * 0.06 - 0.01,
      r: Math.random() * 1.3 + 0.4,
      a: Math.random() * 0.2 + 0.05,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      const mx = mouse.current.x, my = mouse.current.y;

      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = c.height + 10; p.x = Math.random() * c.width; }
        if (p.x < -10 || p.x > c.width + 10) p.x = Math.random() * c.width;

        const dx = p.x - mx, dy = p.y - my;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100 && d > 0) {
          const f = (100 - d) / 100 * 0.25;
          p.x += (dx / d) * f;
          p.y += (dy / d) * f;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.283);
        ctx.fillStyle = `rgba(232,228,223,${p.a})`;
        ctx.fill();

        for (let j = i + 1; j < N; j++) {
          const q = pts[j];
          const lx = p.x - q.x, ly = p.y - q.y;
          const ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < LINK) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(232,228,223,${(1 - ld / LINK) * 0.05})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="h-canvas" />;
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
          <span key={i} className="h-tool">
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
  const typed = useTypewriter(
    ['full-stack developer', 'creative technologist', 'open source contributor'],
    45,
    2200,
  );
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
        <Particles />
        <Terminals heroRef={sectionRef} />

        <div className={`h-main ${show ? 'is-show' : ''}`}>
          <Avatar />

          <h1 className="h-name">
            <span className="h-name-first">Vyacheslav</span>
            <span className="h-name-last">Tkachik</span>
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
