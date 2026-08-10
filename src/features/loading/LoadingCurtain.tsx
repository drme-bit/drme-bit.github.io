'use client';

import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { profile } from '@/entities/profile';
import { LogoMark } from '@/shared/ui/atoms/LogoMark/LogoMark';
import { Halo } from '@/shared/ui/atoms/Halo/Halo';
import styles from './LoadingCurtain.module.scss';

const SESSION_KEY = 'drme-loaded';

export const LOADED_EVENT = 'drme:loaded';

/*  LoadingCurtain ─ */

export function LoadingCurtain() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useGSAP(
    () => {
      if (!visible || !wrapperRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const done = () => {
        sessionStorage.setItem(SESSION_KEY, '1');
        setVisible(false);
        window.dispatchEvent(new CustomEvent(LOADED_EVENT));
      };

      /*  Compute the flight: big mark → header mark  */
      let flyX = 0;
      let flyY = 0;
      let flyScale = 1;
      const logoEl = logoRef.current;
      if (logoEl) {
        const candidates = [
          document.querySelector('[data-nav-logo]'),
          document.querySelector('[data-mobile-nav-logo]'),
        ];
        const flyTarget =
          candidates.find((el) => el && (el as HTMLElement).offsetWidth > 0) ??
          candidates[0] ??
          null;
        const from = logoEl.getBoundingClientRect();
        if (flyTarget && from.width > 0) {
          const to = flyTarget.getBoundingClientRect();
          flyScale = to.width / from.width;
          flyX = to.left + to.width / 2 - (from.left + from.width / 2);
          flyY = to.top + to.height / 2 - (from.top + from.height / 2);
        }
      }

      if (reduced) {
        gsap.set(logoEl, { opacity: 1 });
        gsap.set(wrapperRef.current.querySelectorAll(`.${styles.halo}, .${styles.brand}`), {
          opacity: 1,
        });
        if (progressRef.current) progressRef.current.textContent = '100';
        if (barRef.current) barRef.current.style.transform = 'scaleX(1)';
        gsap.to(wrapperRef.current, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.6,
          delay: 0.4,
          ease: 'power4.inOut',
          onComplete: done,
        });
        return;
      }

      const path = pathRef.current;
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, {
          strokeDasharray: len,
          strokeDashoffset: len,
          fillOpacity: 0,
          strokeOpacity: 1,
        });
      }

      const counter = { v: 0 };
      const tl = gsap.timeline({ onComplete: done });

      tl.set(logoEl, { opacity: 1 })
        .fromTo(
          `.${styles.stage}`,
          { opacity: 0, scale: 0.94 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'power3.out' },
          0,
        )
        .fromTo(
          `.${styles.halo}`,
          { opacity: 0, rotate: -60 },
          { opacity: 1, rotate: 0, duration: 1, ease: 'power2.out' },
          0.1,
        )
        .to(path, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut' }, 0.2)
        .to(path, { fillOpacity: 1, strokeOpacity: 0.15, duration: 0.5, ease: 'power1.out' }, 1.35)
        .fromTo(
          `.${styles.brand}`,
          { opacity: 0, y: 10 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
          0.55,
        )
        .to(
          counter,
          {
            v: 100,
            duration: 1.6,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (progressRef.current) progressRef.current.textContent = String(Math.round(counter.v));
            },
          },
          0.7,
        )
        .to(barRef.current, { scaleX: 1, duration: 1.6, ease: 'power2.inOut' }, 0.7)
        .add('fly', 2.5)
        .to(
          [`.${styles.brand}`, `.${styles.progress}`, `.${styles.backdrop}`],
          { opacity: 0, duration: 0.3, ease: 'power1.in' },
          'fly',
        )
        .to(
          logoEl,
          { scale: 1.08, duration: 0.16, ease: 'power1.out', transformOrigin: '50% 50%' },
          'fly',
        )
        .to(
          logoEl,
          {
            x: flyX,
            y: flyY,
            scale: flyScale,
            duration: 0.8,
            ease: 'power4.inOut',
            transformOrigin: '50% 50%',
            onComplete: () => {
              if (logoEl) gsap.set(logoEl, { opacity: 0 });
            },
          },
          'fly+=0.16',
        )
        .to(wrapperRef.current, {
          clipPath: 'inset(0 0 100% 0)',
          duration: 0.85,
          ease: 'power4.inOut',
        }, 'fly+=0.16');
    },
    { scope: wrapperRef, dependencies: [visible] },
  );

  useGSAP(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div ref={wrapperRef} className={styles.curtain} role="status" aria-live="polite">
      <div className={styles.backdrop} aria-hidden="true">
        <span className={styles['orb-one']} />
        <span className={styles['orb-two']} />
        <span className={styles.grid} />
      </div>

      <div className={styles.content}>
        <div className={styles.stage}>
          <div className={styles.halo}>
            <Halo />
          </div>
          <div ref={logoRef} className={styles.logo}>
            <LogoMark
              pathClassName={styles['logo-path']}
              pathRef={pathRef}
            />
          </div>
        </div>

        <div className={styles.brand}>
          <span className={styles['brand-label']}>
            drme@portfolio
            <span className={styles['brand-cursor']} />
          </span>
          <p className={styles.tagline}>{profile.brandTagline}</p>
        </div>

        <div className={styles.progress}>
          <span ref={barRef} className={styles['progress-bar']} />
          <span className={styles['progress-label']}>
            <span className={styles['progress-hint']}>booting Dr.ME</span>
            <span className={styles['progress-num']}>
              <span ref={progressRef}>0</span>%
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
