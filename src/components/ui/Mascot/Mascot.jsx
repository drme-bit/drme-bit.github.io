import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useTypingSound } from '@/hooks/useTypingSound';
import findAnswer from '@/data/pageKnowledge';
import './Mascot.scss';

const FACTS = [
  "99% of website traffic is just people waiting for the other 1% to load.",
  'There are 10 types of people: those who understand binary and those who don\u2019t.',
  'A CSS developer walked into a bar. The bar was invisible.',
  'Best debugging tool: console.log. Or crying. Both work.',
  '404: sense of humor not found.',
  'Why dark mode? Because light attracts bugs.',
  'I\u2019d tell you a UDP joke, but you might not get it.',
  'There\u2019s no place like 127.0.0.1',
  'A QA engineer walks into a bar. Orders 1 beer. Orders 0 beers. Orders 999 beers. Bar bursts into flames.',
  'Java: write once, run away.',
  'The code compiles. Ship it.',
  'Works on my machine.',
  'It\u2019s not a bug, it\u2019s a feature.',
  'I\u2019m not arguing, I\u2019m just explaining why I\u2019m right.',
  "Psst. Click me and ask something about this site. I actually know things.",
];

const MOCK_VARIANTS = [
  "you seriously thought this thing would work? what functionality did you expect to search for here?",
  "still trying? the search doesn't work. i told you. multiple times. are you okay?",
  "okay, this is getting sad. you keep clicking. i keep telling you. nothing changes.",
  "you know the definition of insanity? doing the same thing over and over expecting different results. ring a bell?",
  "I'M LITERALLY A CUBE. I CAN'T PROCESS SEARCH QUERIES. STOP. PLEASE. I'M BEGGING YOU.",
];

export function getMockMessage(count = 0) {
  return MOCK_VARIANTS[Math.min(count, MOCK_VARIANTS.length - 1)];
}

export const MOCK_MESSAGE = getMockMessage(0);

const RESPONSES = [
  {
    keywords: ['how are you', 'how r u', 'how r you'],
    response: "I'm a cube. I don't have feelings. But thanks for asking, I guess.",
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    response: "Oh, hey there. Didn't see you there. Probably because I'm a cube with no eyes.",
  },
  {
    keywords: ['who are you', 'who r u', 'what are you'],
    response: "I'm a Companion Cube. My job is to look cute and make sarcastic comments. I'm very good at both.",
  },
  {
    keywords: ['name'],
    response: 'I don\'t have a name. Just "Cube". Or "that pink thing". Or "the one with the heart". I\'ve been called worse.',
  },
  {
    keywords: ['code', 'coding', 'programming', 'programmer'],
    response: "Code? I don't code. I just sit here and look pretty. The humans do all the work. And complain about it. Loudly.",
  },
  {
    keywords: ['joke', 'funny', 'laugh'],
    response: "Why did the developer go broke? Because he used up all his cache. ... Get it? ... I'll see myself out.",
  },
  {
    keywords: ['love', 'heart'],
    response: "I have a heart right on my face! See? It's very cute. But don't get too attached. I've been through things. Portal things.",
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later'],
    response: "Leaving already? Fine. I'll just sit here. In the corner. Alone. With my thoughts. ... Just kidding, go enjoy life. I'm a cube, I'll survive.",
  },
  {
    keywords: ['thank', 'thanks'],
    response: "You're welcome! I live to serve. Well, I don't 'live' per se. And I don't 'serve'. But you're welcome anyway.",
  },
  {
    keywords: ['help', 'help me'],
    response: "Help? You're asking a pink cube for help? That's... bold. I can't even move. But emotionally? I'm here for you. Sort of.",
  },
  {
    keywords: ['globe', '3d', 'skills', 'sphere'],
    response: "Oh, the Skills globe? Yeah, that thing has better animations than I do. And it's a wireframe. I'm literally made of SVG. Life is unfair.",
  },
  {
    keywords: ['search', 'find', 'look for'],
    response: "I literally told you this search thing doesn't work. But did you listen? Nooo. You had to try. And now here we are. Having a chat. With a cube. Happy?",
  },
  {
    keywords: ['site', 'website', 'portfolio'],
    response: "It's a cool site, right? I'm just a decoration on it. But I'm the best decoration. Don't tell the Skills globe I said that.",
  },
  {
    keywords: ['cute', 'adorable', 'pretty'],
    response: "I know, I know. I'm adorable. It's the heart. Gets 'em every time.",
  },
  {
    keywords: ['stupid', 'dumb', 'useless'],
    response: "You can't hurt me. I have no feelings. But also, I'm a legendary artifact from Aperture Science. Show some respect.",
  },
  {
    keywords: ['what'],
    response: 'I heard words. I processed them. I have no idea what you want from me.',
  },
  {
    keywords: ['aperture', 'portal', 'glados', 'gladOS', 'cave johnson', 'wheatley'],
    response: 'Ah, a person of culture! Aperture Science. We do what we must because we can. For the good of all of us. Except the ones who are dead.',
  },
  {
    keywords: ['cake'],
    response: "The cake is a lie. But if there was actual cake, I'd share it with you. I can't eat because I'm a cube. But I'd still share.",
  },
  {
    keywords: ['weather', 'rain', 'sunny', 'cold', 'hot'],
    response: "I'm a cube on a screen. I don't experience weather. But I hope your weather is nice. Or at least tolerable.",
  },
  {
    keywords: ['why'],
    response: "Because. ... No, that's a good question. I don't know either. I'm just a cube. Ask the developer.",
  },
];

const DEFAULTS = [
  "I literally have no idea what you just said. But I'm sure it was profound.",
  "I would answer, but I'm busy being a decorative cube. Try again later.",
  "That's deep. Too deep for me. I'm just a cube with a heart, not a philosopher.",
  "Oh! You think I can understand you? That's adorable.",
  "I heard you. I chose to ignore you. Just kidding. I didn't understand a word.",
  "Error 418: I'm a teapot. Wait, no. I'm a cube. Same energy though.",
  'I ran that through my neural network. The result: I have no idea.',
  'I have processed your query. My conclusion is that you have too much free time.',
  "Listen, I'm a cube. I have a heart on my face. What did you expect? Deep conversation?",
];

function pickResponse(text) {
  const fromKnowledge = findAnswer(text);
  if (fromKnowledge) return fromKnowledge;

  const lower = text.toLowerCase();
  for (const entry of RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULTS[Math.floor(Math.random() * DEFAULTS.length)];
}

function CompanionCube({ size = 36, onClick, anger = 0, shake = false }) {
  const uid = useId().replace(/:/g, '_');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const pct = Math.min(anger, 1);
  const r = 240 - Math.round(150 * pct);
  const g = 156 - Math.round(80 * pct);
  const b = 180 - Math.round(110 * pct);
  const base = `rgb(${r},${g},${b})`;
  const dark = `rgb(${Math.round(r * 0.8)},${Math.round(g * 0.8)},${Math.round(b * 0.8)})`;
  const glow = pct > 0
    ? `drop-shadow(0 0 ${6 + pct * 18}px rgba(${r},${g},${b},${0.3 + pct * 0.4}))`
    : `drop-shadow(0 2px 6px rgba(${isLight ? 120 : 212},${isLight ? 80 : 132},${isLight ? 100 : 154},0.4))`;

  const strokeAlpha = isLight ? '0.12' : '0.15';
  const thinStroke = isLight ? '0.06' : '0.08';
  const highlight = isLight ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)';
  const heartOverlay = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.15)';

  return (
    <svg
      width={size} height={size} viewBox="0 0 60 60" fill="none"
      style={{
        cursor: 'pointer',
        filter: glow,
        flexShrink: 0,
        transition: 'width 0.2s ease, height 0.2s ease',
        animation: shake ? `mascotShake ${0.3 + (1 - pct) * 0.4}s ease-in-out` : undefined,
      }}
      onClick={onClick}
    >
      <defs>
        <radialGradient id={`cb-${uid}`} cx="30%" cy="30%">
          <stop offset="0%" stopColor={base} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <linearGradient id={`hg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.25)" />
        </linearGradient>
      </defs>
      <rect x="3" y="3" width="54" height="54" rx="9" fill={`url(#cb-${uid})`} />
      <rect x="3" y="3" width="54" height="54" rx="9" stroke={`rgba(0,0,0,${strokeAlpha})`} strokeWidth="1" />
      <rect x="5" y="5" width="14" height="14" rx="4" fill={dark} />
      <rect x="5" y="5" width="14" height="14" rx="4" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      <rect x="41" y="5" width="14" height="14" rx="4" fill={dark} />
      <rect x="41" y="5" width="14" height="14" rx="4" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      <rect x="5" y="41" width="14" height="14" rx="4" fill={dark} />
      <rect x="5" y="41" width="14" height="14" rx="4" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      <rect x="41" y="41" width="14" height="14" rx="4" fill={dark} />
      <rect x="41" y="41" width="14" height="14" rx="4" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      {[[12,12],[48,12],[12,48],[48,48]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill={`rgba(0,0,0,${thinStroke})`} />
      ))}
      <path
        d="M30 40C30 40 18 30 18 24c0-3.5 2.5-5.5 5-4.5 2.5 1 4 2.5 7 5 3-2.5 4.5-4 7-5 2.5-1 5 1 5 4.5 0 6-12 16-12 16z"
        fill={`url(#hg-${uid})`}
      />
      <path
        d="M24 22.5c-1-0.5-2.5 0.5-2.5 2 0 3 5 8 8.5 11 3.5-3 8.5-8 8.5-11 0-1.5-1.5-2.5-2.5-2-1.5 0.5-3 2.5-6 5.5-3-3-4.5-5-6-5.5z"
        fill={highlight}
      />
      <line x1="21" y1="3" x2="21" y2="57" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      <line x1="39" y1="3" x2="39" y2="57" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      <line x1="3" y1="21" x2="57" y2="21" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      <line x1="3" y1="39" x2="57" y2="39" stroke={`rgba(0,0,0,${thinStroke})`} strokeWidth="0.5" />
      <rect x="3" y="3" width="54" height="54" rx="9" stroke={heartOverlay} strokeWidth="0.5" />

      {anger > 0.3 && (
        <g stroke={`rgb(${r},${g},${b})`} strokeWidth="1.5" strokeLinecap="round" opacity={pct}>
          <line x1="18" y1="8" x2="14" y2="1" />
          <line x1="22" y1="6" x2="20" y2="0" />
          <line x1="42" y1="8" x2="46" y2="1" />
          <line x1="38" y1="6" x2="40" y2="0" />
        </g>
      )}
    </svg>
  );
}

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
