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
  const timers = useRef([]);
  const inputRef = useRef(null);
  const factIdx = useRef(Math.floor(Math.random() * FACTS.length));
  const replying = useRef(false);
  const { play: playTyping, dispose: disposeSounds } = useTypingSound();

  const anger = Math.min(searchCount / 3, 1);
  const cubeSize = Math.max(16, 36 - Math.floor(typed.length / 5));

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
      }, 30);
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
      }, 15);
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
    <div className={`mascot${replying.current ? ' is-replying' : ''}`}>
      <div className="mascot-main">
        <CompanionCube size={cubeSize} onClick={handleCubeClick} anger={anger} shake={anger > 0.3} />
        {chatMode ? (
          <form className="mascot-input-wrap" onSubmit={handleChatSubmit}>
            <span className="mascot-prompt">&gt;</span>
            <input
              ref={inputRef}
              className="mascot-input"
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="type something..."
              onBlur={() => { if (!chatInput) setChatMode(false); }}
            />
          </form>
        ) : (
          <div className="mascot-bubble">
            {typed}
            {!replying.current && <span className="mascot-cursor">|</span>}
            <div className="mascot-bubble-arrow" />
          </div>
        )}
      </div>
    </div>
  );
}
