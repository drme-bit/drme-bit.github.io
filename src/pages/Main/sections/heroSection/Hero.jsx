import { useState, useEffect, useRef, useCallback } from 'react';
import useCursorParallax from '@/hooks/useCursorParallax';
import './Hero.scss';

const GITHUB_USERNAME = 'drme-bit';

const LANGUAGES = [
  { label: 'c', name: 'C', code: '#include <stdio.h>\nint main() {\n printf("Hello, world!");\n return 0; \n}' },
  { label: 'cpp', name: 'C++', code: '#include <iostream>\nint main() { std::cout << "Hello, world!" << std::endl; return 0; }' },
  { label: 'java', name: 'Java', code: 'public class Main { public static void main(String[] args) { System.out.println("Hello, world!"); } }' },
  { label: 'cs', name: 'C#', code: 'using System;\nclass Program { static void Main() { Console.WriteLine("Hello, world!"); } }' },
  { label: 'py', name: 'Python', code: 'print("Hello, world!")' },
  { label: 'js', name: 'JavaScript', code: 'console.log("Hello, world!");' },
  { label: 'ts', name: 'TypeScript', code: 'console.log("Hello, world!");' },
  { label: 'rs', name: 'Rust', code: 'println!("Hello, world!");' },
];

const TYPE_SPEED = 55;
const HOLD_AFTER_TYPED = 1500;
const STATS_CACHE_PREFIX = 'gh-stats:';
const COUNT_UP_DURATION = 900;

function useTypewriter(languages, lockedIndex) {
  const [display, setDisplay] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const idxRef = useRef(0);
  const charRef = useRef(0);
  const dirRef = useRef(1);
  const lockedRef = useRef(lockedIndex);
  const resumeRef = useRef(false);

  const prevLockedRef = useRef(lockedIndex);
  useEffect(() => {
    const wasLocked = prevLockedRef.current !== null;
    const isLocked = lockedIndex !== null;
    if (prevLockedRef.current !== lockedIndex) {
      resumeRef.current = true;
      if (wasLocked && !isLocked) dirRef.current = -1;
      prevLockedRef.current = lockedIndex;
    }
    lockedRef.current = lockedIndex;
  }, [lockedIndex]);

  useEffect(() => {
    if (lockedIndex === null) return;
    idxRef.current = lockedIndex;
    charRef.current = 0;
    dirRef.current = 1;
    setActiveIndex(lockedIndex);
    setDisplay('');
  }, [lockedIndex]);

  useEffect(() => {
    let paused = false;
    let pauseTimer;

    const tick = () => {
      if (resumeRef.current) {
        resumeRef.current = false;
        paused = false;
        clearTimeout(pauseTimer);
      }
      if (paused) return;
      const locked = lockedRef.current;
      const line = languages[idxRef.current];

      if (dirRef.current === 1) {
        charRef.current++;
        if (charRef.current >= line.code.length) {
          charRef.current = line.code.length;
          setDisplay(line.code);
          if (locked !== null) { paused = true; return; }
          dirRef.current = -1;
          paused = true;
          pauseTimer = setTimeout(() => { paused = false; }, HOLD_AFTER_TYPED);
          return;
        }
        setDisplay(line.code.slice(0, charRef.current));
        return;
      }

      charRef.current--;
      if (charRef.current < 0) {
        charRef.current = 0;
        dirRef.current = 1;
        idxRef.current = (idxRef.current + 1) % languages.length;
        setActiveIndex(idxRef.current);
        setDisplay('');
        return;
      }
      setDisplay(languages[idxRef.current].code.slice(0, charRef.current));
    };

    const interval = setInterval(tick, TYPE_SPEED);
    return () => { clearInterval(interval); clearTimeout(pauseTimer); };
  }, [languages]);

  return { display, activeIndex };
}

/*
  Fetches { repos, followers } from the GitHub REST API once per session.
  `animate` is true only on a fresh network fetch (not a cache hit), so the
  count-up effect plays once per session rather than every time this
  component mounts.
*/
function useGithubStats(username) {
  const [stats, setStats] = useState(null); // null = not available, don't render
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = STATS_CACHE_PREFIX + username;

    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.repos === 'number' && typeof parsed.followers === 'number') {
          setStats(parsed);
          return; // cache hit: no fetch, no animation
        }
      }
    } catch {
      // corrupted cache entry — fall through to a fresh fetch
    }

    fetch(`https://api.github.com/users/${username}`)
      .then((res) => {
        if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const next = { repos: data.public_repos, followers: data.followers };
        if (typeof next.repos !== 'number' || typeof next.followers !== 'number') {
          throw new Error('Unexpected GitHub API response shape');
        }
        setStats(next);
        setAnimate(true);
        try { sessionStorage.setItem(cacheKey, JSON.stringify(next)); } catch { /* storage full/unavailable — non-fatal */ }
      })
      .catch(() => {
        // network failure, rate limit, unexpected shape — stay null, render nothing
      });

    return () => { cancelled = true; };
  }, [username]);

  return { stats, animate };
}

function useCountUp(target, shouldAnimate) {
  const [value, setValue] = useState(shouldAnimate ? 0 : target);
  const startedRef = useRef(false);

  useEffect(() => {
    if (target == null) return;
    if (!shouldAnimate) { setValue(target); return; }
    if (startedRef.current) return;
    startedRef.current = true;

    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / COUNT_UP_DURATION);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, shouldAnimate]);

  return value;
}

function StatsStrip({ username }) {
  const { stats, animate } = useGithubStats(username);
  const repos = useCountUp(stats?.repos ?? null, animate);
  const followers = useCountUp(stats?.followers ?? null, animate);

  if (!stats) return null; // fetch failed or pending — show nothing, not a broken state

  return (
    <div className="hero-stats">
      <span className="hero-stat">
        <span className="hero-stat-value">{repos}</span>
        <span className="hero-stat-label">repos</span>
      </span>
      <span className="hero-stat-sep" />
      <span className="hero-stat">
        <span className="hero-stat-value">{followers}</span>
        <span className="hero-stat-label">followers</span>
      </span>
    </div>
  );
}

function GithubGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
        0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
        -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66
        .07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
        0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82
        a7.58 7.58 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12
        .51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48
        0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
    </svg>
  );
}
function LinkedinGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.5 2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zM1 6h5v9H1V6zm6.5 0H13v1.3
        c.6-.9 1.6-1.5 3-1.5 2.4 0 3.5 1.6 3.5 4.5V15h-5v-4.2c0-1-.4-1.8-1.4-1.8
        -.8 0-1.3.5-1.5 1-.1.2-.1.5-.1.8V15h-5V6z" transform="translate(-1,0)"/>
    </svg>
  );
}
function MailGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="1.5" y="3" width="13" height="10" rx="1" />
      <path d="M2 4l6 5 6-5" />
    </svg>
  );
}

/*
  Contact row. LinkedIn and email are placeholders — replace REPLACE_ME
  before shipping.
*/
function ContactRow() {
  const links = [
    { label: 'GitHub', href: `https://github.com/${GITHUB_USERNAME}`, Icon: GithubGlyph },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/REPLACE_ME', Icon: LinkedinGlyph },
    { label: 'Email', href: 'mailto:REPLACE_ME@example.com', Icon: MailGlyph },
  ];
  return (
    <div className="hero-contacts">
      {links.map(({ label, href, Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith('mailto:') ? undefined : '_blank'}
          rel={href.startsWith('mailto:') ? undefined : 'noopener noreferrer'}
          className="hero-contact-link"
          aria-label={label}
          title={label}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}

export default function Hero() {
  const [p, setP] = useState(0);
  const [lockedIndex, setLockedIndex] = useState(null);
  const ref = useRef(null);

  const { display, activeIndex } = useTypewriter(LANGUAGES, lockedIndex);
  const parallax = useCursorParallax();

  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const h = el.clientHeight;
      setP(Math.max(0, Math.min(1, (h - r.bottom) / (h * 0.35))));
    };
    window.addEventListener('scroll', onScroll);
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleBadgeClick = useCallback((index) => {
    setLockedIndex((current) => (current === index ? null : index));
  }, []);

  const activeLanguage = LANGUAGES[activeIndex];
  const faded = p >= 0.98;

  const avatarTransform = `translate(${parallax.x * -8}px, ${parallax.y * -6}px)`;
  const typeTransform = `translate(${parallax.x * -4}px, ${parallax.y * -3}px)`;

  return (
    <section id="hero" ref={ref}>
      <div
        className="hero-overlay"
        style={{
          opacity: 1 - p,
          visibility: faded ? 'hidden' : 'visible',
          pointerEvents: faded ? 'none' : undefined,
        }}
      >
        <div className="hero-avatar-col" style={{ transform: avatarTransform }}>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hero-avatar-link"
          >
            <img
              src={`https://github.com/${GITHUB_USERNAME}.png`}
              alt={GITHUB_USERNAME}
              className="hero-avatar"
            />
          </a>
          <span className="hero-avatar-status" />
          <ContactRow />
        </div>

        <div className="hero-type-area" style={{ transform: typeTransform }}>
          <div className="hero-typewrap">
            <span className="hero-type-code">
              {display}
              <span className="hero-type-cursor">|</span>
            </span>
          </div>
          <span className="hero-type-lang">// {activeLanguage.name}</span>

          <div className="hero-langs">
            {LANGUAGES.map((l, i) => {
              const isActive = i === activeIndex;
              const isLocked = i === lockedIndex;
              return (
                <span
                  key={l.label}
                  className={`hero-lang-badge${isActive ? ' is-active' : ''}${isLocked ? ' is-locked' : ''}`}
                  title={isLocked ? `${l.name} — click to resume auto-cycle` : l.name}
                  onClick={() => handleBadgeClick(i)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleBadgeClick(i); }}
                >
                  {l.label}
                </span>
              );
            })}
          </div>

          <StatsStrip username={GITHUB_USERNAME} />

          <p className="hero-tagline">full-stack · creative technology</p>
        </div>

        <svg className="hero-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v16M18 14l-6 6-6-6" />
        </svg>
      </div>
    </section>
  );
}