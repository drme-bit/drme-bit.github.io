'use client';

import { useEffect, useRef, useState } from 'react';
import { useLenis } from 'lenis/react';
import styles from './ScrollProgressBar.module.scss';

interface SectionMarker {
  id: string;
  title: string;
  topPercent: number;
}

export default function ScrollProgressBar() {
  const fillRef = useRef<HTMLDivElement | null>(null);
  const [markers, setMarkers] = useState<SectionMarker[]>([]);
  const lenis = useLenis();

  useEffect(() => {
    function updateMarkers() {
      const sections = document.querySelectorAll('section[id]');
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;

      if (docHeight <= 0) return;

      const newMarkers: SectionMarker[] = Array.from(sections).map((sec) => {
        const el = sec as HTMLElement;

        let absoluteTop = 0;
        let currentElement: HTMLElement | null = el;

        while (currentElement) {
          absoluteTop += currentElement.offsetTop;
          currentElement = currentElement.offsetParent as HTMLElement | null;
        }

        const topPercent = (absoluteTop / docHeight) * 100;

        const titleEl = el.querySelector('h2, h1, [class*="title"]');
        const title = titleEl?.textContent || el.id;

        return {
          id: el.id,
          title,
          topPercent: Math.min(Math.max(topPercent, 0), 100),
        };
      });

      setMarkers(newMarkers);
    }

    window.addEventListener('load', updateMarkers);
    window.addEventListener('resize', updateMarkers);

    const timer = setTimeout(updateMarkers, 300);

    return () => {
      window.removeEventListener('load', updateMarkers);
      window.removeEventListener('resize', updateMarkers);
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const el = fillRef.current;
    if (!el || !lenis) return;

    const handleScroll = ({ progress }: { progress: number }) => {
      el.style.height = `${progress * 100}%`;
    };

    lenis.on('scroll', handleScroll);
    return () => {
      lenis.off('scroll', handleScroll);
    };
  }, [lenis]);

  const handleMarkerClick = (id: string) => {
    const target = document.getElementById(id);
    if (target && lenis) {
      lenis.scrollTo(target, { offset: 0 });
    }
  };

  return (
    <div className={styles.scrollProgress}>
      <div ref={fillRef} className={styles.scrollProgressFill} />

      {markers.map((marker) => (
        <button
          key={marker.id}
          type="button"
          className={styles.marker}
          style={{ top: `${marker.topPercent}%` }}
          onClick={() => handleMarkerClick(marker.id)}
          title={marker.title}
        >
          <span className={styles.markerTooltip}>{marker.title}</span>
        </button>
      ))}
    </div>
  );
}
