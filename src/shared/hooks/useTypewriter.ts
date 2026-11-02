'use client';
import { useState, useEffect, useRef } from 'react';

export default function useTypewriter(strings: string[], speed = 50, hold = 2000): string {
  const [text, setText] = useState('');
  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'type' | 'hold' | 'erase'>('type');
  const charRef = useRef(0);

  useEffect(() => {
    if (strings.length === 0) return;
    const s = strings[idx % strings.length];
    if (phase === 'type') {
      if (charRef.current >= s.length) {
        const t = setTimeout(() => setPhase('hold'), hold);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        charRef.current++;
        setText(s.slice(0, charRef.current));
      }, speed);
      return () => clearTimeout(t);
    }
    if (phase === 'hold') {
      const t = setTimeout(() => setPhase('erase'), hold);
      return () => clearTimeout(t);
    }
    if (phase === 'erase') {
      if (charRef.current <= 0) {
        const t = setTimeout(() => {
          charRef.current = 0;
          setText('');
          setPhase('type');
          setIdx((i) => (i + 1) % strings.length);
        }, speed / 2);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        charRef.current--;
        setText(s.slice(0, charRef.current));
      }, speed / 2);
      return () => clearTimeout(t);
    }
  }, [text, phase, idx, strings, speed, hold]);

  return text;
}
