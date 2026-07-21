'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './BugCatcher.module.scss';

const COLS = 16;
const ROWS = 6;
const BUG_CHARS = ['X', '!', '?', '#', '%'];
const PLAYER_CHAR = '>';
const TICK_MS = 400;

export default function BugCatcher() {
  const [playerCol, setPlayerCol] = useState(Math.floor(COLS / 2));
  const [bugs, setBugs] = useState<{ col: number; row: number; char: string }[]>([]);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const spawnBug = useCallback(() => {
    const col = Math.floor(Math.random() * COLS);
    const char = BUG_CHARS[Math.floor(Math.random() * BUG_CHARS.length)];
    return { col, row: 0, char };
  }, []);

  const tick = useCallback(() => {
    setBugs((prev) => {
      const next = prev
        .map((b) => ({ ...b, row: b.row + 1 }))
        .filter((b) => {
          if (b.row >= ROWS) {
            setMisses((m) => {
              const newM = m + 1;
              if (newM >= 5) {
                setRunning(false);
                setGameOver(true);
              }
              return newM;
            });
            return false;
          }
          return true;
        });
      return next;
    });

    // Spawn a new bug randomly
    if (Math.random() < 0.4) {
      setBugs((prev) => [...prev, spawnBug()]);
    }
  }, [spawnBug]);

  // Collision check
  useEffect(() => {
    if (!running) return;
    setBugs((prev) => {
      const remaining: typeof prev = [];
      for (const b of prev) {
        if (b.row === ROWS - 1 && b.col === playerCol) {
          setScore((s) => s + 1);
        } else {
          remaining.push(b);
        }
      }
      return remaining;
    });
  }, [playerCol, running]);

  // Game loop
  useEffect(() => {
    if (!running) {
      if (tickRef.current) clearInterval(tickRef.current);
      return;
    }
    tickRef.current = setInterval(tick, TICK_MS);
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [running, tick]);

  // Keyboard controls
  useEffect(() => {
    if (!running) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft' || e.key === 'a') {
        e.preventDefault();
        setPlayerCol((c) => Math.max(0, c - 1));
      } else if (e.key === 'ArrowRight' || e.key === 'd') {
        e.preventDefault();
        setPlayerCol((c) => Math.min(COLS - 1, c + 1));
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [running]);

  function startGame() {
    setScore(0);
    setMisses(0);
    setBugs([]);
    setGameOver(false);
    setPlayerCol(Math.floor(COLS / 2));
    setRunning(true);
  }

  // Build grid
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(' '));
  for (const b of bugs) {
    if (b.row >= 0 && b.row < ROWS && b.col >= 0 && b.col < COLS) {
      grid[b.row][b.col] = b.char;
    }
  }

  return (
    <div className={styles.game}>
      <div className={styles.gameBar}>
        <span className={`${styles.gameDot} ${styles['gameDot--r']}`} />
        <span className={`${styles.gameDot} ${styles['gameDot--y']}`} />
        <span className={`${styles.gameDot} ${styles['gameDot--g']}`} />
        <span className={styles.gameTitle}>bug_catcher.sh</span>
      </div>
      <div className={styles.gameBody}>
        <div className={styles.gameHud}>
          <span>score: {score}</span>
          <span>misses: {misses}/5</span>
        </div>
        <div className={styles.gameGrid}>
          {grid.map((row, r) => (
            <div key={r} className={styles.gameRow}>
              {row.map((cell, c) => (
                <span
                  key={c}
                  className={`${styles.gameCell}${
                    r === ROWS - 1 && c === playerCol ? ` ${styles['gameCell--player']}` : ''
                  }${cell !== ' ' ? ` ${styles['gameCell--bug']}` : ''}`}
                >
                  {r === ROWS - 1 && c === playerCol ? PLAYER_CHAR : cell}
                </span>
              ))}
            </div>
          ))}
        </div>
        {!running && !gameOver && (
          <button className={styles.gameBtn} onClick={startGame}>
            $ ./start_game
          </button>
        )}
        {gameOver && (
          <div className={styles.gameOver}>
            <span>game over — score: {score}</span>
            <button className={styles.gameBtn} onClick={startGame}>
              $ ./retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
