import { useState, useEffect, useCallback, useRef } from 'react';
import './Carousel.scss';

export default function Carousel({
  images = [],
  autoplay = 4000,
  showThumbs = true,
  showArrows = true,
  isActive = true,
}) {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef(null);

  const count = images.length;
  const hasMultiple = count > 1;

  const goTo = useCallback((idx) => {
    setCurrent((idx + count) % count);
  }, [count]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  useEffect(() => {
    if (!hasMultiple || !autoplay || isHovered || !isActive) return;
    intervalRef.current = setInterval(next, autoplay);
    return () => clearInterval(intervalRef.current);
  }, [hasMultiple, autoplay, isHovered, isActive, next]);

  if (!images.length) {
    return (
      <div className="carousel-empty">
        <div className="carousel-empty-line" />
      </div>
    );
  }

  return (
    <div
      className="carousel"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="carousel-viewport">
        {images.map((src, i) => (
          <div
            key={src}
            className={`carousel-slide${i === current ? ' is-active' : ''}`}
          >
            <img src={src} alt="" className="carousel-img" loading="lazy" />
          </div>
        ))}

        {showArrows && hasMultiple && (
          <>
            <button className="carousel-zone carousel-zone--prev" onClick={prev} aria-label="Previous">
              <span className="carousel-zone-shadow" />
            </button>
            <button className="carousel-zone carousel-zone--next" onClick={next} aria-label="Next">
              <span className="carousel-zone-shadow" />
            </button>
          </>
        )}
      </div>

      {showThumbs && hasMultiple && (
        <div className="carousel-thumbs">
          {images.map((src, i) => (
            <button
              key={i}
              className={`carousel-thumb${i === current ? ' is-active' : ''}`}
              onClick={() => goTo(i)}
            >
              <img src={src} alt="" className="carousel-thumb-img" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
