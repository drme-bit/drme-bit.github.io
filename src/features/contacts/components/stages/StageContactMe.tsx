'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiCalendar } from 'react-icons/fi';
import { useLenis } from 'lenis/react';
import ContactForm from '../ContactForm';
import SocialLinks from '../SocialLinks';
import styles from './StageContactMe.module.scss';

gsap.registerPlugin(ScrollTrigger);

export default function StageContactMe() {
  const stageRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const formSideRef = useRef<HTMLDivElement>(null);
  const infoSideRef = useRef<HTMLDivElement>(null);

  const lenis = useLenis();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    // Принудительно обновляем после рендера
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    const ctx = gsap.context(() => {
      // Общая анимация контента
      gsap.fromTo(
        innerRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 65%',
            end: 'top 25%',
            scrub: 0.8,
          },
        },
      );

      // Форма (слева)
      gsap.fromTo(
        formSideRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 55%',
            end: 'top 20%',
            scrub: 0.6,
          },
        },
      );

      // Инфо + социалки (справа)
      gsap.fromTo(
        infoSideRef.current,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: stage,
            start: 'top 55%',
            end: 'top 20%',
            scrub: 0.6,
          },
        },
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
      <div ref={innerRef} className={styles.inner}>
        <span className={styles.tag}>03 / 03</span>
        <h2 className={styles.title}>Contact Me</h2>
        <p className={styles.subtitle}>let&apos;s build something great together</p>

        <div className={styles.content}>
          <div ref={formSideRef} className={styles.formSide}>
            <ContactForm />
          </div>
          <div ref={infoSideRef} className={styles.infoSide}>
            <a
              href="https://calendly.com/vacheslavtkachik/30min"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.calendly}
            >
              <FiCalendar size={14} />
              <div>
                <span className={styles.calendlyTitle}>Schedule a Call</span>
                <span className={styles.calendlySub}>30 min · Calendly</span>
              </div>
            </a>
            <SocialLinks />
          </div>
        </div>
      </div>
    </div>
  );
}
