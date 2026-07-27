'use client';

//react
import { useRef } from 'react';
//gsap
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

//styles
import styles from './ProjectsHero.module.scss';

gsap.registerPlugin(ScrollTrigger);

interface ProjectsHeroProps {
  onRevealComplete?: () => void;
}

export default function ProjectsHero({ onRevealComplete }: ProjectsHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const section = sectionRef.current;
    const title = titleRef.current;
    const subtitle = subtitleRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {

      if (title) {
        gsap.fromTo(title,
          { opacity: 0, y: 60, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      if (subtitle) {
        gsap.fromTo(subtitle,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.2,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }

      // Grid pattern reveal
      if (gridRef.current) {
        const lines = gridRef.current.querySelectorAll('line');
        gsap.fromTo(lines,
          { strokeDashoffset: 100 },
          {
            strokeDashoffset: 0,
            duration: 1.5,
            stagger: 0.02,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 70%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={sectionRef} className={styles.hero}>
      {/* Decorative grid */}
      <div ref={gridRef} className={styles.grid}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-grid)" />
        </svg>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <span className={styles.tag}>01 / 03</span>
        <h1 ref={titleRef} className={styles.title}>
          <span className={styles.titleLine}>PROJECTS</span>
        </h1>
        <p ref={subtitleRef} className={styles.subtitle}>
          what i&apos;ve built
        </p>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <span>scroll</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      </div>
    </div>
  );
}
