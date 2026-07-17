import { useState, useEffect, useRef, useCallback } from 'react';
import { useTypingSound } from '@/hooks/useTypingSound';
import findAnswer from '@/data/pageKnowledge';
import { FACTS } from '@/data/mascot/facts';
import { getMockMessage, pickResponse } from '@/data/mascot/responses';
import CompanionCube from './CompanionCube';
import './Mascot.scss';

export { getMockMessage };

export default function Mascot({ userMessage, onDone, searchCount = 0 }) {
  const [typed, setTyped] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMode, setChatMode] = useState(false);
  const [visible, setVisible] = useState(false);
  const timers = useRef([]);
  const inputRef = useRef(null);
  const factIdx = useRef(Math.floor(Math.random() * FACTS.length));
  const replying = useRef(false);
  const { play: playTyping, dispose: disposeSounds } = useTypingSound();

  const anger = Math.min(searchCount / 3, 1);
  const cubeSize = Math.max(18, 34 - Math.floor(typed.length / 6));

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, []);

  const clearTimers = useCallback(() => {
    timers.current.forEach((t) => { clearInterval(t); clearTimeout(t); });
    timers.current = [];
  }, []);

  const addTimer = useCallback((t) => { timers.current.push(t); }, []);

  const typeText = useCallback(
    (text, cb) => {
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
    (cb) => {
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
    (msg, cb) => {
      replying.current = true;
      typeText(msg, () => {
        const pause = setTimeout(() => {
          deleteText(() => {
            replying.current = false;
            const t2 = setTimeout(cb, 2000);
            addTimer(t2);
          });
        }, 4000);
        addTimer(pause);
      });
    },
    [typeText, deleteText, addTimer],
  );

  const showChat = useCallback(
    (userMsg, cb) => {
      replying.current = true;
      const reply = pickResponse(userMsg);
      const display = `> ${userMsg}\n${reply}`;
      typeText(display, () => {
        const pause = setTimeout(() => {
          deleteText(() => {
            replying.current = false;
            const t2 = setTimeout(cb, 2000);
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
    const onKey = (e) => {
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
    (e) => {
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
    <div className={`mascot ${visible ? 'is-visible' : ''} ${replying.current ? 'is-replying' : ''}`}>
      <div className="mascot-main">
        <CompanionCube size={cubeSize} onClick={handleCubeClick} anger={anger} shake={anger > 0.3} />

        {chatMode ? (
          <form className="mascot-bubble mascot-input-bubble" onSubmit={handleChatSubmit}>
            <div className="mascot-bubble-header">
              <span className="mascot-prompt-icon">&gt;</span>
              <span className="mascot-prompt-label">ask cube</span>
            </div>
            <div className="mascot-input-row">
              <span className="mascot-prompt-char">&gt;</span>
              <input
                ref={inputRef}
                className="mascot-input"
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder=""
                onBlur={() => { if (!chatInput) setChatMode(false); }}
              />
              <span className="mascot-input-cursor" />
            </div>
          </form>
        ) : (
          <div className="mascot-bubble">
            <div className="mascot-bubble-header">
              <span className="mascot-prompt-icon">&gt;</span>
              <span className="mascot-prompt-label">cube.exe</span>
            </div>
            <div className="mascot-typed">
              {typed}
              <span className="mascot-cursor" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
