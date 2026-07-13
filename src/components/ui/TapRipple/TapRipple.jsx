import { useState, useCallback, useRef, useEffect } from 'react';
import './TapRipple.scss';

/**
 * TapRipple — Mobile tap ripple effect component
 *
 * Wraps children and adds a ripple animation on tap/click.
 * Respects prefers-reduced-motion.
 *
 * Usage:
 *   <TapRipple color="rgba(232, 228, 223, 0.15)">
 *     <button>Click me</button>
 *   </TapRipple>
 */
export default function TapRipple({
  children,
  color = 'rgba(232, 228, 223, 0.15)',
  duration = 600,
  className = '',
  onClick,
  ...props
}) {
  const [ripples, setRipples] = useState([]);
  const containerRef = useRef(null);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      prefersReducedMotion.current = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;
    }
  }, []);

  const createRipple = useCallback(
    (e) => {
      if (prefersReducedMotion.current) return;

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const x = (e.clientX || e.touches?.[0]?.clientX || 0) - rect.left;
      const y = (e.clientY || e.touches?.[0]?.clientY || 0) - rect.top;

      const newRipple = {
        x,
        y,
        color,
        key: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);

      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.key !== newRipple.key));
      }, duration);
    },
    [color, duration]
  );

  const handleClick = useCallback(
    (e) => {
      createRipple(e);
      if (onClick) onClick(e);
    },
    [createRipple, onClick]
  );

  return (
    <div
      ref={containerRef}
      className={`tap-ripple-container ${className}`}
      onClick={handleClick}
      onTouchEnd={createRipple}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <span
          key={ripple.key}
          className="tap-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            backgroundColor: ripple.color,
            animationDuration: `${duration}ms`,
          }}
        />
      ))}
    </div>
  );
}
