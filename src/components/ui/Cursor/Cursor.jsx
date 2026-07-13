import { useEffect, useRef, useState, useCallback } from 'react';
import './Cursor.scss';

const TRAIL_LENGTH = 5;
const LERP_RING = 0.12;
const LERP_DOT = 0.7;
const TRAIL_LERP = 0.25;

export default function Cursor() {
  const ringRef = useRef(null);
  const dotRef = useRef(null);
  const trailRefs = useRef([]);
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const dotPos = useRef({ x: -100, y: -100 });
  const trailPos = useRef(Array.from({ length: TRAIL_LENGTH }, () => ({ x: -100, y: -100 })));
  const rafRef = useRef(null);
  const isHovering = useRef(false);
  const isPressed = useRef(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)');
    setIsMobile(!mq.matches);

    const handler = (e) => setIsMobile(!e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const lerp = useCallback((a, b, t) => a + (b - a) * t, []);

  useEffect(() => {
    if (isMobile) return;

    document.body.classList.add('custom-cursor-active');

    const onMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseDown = () => {
      isPressed.current = true;
    };

    const onMouseUp = () => {
      isPressed.current = false;
    };

    const onMouseOver = (e) => {
      const target = e.target;
      if (target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a, button, [role="button"], input, textarea, select')) {
        isHovering.current = true;
      }
    };

    const onMouseOut = (e) => {
      const target = e.target;
      if (target.tagName === 'A' || 
          target.tagName === 'BUTTON' || 
          target.closest('a, button, [role="button"], input, textarea, select')) {
        isHovering.current = false;
      }
    };

    const animate = () => {
      const mx = mousePos.current.x;
      const my = mousePos.current.y;

      // Lerp ring position
      ringPos.current.x = lerp(ringPos.current.x, mx, LERP_RING);
      ringPos.current.y = lerp(ringPos.current.y, my, LERP_RING);

      // Lerp dot position
      dotPos.current.x = lerp(dotPos.current.x, mx, LERP_DOT);
      dotPos.current.y = lerp(dotPos.current.y, my, LERP_DOT);

      // Lerp trail positions
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        trailPos.current[i].x = lerp(trailPos.current[i].x, trailPos.current[i - 1].x, TRAIL_LERP);
        trailPos.current[i].y = lerp(trailPos.current[i].y, trailPos.current[i - 1].y, TRAIL_LERP);
      }
      trailPos.current[0].x = lerp(trailPos.current[0].x, mx, TRAIL_LERP);
      trailPos.current[0].y = lerp(trailPos.current[0].y, my, TRAIL_LERP);

      // Apply transforms
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPos.current.x}px, ${ringPos.current.y}px) translate(-50%, -50%)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${dotPos.current.x}px, ${dotPos.current.y}px) translate(-50%, -50%)`;
      }
      trailRefs.current.forEach((el, i) => {
        if (el) {
          el.style.transform = `translate(${trailPos.current[i].x}px, ${trailPos.current[i].y}px) translate(-50%, -50%)`;
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mouseout', onMouseOut, { passive: true });
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.body.classList.remove('custom-cursor-active');
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, lerp]);

  if (isMobile) return null;

  return (
    <div className="cursor-container" aria-hidden="true">
      {/* Trail dots */}
      {Array.from({ length: TRAIL_LENGTH }, (_, i) => (
        <div
          key={`trail-${i}`}
          ref={(el) => { trailRefs.current[i] = el; }}
          className={`cursor-trail cursor-trail-${i}`}
          style={{ opacity: 1 - (i / TRAIL_LENGTH) }}
        />
      ))}

      {/* Outer ring */}
      <div
        ref={ringRef}
        className={`cursor-ring${isHovering.current ? ' is-hovering' : ''}${isPressed.current ? ' is-pressed' : ''}`}
      />

      {/* Inner dot */}
      <div
        ref={dotRef}
        className={`cursor-dot${isPressed.current ? ' is-pressed' : ''}`}
      />
    </div>
  );
}
