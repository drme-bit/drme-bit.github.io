import { useId, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const SPARKLE_POSITIONS = [
  { cx: 8, cy: 10, delay: 0 },
  { cx: 52, cy: 8, delay: 0.4 },
  { cx: 10, cy: 50, delay: 0.8 },
  { cx: 50, cy: 52, delay: 1.2 },
  { cx: 30, cy: 4, delay: 0.6 },
  { cx: 4, cy: 30, delay: 1.0 },
];

export default function CompanionCube({ size = 36, onClick, anger = 0, shake = false }) {
  const uid = useId().replace(/:/g, '_');
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [pressed, setPressed] = useState(false);

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
    : `drop-shadow(0 2px 8px rgba(${isLight ? 120 : 180},${isLight ? 80 : 130},${isLight ? 100 : 150},0.4))`;

  const handleClick = (e) => {
    setPressed(true);
    setTimeout(() => setPressed(false), 200);
    onClick?.(e);
  };

  return (
    <div
      className="companion-cube-wrapper"
      style={{
        width: size,
        height: size,
        cursor: 'pointer',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Ambient glow ring */}
      <div
        className="companion-ambient"
        style={{
          position: 'absolute',
          inset: -6,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${heartR},${heartG},${heartB},0.15), transparent 70%)`,
          animation: 'companionAmbient 3s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      {/* Sparkle particles */}
      {SPARKLE_POSITIONS.map(({ cx, cy, delay }, i) => (
        <div
          key={i}
          className="companion-sparkle"
          style={{
            position: 'absolute',
            left: `${(cx / 60) * 100}%`,
            top: `${(cy / 60) * 100}%`,
            width: 2,
            height: 2,
            borderRadius: '50%',
            background: isLight ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.4)',
            animation: `companionSparkle 2.5s ease-in-out ${delay}s infinite`,
            pointerEvents: 'none',
          }}
        />
      ))}

      <svg
        width={size}
        height={size}
        viewBox="0 0 60 60"
        fill="none"
        className={`companion-cube-svg ${pressed ? 'is-pressed' : ''}`}
        style={{
          filter: glow,
          position: 'relative',
          zIndex: 1,
        }}
        onClick={handleClick}
      >
        <defs>
          <radialGradient id={`cube-${uid}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor={lightGray} />
            <stop offset="100%" stopColor={baseGray} />
          </radialGradient>
          <radialGradient id={`heart-${uid}`} cx="50%" cy="40%">
            <stop offset="0%" stopColor={`rgb(${Math.min(heartR + 40, 255)},${Math.min(heartG + 40, 255)},${Math.min(heartB + 40, 255)})`} />
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

        {/* Inner border lines */}
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
            <line x1={x + 4} y1={y + 7} x2={x + 10} y2={y + 7} stroke={thinStroke} strokeWidth="0.5" />
            <line x1={x + 7} y1={y + 4} x2={x + 7} y2={y + 10} stroke={thinStroke} strokeWidth="0.5" />
            <circle cx={x + 7} cy={y + 7} r="1.2" fill={darkGray} />
          </g>
        ))}

        {/* Central heart */}
        <g className="companion-heart" filter={`url(#glow-${uid})`}>
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

        {/* Small accent dots */}
        {[[30, 14], [30, 46], [14, 30], [46, 30]].map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="1" fill={darkGray} opacity="0.4" />
        ))}

        {/* Edge notches */}
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
    </div>
  );
}
