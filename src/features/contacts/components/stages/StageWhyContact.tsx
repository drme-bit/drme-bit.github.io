'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react'
import { FiClock, FiMessageSquare, FiShield, FiRefreshCw, FiHeart, FiTrendingUp } from 'react-icons/fi';
import styles from './StageWhyContact.module.scss';

gsap.registerPlugin(ScrollTrigger);

const REASONS = [
  { icon: FiClock, title: 'Fast Response', desc: 'within 24h', color: '#34d399' },
  { icon: FiMessageSquare, title: 'Clear Communication', desc: 'no jargon', color: '#7dd3fc' },
  { icon: FiShield, title: 'Reliable', desc: 'deadlines sacred', color: '#f472b6' },
  { icon: FiRefreshCw, title: 'Iterative', desc: 'feedback loops', color: '#a78bfa' },
  { icon: FiHeart, title: 'Passionate', desc: 'love what i do', color: '#fb923c' },
  { icon: FiTrendingUp, title: 'Growth', desc: 'always improving', color: '#fbbf24' },
];

export default function StageWhyContact() {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const floatRingRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const lenis = useLenis();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      gsap.fromTo(bgTextRef.current,
        { x: -50, opacity: 0.01, scale: 0.85, rotation: -3 },
        {
          x: 0, opacity: 0.05, scale: 1, rotation: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top center',
            end: 'bottom center',
            scrub: 0.3,
          },
        }
      );

      gsap.fromTo(floatRingRef.current,
        { x: 30, opacity: 0, rotation: 0 },
        {
          x: 0, opacity: 0.2, rotation: 120,
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top center',
            end: 'bottom center',
            scrub: 0.3,
          },
        }
      );

      gsap.fromTo(innerRef.current,
        { y: 20, opacity: 0 },
        {
          y: 0, opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 50%',
            end: 'top 10%',
            scrub: 0.2,
          },
        }
      );

      gsap.fromTo(`.${styles.card}`,
        { y: 15, opacity: 0, scale: 0.88 },
        {
          y: 0, opacity: 1, scale: 1,
          stagger: 0.04,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 40%',
            end: 'top 10%',
            scrub: 0.2,
          },
        }
      );
    }, stageRef);

    return () => {
      clearTimeout(refreshTimeout);
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === stage) t.kill();
      });
    };
  }, [lenis]);

  return (
    <div ref={stageRef} className={styles.stage}>
      <div ref={bgTextRef} className={styles.bgText}>WHY</div>
      <div ref={floatRingRef} className={styles.floatRing} />

      <div ref={innerRef} className={styles.inner}>
        <span className={styles.tag}>02 / 03</span>
        <h2 className={styles.title}>Why Contact</h2>
        <p className={styles.subtitle}>what makes me different</p>

        <div className={styles.grid}>
          {REASONS.map((r) => (
            <div key={r.title} className={styles.card} style={{ '--card-color': r.color } as React.CSSProperties}>
              <r.icon size={14} className={styles.cardIcon} />
              <span className={styles.cardTitle}>{r.title}</span>
              <span className={styles.cardDesc}>{r.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
