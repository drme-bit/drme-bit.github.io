import { useEffect, useState, useCallback } from 'react';
import './CustomCursor.scss';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [hovered, setHovered] = useState(false);

  const onMove = useCallback((e) => {
    setPos({ x: e.clientX, y: e.clientY });
    const t = e.target;
    setHovered(t.tagName === 'A' || t.tagName === 'BUTTON' || t.closest('a, button'));
  }, []);

  useEffect(() => {
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [onMove]);

  return (
    <div className="custom-cursor" style={{ left: pos.x, top: pos.y }}>
      <div className={`custom-cursor-ring${hovered ? ' is-hovered' : ''}`} />
    </div>
  );
}
