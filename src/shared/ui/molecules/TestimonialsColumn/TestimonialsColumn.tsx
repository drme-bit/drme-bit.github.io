'use client';

import { useRef, useCallback, useEffect } from 'react';
import CarouselScroller from './CarouselScroller';
import styles from './TestimonialsColumn.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

interface Testimonial {
  header?: string;
  text: string;
  name: string;
  role?: string;
  photoURL?: string;
  createdAt?: Date | null;
}

interface TestimonialsColumnProps {
  testimonials: Testimonial[];
  duration?: number;
  className?: string;
}

/* ─── Helpers ────────────────────────────────────────────── */

function timeAgo(date: Date | null | undefined): string {
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

/* ─── TestimonialsColumn ─────────────────────────────────── */

export default function TestimonialsColumn({
  testimonials,
  duration = 10,
  className = '',
}: TestimonialsColumnProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<CarouselScroller | null>(null);

  const sets = testimonials.length <= 2 ? 6 : testimonials.length <= 4 ? 4 : 3;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const s = new CarouselScroller(track, duration);
    scrollerRef.current = s;
    s.start();
    return () => s.stop();
  }, [testimonials, duration, sets]);

  const onMouseEnter = useCallback(() => scrollerRef.current?.pause(), []);
  const onMouseLeave = useCallback(() => scrollerRef.current?.resume(), []);

  return (
    <div
      className={`${styles.testimonialsColumn} ${className}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div ref={trackRef} className={styles.testimonialsTrack}>
        {Array.from({ length: sets }, (_, setIdx) => (
          <div key={setIdx} className={styles.testimonialsSet}>
            {testimonials.map((review: Testimonial, i: number) => (
              <div className={styles.testimonialCard} key={`${setIdx}-${i}`}>
                {review.header && (
                  <div className={styles.testimonialHeader}>{review.header}</div>
                )}
                <p className={styles.testimonialText}>{review.text}</p>
                <div className={styles.testimonialFooter}>
                  <div className={styles.testimonialAuthor}>
                    {review.photoURL ? (
                      <img
                        src={review.photoURL}
                        alt={review.name}
                        className={styles.testimonialAvatar}
                      />
                    ) : (
                      <div className={`${styles.testimonialAvatar} ${styles.testimonialAvatarFallback}`}>
                        {(review.name || '?')[0].toUpperCase()}
                      </div>
                    )}
                    <div className={styles.testimonialInfo}>
                      <span className={styles.testimonialName}>{review.name}</span>
                      {review.role && <span className={styles.testimonialRole}>{review.role}</span>}
                    </div>
                  </div>
                  {review.createdAt && (
                    <span className={styles.testimonialTime}>
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
