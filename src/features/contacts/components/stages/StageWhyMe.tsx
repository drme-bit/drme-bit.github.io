'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { FiBriefcase, FiGithub, FiUsers, FiCode, FiLayers, FiZap } from 'react-icons/fi';
import styles from './StageWhyMe.module.scss';

gsap.registerPlugin(ScrollTrigger);

const STRENGTHS = [
  { icon: FiCode, title: 'Clean Code' },
  { icon: FiLayers, title: 'Full Stack' },
  { icon: FiZap, title: 'Fast Delivery' },
];

export default function StageWhyMe() {
  const stageRef = useRef<HTMLDivElement>(null);
  const bgTextRef = useRef<HTMLDivElement>(null);
  const avatarRef = useRef<HTMLDivElement>(null);
  const midStatsRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  const lenis = useLenis();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Важно для Lenis
    ScrollTrigger.refresh();

    const ctx = gsap.context(() => {
      // Background text
      gsap.fromTo(
        bgTextRef.current,
        { x: -80, opacity: 0.03, scale: 0.8 },
        {
          x: 20,
          opacity: 0.08,
          scale: 1.05,
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        },
      );

      // Avatar
      gsap.fromTo(
        avatarRef.current,
        { x: -60, scale: 0.6, opacity: 0, rotate: -8 },
        {
          x: 0,
          scale: 1,
          opacity: 1,
          rotate: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 0.6,
          },
        },
      );

      // Mid stats
      gsap.fromTo(
        midStatsRef.current,
        { x: 50, opacity: 0 },
        {
          x: -10,
          opacity: 0.95,
          ease: 'none',
          scrollTrigger: {
            trigger: stage,
            start: 'top 65%',
            end: 'top 20%',
            scrub: 0.8,
          },
        },
      );

      // Inner content
      gsap.fromTo(
        innerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 60%',
            end: 'top 30%',
            scrub: 0.5,
          },
        },
      );

      // Strengths
      gsap.fromTo(
        `.${styles.strength}`,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 50%',
            end: 'top 20%',
            scrub: 0.6,
          },
        },
      );
    }, stageRef);

    return () => {
      ctx.revert();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === stage) t.kill();
      });
    };
  }, [lenis]); // Добавили зависимость от lenis

  return (
    <div ref={stageRef} className={styles.stage}>
      <div ref={bgTextRef} className={styles.bgText}>
        ME
      </div>

      <div ref={midStatsRef} className={styles.midStats}>
        <div className={styles.floatStat}>
          <FiBriefcase size={12} />
          <span>5+ years</span>
        </div>
        <div className={styles.floatStat}>
          <FiGithub size={12} />
          <span>30+ projects</span>
        </div>
        <div className={styles.floatStat}>
          <FiUsers size={12} />
          <span>15+ clients</span>
        </div>
      </div>

      <div ref={avatarRef} className={styles.avatarWrap}>
        <div className={styles.avatar}>
          <span className={styles.avatarText}>SC</span>
        </div>
        <span className={styles.pulse} />
      </div>

      <div ref={innerRef} className={styles.inner}>
        <span className={styles.tag}>01 / 03</span>
        <h2 className={styles.title}>Why Me</h2>
        <p className={styles.subtitle}>fullstack developer · ukraine</p>

        <div className={styles.strengths}>
          {STRENGTHS.map((s) => (
            <div key={s.title} className={styles.strength}>
              <s.icon size={11} />
              <span>{s.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
