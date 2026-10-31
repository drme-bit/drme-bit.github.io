'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { profile } from '@/entities/profile';
import { LogoMark } from '@/shared/ui/LogoMark/LogoMark';
import styles from './LoadingCurtain.module.scss';

const SESSION_KEY = 'drme-loaded';
export const LOADED_EVENT = 'drme:loaded';

export function LoadingCurtain() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useGSAP(
    () => {
      if (!visible || !wrapperRef.current) return;

      const done = () => {
        try {
          sessionStorage.setItem(SESSION_KEY, '1');
        } catch {
          // The intro still completes when storage is unavailable.
        }
        document.documentElement.dataset.portfolioLoaded = 'true';
        setVisible(false);
        window.dispatchEvent(new CustomEvent(LOADED_EVENT));
      };

      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set(wrapperRef.current, { opacity: 0 });
        done();
        return;
      }

      let flyX = 0;
      let flyY = 0;
      let flyScale = 1;
      const logo = logoRef.current;
      const target = [
        document.querySelector('[data-nav-logo]'),
        document.querySelector('[data-mobile-nav-logo]'),
      ].find((element) => element && (element as HTMLElement).offsetWidth > 0);

      if (logo && target) {
        const from = logo.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        flyX = to.left + to.width / 2 - (from.left + from.width / 2);
        flyY = to.top + to.height / 2 - (from.top + from.height / 2);
        flyScale = to.width / from.width;
      }

      const path = pathRef.current;
      if (path) {
        const length = path.getTotalLength();
        gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      }

      const timeline = gsap.timeline({ onComplete: done });
      timeline
        .set(logo, { opacity: 1 })
        .fromTo(
          `.${styles.stage}`,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.35, ease: 'power3.out' },
        )
        .to(path, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.inOut' }, 0.08)
        .fromTo(
          `.${styles.brand}`,
          { opacity: 0, y: 7 },
          { opacity: 1, y: 0, duration: 0.28, ease: 'power2.out' },
          0.35,
        )
        .to(barRef.current, { scaleX: 1, duration: 0.65, ease: 'power2.inOut' }, 0.42)
        .add('depart', 1.22)
        .to(
          [`.${styles.brand}`, `.${styles.progress}`, `.${styles.backdrop}`],
          { opacity: 0, duration: 0.2, ease: 'power1.in' },
          'depart',
        )
        .to(
          logo,
          {
            x: flyX,
            y: flyY,
            scale: flyScale,
            duration: 0.64,
            ease: 'power3.inOut',
            transformOrigin: '50% 50%',
          },
          'depart',
        )
        .to(
          wrapperRef.current,
          { clipPath: 'inset(0 0 100% 0)', duration: 0.55, ease: 'power3.inOut' },
          'depart+=0.12',
        );
    },
    { scope: wrapperRef, dependencies: [visible] },
  );

  useGSAP(() => {
    try {
      if (!sessionStorage.getItem(SESSION_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  if (!visible) return null;

  return (
    <div ref={wrapperRef} className={styles.curtain} role="status" aria-live="polite">
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles.grid} />
      </div>
      <div className={styles.content}>
        <div className={styles.stage}>
          <div ref={logoRef} className={styles.logo}>
            <LogoMark pathClassName={styles['logo-path']} pathRef={pathRef} />
          </div>
        </div>
        <div className={styles.brand}>
          <span className={styles['brand-label']}>
            drme-bit <span className={styles['brand-cursor']} />
          </span>
          <p className={styles.tagline}>{profile.brandTagline}</p>
        </div>
        <div className={styles.progress}>
          <span ref={barRef} className={styles['progress-bar']} />
          <span className={styles['progress-label']}>Opening portfolio</span>
        </div>
      </div>
    </div>
  );
}
