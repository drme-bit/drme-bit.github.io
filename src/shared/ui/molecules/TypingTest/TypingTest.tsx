'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import styles from './TypingTest.module.scss';

/* ─── Word pool ──────────────────────────────────────────── */

const WORDS = [
  'code', 'build', 'ship', 'debug', 'deploy', 'commit', 'merge', 'push',
  'react', 'nextjs', 'typescript', 'graphql', 'docker', 'linux', 'git',
  'pixel', 'design', 'theme', 'router', 'server', 'client', 'cache',
  'function', 'component', 'interface', 'module', 'package', 'export',
  'const', 'return', 'import', 'async', 'await', 'promise', 'callback',
  'array', 'object', 'string', 'number', 'boolean', 'null', 'undefined',
  'algorithm', 'recursion', 'iteration', 'variable', 'constant', 'scope',
  'terminal', 'console', 'pipeline', 'workflow', 'branch', 'rebase',
  'performance', 'optimization', 'refactor', 'architecture', 'pattern',
  'database', 'endpoint', 'middleware', 'authentication', 'encryption',
  'frontend', 'backend', 'fullstack', 'devops', 'microservice', 'api',
  'testing', 'jest', 'playwright', 'coverage', 'integration', 'unit',
  'responsive', 'accessible', 'semantic', 'animation', 'gradient',
  'cyberpunk', 'neon', 'matrix', 'glitch', 'hacker', 'terminal',
  'portfolio', 'website', 'application', 'platform', 'framework',
];

function pickWords(count: number, seed?: number): string[] {
  const pool = [...WORDS];
  const result: string[] = [];
  // Simple seeded random for SSR/CSR consistency
  let s = seed ?? Math.floor(Math.random() * 100000);
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 0) % 2147483647;
    const idx = s % pool.length;
    result.push(pool[idx]);
    if (pool.length <= 1) pool.push(...WORDS.filter((w) => w !== result[i]));
  }
  return result;
}

/* ─── Component ──────────────────────────────────────────── */

export default function TypingTest() {
  const [mounted, setMounted] = useState(false);
  const [words] = useState(() => pickWords(50));
  const [typed, setTyped] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [active, setActive] = useState(false);
  const [, setTick] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  const fullText = useMemo(() => words.join(' '), [words]);
  const isComplete = typed.length >= fullText.length;

  const handleContainerClick = () => inputRef.current?.focus();

  // WPM
  const wpm = useMemo(() => {
    if (!startTime || !endTime) return 0;
    const minutes = (endTime - startTime) / 60000;
    if (minutes <= 0) return 0;
    // count correct words only
    let correctWords = 0;
    for (let i = 0; i < words.length; i++) {
      const wordStart = i === 0 ? 0 : fullText.lastIndexOf(' ', i * 2 - 1) + 1;
      // actually just check each word by splitting
    }
    const typedWords = typed.split(' ');
    let correct = 0;
    for (let i = 0; i < Math.min(typedWords.length, words.length); i++) {
      if (typedWords[i] === words[i]) correct++;
    }
    return Math.round(correct / minutes) || 0;
  }, [startTime, endTime, typed, words, fullText]);

  // Accuracy
  const accuracy = useMemo(() => {
    if (typed.length === 0) return 100;
    let correct = 0;
    for (let i = 0; i < typed.length && i < fullText.length; i++) {
      if (typed[i] === fullText[i]) correct++;
    }
    return Math.round((correct / typed.length) * 100);
  }, [typed, fullText]);

  // Elapsed seconds
  const elapsed = useMemo(() => {
    if (!startTime) return 0;
    const end = endTime || (mounted ? Date.now() : startTime);
    return Math.floor((end - startTime) / 1000);
  }, [startTime, endTime, mounted]);

  // Live timer tick
  useEffect(() => {
    if (!active || endTime) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [active, endTime]);

  // Key handler
  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isComplete) return;

      // Start on first real keypress
      if (!active && e.key.length === 1) {
        setStartTime(Date.now());
        setActive(true);
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        setTyped((t) => t.slice(0, -1));
        return;
      }

      // Ignore non-printable keys
      if (e.key.length > 1 && e.key !== 'Space') return;

      const char = e.key === 'Space' ? ' ' : e.key;

      // Allow typing up to fullText length
      if (typed.length < fullText.length) {
        setTyped((t) => t + char);
      }

      // Check completion after this keystroke
      if (typed.length + 1 >= fullText.length) {
        setEndTime(Date.now());
      }
    },
    [active, isComplete, typed, fullText],
  );

  // Reset
  const reset = useCallback(() => {
    setTyped('');
    setStartTime(null);
    setEndTime(null);
    setActive(false);
    setTick(0);
    inputRef.current?.focus();
  }, []);

  // Render highlighted characters
  const renderWords = () => {
    if (!mounted) return null;
    return (
      <span className={styles.wordList}>
        {fullText.split('').map((char, i) => {
          let cls = styles.char;
          if (i < typed.length) {
            cls += typed[i] === fullText[i] ? ` ${styles.correct}` : ` ${styles.incorrect}`;
          } else if (i === typed.length) {
            cls += ` ${styles.cursor}`;
          }
          return (
            <span key={i} className={cls}>
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className={styles.wrapper}>
      {/* Stats bar */}
      <div className={styles.statsBar}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{wpm}</span>
          <span className={styles.statLabel}>wpm</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{accuracy}%</span>
          <span className={styles.statLabel}>acc</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>{elapsed}s</span>
          <span className={styles.statLabel}>time</span>
        </div>
        {isComplete && (
          <button className={styles.resetBtn} onClick={reset}>
            restart
          </button>
        )}
      </div>

      {/* Text area */}
      <div
        ref={containerRef}
        className={styles.textArea}
        onClick={handleContainerClick}
      >
        {renderWords()}
        <input
          ref={inputRef}
          className={styles.hiddenInput}
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          onKeyDown={handleKey}
          disabled={isComplete}
        />
      </div>

      {/* Hint */}
      {!active && !isComplete && (
        <p className={styles.hint}>start typing to begin...</p>
      )}
      {isComplete && (
        <p className={styles.hint}>
          {wpm} wpm &middot; {accuracy}% accuracy
        </p>
      )}
    </div>
  );
}
