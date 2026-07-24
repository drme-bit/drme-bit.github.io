'use client';

import { useRef, useEffect, useCallback, createContext, useContext, useState } from 'react';
import { useLenis } from 'lenis/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './ScrollStages.module.scss';

gsap.registerPlugin(ScrollTrigger);

interface ScrollCtx {
  progress: number;
  stage: number;
  stageProgress: number;
}

const ScrollContext = createContext<ScrollCtx>({ progress: 0, stage: 0, stageProgress: 0 });
export const useScrollContext = () => useContext(ScrollContext);

interface ScrollStagesProps {
  children: React.ReactNode;
  stageCount?: number;
}

export default function ScrollStages({ children, stageCount = 3 }: ScrollStagesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);

  const [ctx, setCtx] = useState<ScrollCtx>({ progress: 0, stage: 0, stageProgress: 0 });

  // Обновляем ScrollTrigger при скролле Lenis
  const lenis = useLenis(({ scroll }) => {
    ScrollTrigger.update();
  });

  useEffect(() => {
    const container = containerRef.current;
    const sticky = stickyRef.current;
    const strip = stripRef.current;
    const progressFill = progressRef.current;
    const dots = dotsRef.current;

    if (!container || !sticky || !strip || !progressFill || !dots) return;

    ScrollTrigger.refresh();

    const st = ScrollTrigger.create({
      trigger: container,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.2,
      pin: sticky,
      anticipatePin: 1,
      onUpdate: (self) => {
        const p = self.progress;
        const s = Math.min(Math.floor(p * stageCount), stageCount - 1);
        const sp = Math.max(0, Math.min(1, p * stageCount - s));

        setCtx({ progress: p, stage: s, stageProgress: sp });
      },
    });

    // Strip animation
    gsap.fromTo(
      strip,
      { width: '20vw', borderRadius: '14px' },
      {
        width: '100vw',
        borderRadius: '0px',
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
        },
      },
    );

    // Progress bar
    gsap.fromTo(
      progressFill,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
        },
      },
    );

    // Dots
    const dotEls = Array.from(dots.children) as HTMLElement[];
    dotEls.forEach((dot, i) => {
      gsap.fromTo(
        dot,
        { scale: 1 },
        {
          scale: 1.25,
          scrollTrigger: {
            trigger: container,
            start: `${(i / stageCount) * 100}% top`,
            end: `${((i + 1) / stageCount) * 100}% top`,
            scrub: 0.3,
          },
        },
      );
    });

    return () => {
      st.kill();
      // Более безопасный cleanup
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === container) trigger.kill();
      });
    };
  }, [stageCount]);

  return (
    <ScrollContext.Provider value={ctx}>
      <div ref={containerRef} className={styles.container}>
        <div ref={stickyRef} className={styles.sticky}>
          <div ref={stripRef} className={styles.strip} />
          <div className={styles.progressTrack}>
            <div ref={progressRef} className={styles.progressFill} />
          </div>
          <div ref={dotsRef} className={styles.dots}>
            {Array.from({ length: stageCount }).map((_, i) => (
              <div key={i} className={styles.dot}>
                <span className={styles.dotLabel}>{i + 1}</span>
              </div>
            ))}
          </div>
          <div className={styles.content}>{children}</div>
        </div>
      </div>
    </ScrollContext.Provider>
  );
}
