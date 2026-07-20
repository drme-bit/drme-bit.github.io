'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTypingSound } from '@/shared/hooks/useTypingSound';
import findAnswer from '@/data/pageKnowledge';
import { FACTS } from '@/data/mascot/facts';
import { getMockMessage, pickResponse } from '@/data/mascot/responses';
import CompanionCube from './CompanionCube';
import styles from './Mascot.module.scss';

export { getMockMessage };

/* ─── Types ──────────────────────────────────────────────── */

interface MascotProps {
  userMessage?: string;
  onDone?: () => void;
  searchCount?: number;
}

/* ─── Mascot ─────────────────────────────────────────────── */

export default function Mascot({ userMessage, onDone, searchCount = 0 }: MascotProps) {
  const [typed, setTyped] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState(false);
  const [visible, setVisible] = useState(false);
  const timers = useRef<(ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>)[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const factIdx = useRef(Math.floor(Math.random() * FACTS.length));
  const replying = useRef(false);
  const { play: playTyping, dispose: disposeSounds } = useTypingSound();

  const anger = Math.min(searchCount / 3, 1);
  const cubeSize = Math.max(18, 34 - Math.floor(typed.length / 6));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => { clearInterval(t as ReturnType<typeof setInterval>); clearTimeout(t as ReturnType<typeof setTimeout>); });
    timers.current = [];
  }, []);

  const addTimer = useCallback((t: ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>) => { timers.current.push(t); }, []);

  const typeText = useCallback(
    (text: string, cb?: () => void) => {
      clearTimers();
      setTyped('');
      if (!text) { cb?.(); return; }
      let i = 0;
      const t = setInterval(() => {
        if (i < text.length) {
          setTyped(text.slice(0, i + 1));
          playTyping();
          i++;
        } else {
          clearInterval(t);
          cb?.();
        }
      }, 28);
      addTimer(t);
    },
    [clearTimers, addTimer, playTyping],
  );

  const deleteText = useCallback(
    (cb?: () => void) => {
      const t = setInterval(() => {
        setTyped((prev) => {
          if (prev.length > 0) {
            return prev.slice(0, -1);
          } else {
            clearInterval(t);
            cb?.();
            return '';
          }
        });
      }, 12);
      addTimer(t);
    },
    [addTimer],
  );

  const showDirect = useCallback(
    (msg: string, cb?: () => void) => {
      replying.current = true;
      typeText(msg, () => {
        const pause = setTimeout(() => {
          deleteText(() => {
            replying.current = false;
            const t2 = setTimeout(() => cb?.(), 2000);
            addTimer(t2);
          });
        }, 4000);
        addTimer(pause);
      });
    },
    [typeText, deleteText, addTimer],
  );

  const showChat = useCallback(
    (userMsg: string, cb?: () => void) => {
      replying.current = true;
      const reply = pickResponse(userMsg);
      const display = `> ${userMsg}\n${reply}`;
      typeText(display, () => {
        const pause = setTimeout(() => {
          deleteText(() => {
            replying.current = false;
            const t2 = setTimeout(() => cb?.(), 2000);
            addTimer(t2);
          });
        }, 4000);
        addTimer(pause);
      });
    },
    [typeText, deleteText, addTimer],
  );

  const cycle = useCallback(() => {
    const msg = FACTS[factIdx.current % FACTS.length];
    factIdx.current++;
    typeText(msg, () => {
      const t = setTimeout(() => {
        deleteText(() => {
          const t2 = setTimeout(cycle, 2000);
          addTimer(t2);
        });
      }, 4000);
      addTimer(t);
    });
  }, [typeText, deleteText, addTimer]);

  useEffect(() => {
    clearTimers();
    if (userMessage) {
      showDirect(userMessage, () => {
        onDone?.();
        const t = setTimeout(cycle, 2000);
        addTimer(t);
      });
    } else {
      const t = setTimeout(cycle, 3000);
      addTimer(t);
    }
    return () => { clearTimers(); disposeSounds(); };
  }, [userMessage]);

  useEffect(() => {
    if (chatMode) inputRef.current?.focus();
  }, [chatMode]);

  useEffect(() => {
    if (!chatMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setChatMode(false);
        setChatInput('');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chatMode]);

  const handleCubeClick = useCallback(() => {
    if (replying.current) return;
    clearTimers();
    setTyped('');
    setChatMode(true);
  }, [clearTimers]);

  const handleChatSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const text = chatInput.trim();
      if (!text) return;
      setChatMode(false);
      setChatInput('');
      showChat(text, () => {
        const t = setTimeout(cycle, 2000);
        addTimer(t);
      });
    },
    [chatInput, showChat, addTimer, cycle],
  );

  return (
    <div className={`${styles.mascot} ${visible ? styles['is-visible'] : ''} ${replying.current ? styles['is-replying'] : ''}`}>
      <div className={styles['mascot-main']}>
        <CompanionCube size={cubeSize} onClick={handleCubeClick} anger={anger} shake={anger > 0.3} />

        {chatMode ? (
          <form className={`${styles['mascot-bubble']} ${styles['mascot-input-bubble']}`} onSubmit={handleChatSubmit}>
            <div className={styles['mascot-bubble-header']}>
              <span className={styles['mascot-prompt-icon']}>&gt;</span>
              <span className={styles['mascot-prompt-label']}>ask cube</span>
            </div>
            <div className={styles['mascot-input-row']}>
              <span className={styles['mascot-prompt-char']}>&gt;</span>
              <input
                ref={inputRef}
                className={styles['mascot-input']}
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder=""
                onBlur={() => { if (!chatInput) setChatMode(false); }}
              />
              <span className={styles['mascot-input-cursor']} />
            </div>
          </form>
        ) : (
          <div className={styles['mascot-bubble']}>
            <div className={styles['mascot-bubble-header']}>
              <span className={styles['mascot-prompt-icon']}>&gt;</span>
              <span className={styles['mascot-prompt-label']}>cube.exe</span>
            </div>
            <div className={styles['mascot-typed']}>
              {typed}
              <span className={styles['mascot-cursor']} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
