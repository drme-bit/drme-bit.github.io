import { useMemo, useRef, useCallback, useEffect } from 'react';
import './TestimonialsColumn.scss';

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function TestimonialsColumn({ testimonials, duration = 10, className = '' }) {
  const trackRef = useRef(null);
  const posRef = useRef(0);
  const speedRef = useRef(1);
  const targetSpeedRef = useRef(1);
  const rafRef = useRef(null);
  const setHeightRef = useRef(0);

  const sets = testimonials.length <= 2 ? 6 : testimonials.length <= 4 ? 4 : 3;

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !track.parentElement) return;

    const measure = () => {
      const children = track.children;
      if (!children.length) return;
      const firstSet = children[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      setHeightRef.current = firstSet.offsetHeight + gap;
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);

    let prev = performance.now();

    const tick = (now) => {
      const dt = (now - prev) / 1000;
      prev = now;

      speedRef.current += (targetSpeedRef.current - speedRef.current) * Math.min(dt * 4, 1);

      const pxPerSec = (setHeightRef.current / duration) * speedRef.current;
      posRef.current += pxPerSec * dt;

      if (setHeightRef.current > 0 && posRef.current >= setHeightRef.current) {
        posRef.current -= setHeightRef.current;
      }

      track.style.transform = `translate3d(0,${-posRef.current}px,0)`;
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [testimonials, duration, sets]);

  const onMouseEnter = useCallback(() => {
    targetSpeedRef.current = 0.3;
  }, []);

  const onMouseLeave = useCallback(() => {
    targetSpeedRef.current = 1;
  }, []);

  return (
    <div
      className={`testimonials-column ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div ref={trackRef} className="testimonials-track">
        {Array.from({ length: sets }, (_, setIdx) => (
          <div key={setIdx} className="testimonials-set">
            {testimonials.map((review, i) => (
              <div className="testimonial-card" key={`${setIdx}-${i}`}>
                {review.header && (
                  <div className="testimonial-header">{review.header}</div>
                )}
                <p className="testimonial-text">{review.text}</p>
                <div className="testimonial-footer">
                  <div className="testimonial-author">
                    {review.photoURL ? (
                      <img
                        src={review.photoURL}
                        alt={review.name}
                        className="testimonial-avatar"
                      />
                    ) : (
                      <div className="testimonial-avatar testimonial-avatar--fallback">
                        {(review.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className="testimonial-info">
                      <span className="testimonial-name">{review.name}</span>
                      {review.role && <span className="testimonial-role">{review.role}</span>}
                    </div>
                  </div>
                  {review.createdAt && (
                    <span className="testimonial-time">
                      {timeAgo(review.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
