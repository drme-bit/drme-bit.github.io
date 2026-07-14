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
  const heartR = 220 + Math.round(35 * pct);
  const heartG = 120 - Math.round(60 * pct);
  const heartB = 160 - Math.round(40 * pct);
  const heartColor = `rgb(${heartR},${heartG},${heartB})`;
  const heartGlow = `drop-shadow(0 0 ${4 + pct * 12}px rgba(${heartR},${heartG},${heartB},${0.4 + pct * 0.4}))`;

  const baseGray = isLight ? '#b8b4af' : '#6b6966';
  const darkGray = isLight ? '#9a9590' : '#52504d';
  const lightGray = isLight ? '#d4d0cb' : '#8a8682';
  const metalStroke = isLight ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.25)';
  const thinStroke = isLight ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.15)';

  const glow = pct > 0
    ? heartGlow
    : `drop-shadow(0 2px 6px rgba(${isLight ? 120 : 180},${isLight ? 80 : 130},${isLight ? 100 : 150},0.35))`;

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
        <radialGradient id={`cube-${uid}`} cx="35%" cy="35%">
          <stop offset="0%" stopColor={lightGray} />
          <stop offset="100%" stopColor={baseGray} />
        </radialGradient>
        <radialGradient id={`heart-${uid}`} cx="50%" cy="40%">
          <stop offset="0%" stopColor={`rgb(${Math.min(heartR+40,255)},${Math.min(heartG+40,255)},${Math.min(heartB+40,255)})`} />
          <stop offset="100%" stopColor={heartColor} />
        </radialGradient>
        <linearGradient id={`corner-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lightGray} />
          <stop offset="100%" stopColor={darkGray} />
        </linearGradient>
        <filter id={`glow-${uid}`}>
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Main cube body */}
      <rect x="4" y="4" width="52" height="52" rx="6" fill={`url(#cube-${uid})`} />
      <rect x="4" y="4" width="52" height="52" rx="6" stroke={metalStroke} strokeWidth="1.2" />

      {/* Inner border lines — metallic panel look */}
      <rect x="8" y="8" width="44" height="44" rx="3" fill="none" stroke={thinStroke} strokeWidth="0.7" />
      <line x1="30" y1="8" x2="30" y2="52" stroke={thinStroke} strokeWidth="0.6" />
      <line x1="8" y1="30" x2="52" y2="30" stroke={thinStroke} strokeWidth="0.6" />

      {/* Corner plates */}
      {[
        { x: 5, y: 5, r: 0 },
        { x: 41, y: 5, r: 1 },
        { x: 5, y: 41, r: 2 },
        { x: 41, y: 41, r: 3 },
      ].map(({ x, y, r: rot }, i) => (
        <g key={i} transform={`rotate(${rot * 90} ${x + 7} ${y + 7})`}>
          <rect x={x} y={y} width="14" height="14" rx="3" fill={`url(#corner-${uid})`} />
          <rect x={x} y={y} width="14" height="14" rx="3" stroke={metalStroke} strokeWidth="0.8" />
          {/* Cross pattern on corners */}
          <line x1={x + 4} y1={y + 7} x2={x + 10} y2={y + 7} stroke={thinStroke} strokeWidth="0.5" />
          <line x1={x + 7} y1={y + 4} x2={x + 7} y2={y + 10} stroke={thinStroke} strokeWidth="0.5" />
          <circle cx={x + 7} cy={y + 7} r="1.2" fill={darkGray} />
        </g>
      ))}

      {/* Central heart — the iconic pink heart */}
      <g filter={`url(#glow-${uid})`}>
        <path
          d="M30 42
             C30 42 16 32 16 24
             C16 20 18.5 17 22 17
             C25 17 27.5 19 30 22
             C32.5 19 35 17 38 17
             C41.5 17 44 20 44 24
             C44 32 30 42 30 42Z"
          fill={`url(#heart-${uid})`}
        />
        {/* Heart highlight */}
        <path
          d="M30 40
             C30 40 18 31 18 24.5
             C18 21 20 18.5 22.5 18.5
             C25 18.5 27 20 30 23
             C33 20 35 18.5 37.5 18.5
             C40 18.5 42 21 42 24.5
             C42 31 30 40 30 40Z"
          fill="rgba(255,255,255,0.2)"
        />
      </g>

      {/* Small accent dots around heart */}
      {[[30, 14], [30, 46], [14, 30], [46, 30]].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="1" fill={darkGray} opacity="0.4" />
      ))}

      {/* Edge notches — mechanical detail */}
      {[15, 30, 45].map((pos) => (
        <g key={pos}>
          <rect x={pos - 1.5} y="4" width="3" height="2" rx="0.5" fill={darkGray} opacity="0.3" />
          <rect x={pos - 1.5} y="54" width="3" height="2" rx="0.5" fill={darkGray} opacity="0.3" />
          <rect x="4" y={pos - 1.5} width="2" height="3" rx="0.5" fill={darkGray} opacity="0.3" />
          <rect x="54" y={pos - 1.5} width="2" height="3" rx="0.5" fill={darkGray} opacity="0.3" />
        </g>
      ))}

      {/* Anger marks */}
      {anger > 0.3 && (
        <g stroke={heartColor} strokeWidth="1.5" strokeLinecap="round" opacity={pct}>
          <line x1="17" y1="9" x2="13" y2="2" />
          <line x1="21" y1="7" x2="19" y2="1" />
          <line x1="43" y1="9" x2="47" y2="2" />
          <line x1="39" y1="7" x2="41" y2="1" />
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
