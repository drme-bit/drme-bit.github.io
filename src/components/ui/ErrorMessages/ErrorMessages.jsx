import { useState, useEffect, useCallback } from 'react';
import './ErrorMessages.scss';

const MESSAGES = [
  { text: 'segmentation fault at 0x{addr}', level: 'error' },
  { text: 'core dumped — see /dev/null', level: 'fatal' },
  { text: 'recursive loop detected in scroll handler', level: 'warn' },
  { text: 'accent color overflow on line 42', level: 'error' },
  { text: 'floating point exception in .hero-overlay', level: 'error' },
  { text: 'stack smashing detected: buf overflow', level: 'fatal' },
  { text: 'GPU timeout: terrain took too long', level: 'warn' },
  { text: 'cannot find style.css in /dist', level: 'error' },
  { text: 'pointer event leak — 12 unhandled', level: 'warn' },
  { text: 'heap corruption: free() called on stack', level: 'fatal' },
  { text: 'nothing to commit, working tree clean', level: 'info' },
  { text: 'segfault while reading /proc/self', level: 'error' },
];

function randItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomHex() {
  return (Math.random() * 0xFFFFFF | 0).toString(16).padStart(6, '0');
}

function formatMsg(m) {
  return m.text.replace('{addr}', randomHex());
}

export default function ErrorMessages() {
  const [items, setItems] = useState([]);

  const spawn = useCallback(() => {
    const msg = randItem(MESSAGES);
    const id = Date.now() + Math.random();
    setItems((prev) => [
      ...prev,
      {
        id,
        text: formatMsg(msg),
        level: msg.level,
        x: 10 + Math.random() * 60,
        y: 20 + Math.random() * 60,
      },
    ]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    const interval = setInterval(spawn, 2000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [spawn]);

  return (
    <div className="error-messages" aria-hidden>
      {items.map((item) => (
        <div
          key={item.id}
          className={`error-message error-message--${item.level}`}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
        >
          <span className="error-level">[{item.level.toUpperCase()}]</span>
          {' '}
          {item.text}
        </div>
      ))}
    </div>
  );
}
