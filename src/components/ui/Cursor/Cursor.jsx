import { useEffect, useRef, useState } from 'react';
import CursorAnimator from './CursorAnimator';
import './Cursor.scss';

const TRAIL_LENGTH = 5;
const animator = new CursorAnimator();

export default function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const trailRefs = useRef([]);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsMobile(!mq.matches);
    const handler = (e) => setIsMobile(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    animator.setElements(ringRef.current, dotRef.current, trailRefs.current);
    animator.start();
    return () => animator.stop();
  }, [isMobile]);

  if (isMobile) return null;

  return (
    <div className="cursor-container" aria-hidden="true">
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => { trailRefs.current[i] = el; }}
          className={`cursor-trail cursor-trail-${i}`}
          style={{ opacity: 1 - (i / TRAIL_LENGTH) }}
        />
      ))}
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
