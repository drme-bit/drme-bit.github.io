import { useState, useEffect, useRef, useCallback } from 'react';
import './Hero.scss';

/*
  Hero v2.

  Fixes from the original:
  - LINES and LANGUAGES were two separate, out-of-sync lists (Ruby/C/Java/Swift
    typed but not badged; TypeScript badged but never typed). Merged into one
    LANGUAGES source of truth so the typewriter and the badges always agree.
  - hero-overlay kept pointer-events:auto on its children even at opacity:0
    after scrolling past the hero, leaving an invisible clickable hitbox.
    Now toggles visibility/pointer-events once scroll progress is ~complete.
  - Status dot was the one green accent in an otherwise B/W + cyan system;
    switched to the cyan accent for consistency.

  New behavior:
  - The badge under the currently-typed language is highlighted in sync with
    the typewriter, in both auto-cycle and locked modes.
  - Clicking a badge locks the typewriter onto that language (typed out, then
    held — no auto-erase). Clicking the same badge again releases back to
    auto-cycling, resuming from its current position rather than restarting.
  - A light cursor-parallax shifts the avatar and type area slightly opposite
    the mouse position, with the avatar moving a bit more than the text for a
    subtle depth cue.
*/

const LANGUAGES = [
  { label: 'py', name: 'Python', code: 'print("Hello, world!")' },
  { label: 'js', name: 'JavaScript', code: 'console.log("Hello, world!");' },
  { label: 'ts', name: 'TypeScript', code: 'console.log("Hello, world!");' },
  { label: 'go', name: 'Go', code: 'fmt.Println("Hello, world!")' },
  { label: 'rs', name: 'Rust', code: 'println!("Hello, world!");' },
  { label: 'kt', name: 'Kotlin', code: 'println("Hello, world!")' },
];

const TYPE_SPEED = 55;
const HOLD_AFTER_TYPED = 1500;

/*
  lockedIndex: null in auto mode, or a language index when the user has
  clicked a badge. activeIndex is whatever line is currently being displayed
  (auto-advancing or locked) — this drives the badge highlight either way.
*/
function useTypewriter(languages, lockedIndex) {
  const [display, setDisplay] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);

  const idxRef = useRef(0);
  const charRef = useRef(0);
  const dirRef = useRef(1);
  const lockedRef = useRef(lockedIndex);
  const resumeRef = useRef(false); // flips true for one tick right after an unlock

  const prevLockedRef = useRef(lockedIndex);
  useEffect(() => {
    const wasLocked = prevLockedRef.current !== null;
    const isLocked = lockedIndex !== null;
    if (prevLockedRef.current !== lockedIndex) {
      resumeRef.current = true;
      if (wasLocked && !isLocked) {
        // releasing a hold: the held line is already fully typed, so the
        // next tick should erase it, not re-trigger the "just finished
        // typing" branch (which would re-enter a pause instead of erasing).
        dirRef.current = -1;
      }
      prevLockedRef.current = lockedIndex;
    }
    lockedRef.current = lockedIndex;
  }, [lockedIndex]);

  // when a lock is newly applied, snap to that line and restart its typing
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

          if (locked !== null) {
            // hold indefinitely on the locked line — no erase, no advance.
            // resumeRef (set by the effect above) is the only way out of this.
            paused = true;
            return;
          }
          dirRef.current = -1;
          paused = true;
          pauseTimer = setTimeout(() => { paused = false; }, HOLD_AFTER_TYPED);
          return;
        }
        setDisplay(line.code.slice(0, charRef.current));
        return;
      }

      // erasing (auto mode, or just-released lock resuming its erase)
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
    return () => {
      clearInterval(interval);
      clearTimeout(pauseTimer);
    };
  }, [languages]);

  return { display, activeIndex };
}

function useCursorParallax() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const onMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      setOffset({ x: nx, y: ny });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return offset;
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
            href="https://github.com/drme-bit"
            target="_blank"
            rel="noopener noreferrer"
            className="hero-avatar-link"
          >
            <img
              src="https://github.com/drme-bit.png"
              alt="drme-bit"
              className="hero-avatar"
            />
          </a>
          <span className="hero-avatar-status" />
        </div>

        <div className="hero-type-area" style={{ transform: typeTransform }}>
          <div className="hero-typewrap">
            <span className="hero-type-code">{display}</span>
            <span className="hero-type-cursor">|</span>
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
          <p className="hero-tagline">full-stack · creative technology</p>
        </div>

        <svg className="hero-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 4v16M18 14l-6 6-6-6" />
        </svg>
      </div>
    </section>
  );
}