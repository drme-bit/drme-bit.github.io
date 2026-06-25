import { useState, useEffect, useRef } from 'react';

/*
  Boot screen — visually aligned with the iso-terrain scene: a system/scanner
  init readout rather than a hacker-terminal trope. Copy is written as if the
  site itself is calibrating the terrain sensor you see once it loads.

  Behavioral fix vs. the original: completion no longer relies on a hand-
  computed TOTAL_DURATION guess that has to be kept in sync with LINES.length
  and LINE_INTERVAL by hand. Instead the fade-out timer starts the moment the
  typewriter actually finishes typing the last line, plus a short fixed hold.
  This stays correct no matter how LINES or LINE_INTERVAL change later.

  Session gating: call shouldShowBootScreen() once, before mount, and only
  render <BootScreen /> if it returns true. It flips the sessionStorage flag
  immediately, so a mid-boot refresh doesn't replay the sequence.
*/

const LINES = [
  '> SYSTEM BOOT v2.4.1',
  '> INITIALIZING CORE MODULES...',
  '> LOADING TERRAIN MODEL....... [OK]',
  '> CALIBRATING SENSOR ARRAY.... [OK]',
  '> SYNCING COORDINATE GRID..... [OK]',
  '> RENDERING INTERFACE.........',
  '',
  '> WELCOME, OPERATOR.',
];

const LINE_INTERVAL = 380;
const TYPE_SPEED = 45;
const HOLD_AFTER_TYPING = 600;
const FADE_DURATION = 400;

const STORAGE_KEY = 'bootScreenShown';

export function shouldShowBootScreen() {
  if (typeof window === 'undefined') return false;
  if (sessionStorage.getItem(STORAGE_KEY)) return false;
  sessionStorage.setItem(STORAGE_KEY, '1');
  return true;
}

export default function BootScreen({ onComplete }) {
  const [gone, setGone] = useState(false);
  const [revealed, setRevealed] = useState(1);
  const [typed, setTyped] = useState(0);
  const completionStarted = useRef(false);

  const last = LINES[LINES.length - 1];

  useEffect(() => {
    if (revealed >= LINES.length) return;
    const t = setTimeout(() => setRevealed((n) => n + 1), LINE_INTERVAL);
    return () => clearTimeout(t);
  }, [revealed]);

  useEffect(() => {
    if (revealed < LINES.length || typed >= last.length) return;
    const t = setTimeout(() => setTyped((n) => n + 1), TYPE_SPEED);
    return () => clearTimeout(t);
  }, [revealed, typed, last.length]);

  // start the exit sequence the moment typing actually finishes, not on a
  // pre-computed guess — robust to any change in copy or timing constants
  useEffect(() => {
    const typingDone = revealed >= LINES.length && typed >= last.length;
    if (!typingDone || completionStarted.current) return;
    completionStarted.current = true;

    const t = setTimeout(() => {
      setGone(true);
      setTimeout(onComplete, FADE_DURATION);
    }, HOLD_AFTER_TYPING);
    return () => clearTimeout(t);
  }, [revealed, typed, last.length, onComplete]);

  const progress = Math.min((revealed / LINES.length) * 100, 100);

  return (
    <div style={{ ...styles.overlay, opacity: gone ? 0 : 1, pointerEvents: gone ? 'none' : 'auto' }}>
      <div style={styles.frame}>
        <span style={{ ...styles.tick, ...styles.tickTL }} />
        <span style={{ ...styles.tick, ...styles.tickTR }} />
        <span style={{ ...styles.tick, ...styles.tickBL }} />
        <span style={{ ...styles.tick, ...styles.tickBR }} />

        <div style={styles.inner}>
          {LINES.map((line, i) => {
            const show = i < revealed;
            const isLast = i === LINES.length - 1;
            const text = show
              ? isLast
                ? line.slice(0, typed) + (typed < line.length ? '_' : '')
                : line
              : '';
            return (
              <p key={i} style={styles.line}>
                {formatLine(text)}
              </p>
            );
          })}
          <div style={styles.barTrack}>
            <div style={{ ...styles.barFill, width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

// renders "[OK]" in cyan, everything else in the default line color
function formatLine(text) {
  const parts = text.split(/(\[OK\])/g);
  return parts.map((part, i) =>
    part === '[OK]'
      ? <span key={i} style={styles.ok}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

const ACCENT = '#5ec8d8';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    transition: `opacity ${FADE_DURATION}ms ease`,
  },
  frame: {
    position: 'relative',
    width: 'min(480px, 86vw)',
    border: '1px solid rgba(94,200,216,0.35)',
    padding: '28px 32px',
  },
  tick: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderColor: ACCENT,
  },
  tickTL: { top: '-1px', left: '-1px', borderTop: `1px solid ${ACCENT}`, borderLeft: `1px solid ${ACCENT}` },
  tickTR: { top: '-1px', right: '-1px', borderTop: `1px solid ${ACCENT}`, borderRight: `1px solid ${ACCENT}` },
  tickBL: { bottom: '-1px', left: '-1px', borderBottom: `1px solid ${ACCENT}`, borderLeft: `1px solid ${ACCENT}` },
  tickBR: { bottom: '-1px', right: '-1px', borderBottom: `1px solid ${ACCENT}`, borderRight: `1px solid ${ACCENT}` },
  inner: {
    fontFamily: '"SF Mono", "Fira Code", Consolas, monospace',
    fontSize: '13px',
    lineHeight: 1.7,
    minHeight: '180px',
  },
  line: {
    margin: 0,
    color: 'rgba(255,255,255,0.75)',
    whiteSpace: 'pre',
  },
  ok: {
    color: ACCENT,
  },
  barTrack: {
    marginTop: '16px',
    height: '2px',
    background: 'rgba(255,255,255,0.12)',
  },
  barFill: {
    height: '100%',
    background: ACCENT,
    transition: 'width 0.3s ease',
  },
};