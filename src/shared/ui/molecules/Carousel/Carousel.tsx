'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './Carousel.module.scss';

interface CarouselProps {
  images?: string[];
  autoplay?: number;
  showThumbs?: boolean;
  showArrows?: boolean;
  isActive?: boolean;
}

export default function Carousel({
  images = [],
  autoplay = 4000,
  showThumbs = true,
  showArrows = true,
  isActive = true,
}: CarouselProps) {
  const [current, setCurrent] = useState<number>(0);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const count = images.length;
  const hasMultiple = count > 1;

  const goTo = useCallback((idx: number) => {
    setCurrent((idx + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!hasMultiple || !autoplay || isHovered || !isActive) return;
    intervalRef.current = setInterval(next, autoplay);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [hasMultiple, autoplay, isHovered, isActive, next]);

  if (!images.length) {
    return (
      <div className={styles.carouselEmpty}>
        <div className={styles.carouselEmptyLine} />
      </div>
    );
  }

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.carouselViewport}>
        {images.map((src, i) => (
          <div
            key={src}
            className={`${styles.carouselSlide} ${i === current ? styles.isActive : ''}`}
          >
            <img src={src} alt="" className={styles.carouselImg} loading="lazy" />
          </div>
        ))}

        {showArrows && hasMultiple && (
          <>
            <button className={`${styles.carouselZone} ${styles.carouselZonePrev}`} onClick={prev} aria-label="Previous">
              <span className={styles.carouselZoneShadow} />
            </button>
            <button className={`${styles.carouselZone} ${styles.carouselZoneNext}`} onClick={next} aria-label="Next">
              <span className={styles.carouselZoneShadow} />
            </button>
          </>
        )}
      </div>

      {showThumbs && hasMultiple && (
        <div className={styles.carouselThumbs}>
          {images.map((src, i) => (
            <button
              key={i}
              className={`${styles.carouselThumb} ${i === current ? styles.isActive : ''}`}
              onClick={() => goTo(i)}
            >
              <img src={src} alt="" className={styles.carouselThumbImg} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
