'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { LogoMark } from '@/shared/ui/atoms/LogoMark/LogoMark';
import { Halo } from '@/shared/ui/atoms/Halo/Halo';
import { LOADED_EVENT } from '@/features/loading';
import styles from './OnboardingIntro.module.scss';

const ONBOARDING_KEY = 'drme-onboarded';

interface Step {
  index: string;
  title: string;
  hint: string;
}

const STEPS: Step[] = [
  { index: '01', title: 'explore skills', hint: 'interactive 3d globe · 23 nodes' },
  { index: '02', title: 'read the source', hint: 'projects · blog · experiments' },
  { index: '03', title: 'meet the author', hint: 'about · résumé · socials' },
  { index: '04', title: 'say hello', hint: 'replies within 24h' },
];

/*  OnboardingIntro — first-run welcome overlay shown after the loading curtain.  */

export function OnboardingIntro() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(ONBOARDING_KEY)) return;
    if (sessionStorage.getItem('drme-loaded')) {
      setVisible(true);
      return;
    }
    const show = () => setVisible(true);
    window.addEventListener(LOADED_EVENT, show);
    return () => window.removeEventListener(LOADED_EVENT, show);
  }, []);

  useGSAP(
    () => {
      if (!visible || !cardRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        const targets = wrapRef.current?.querySelectorAll(
          `.${styles.card}, .${styles.stage}, .${styles.halo}, .${styles['step-row']}, .${styles['heading']}, .${styles.actions}, .${styles.foot}`,
        );
        if (targets) gsap.set(targets, { opacity: 1 });
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

      const tl = gsap.timeline();
      tl.fromTo(
        `.${styles.card}`,
        { opacity: 0, scale: 0.96, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      )
        .fromTo(
          `.${styles.halo}`,
          { opacity: 0, rotate: -50 },
          { opacity: 1, rotate: 0, duration: 0.9, ease: 'power2.out' },
          0.15,
        )
        .to(path, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.25)
        .to(path, { fillOpacity: 1, strokeOpacity: 0.15, duration: 0.4, ease: 'power1.out' }, 1.25)
        .fromTo(
          `.${styles.heading}`,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
          0.55,
        )
        .fromTo(
          `.${styles['step-row']}`,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.09 },
          0.8,
        )
        .fromTo(
          `.${styles.actions}`,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
          1.25,
        )
        .fromTo(
          `.${styles.foot}`,
          { opacity: 0 },
          { opacity: 1, duration: 0.35, ease: 'power1.out' },
          1.35,
        );
    },
    { scope: wrapRef, dependencies: [visible] },
  );

  const close = () => {
    localStorage.setItem(ONBOARDING_KEY, '1');
    const card = cardRef.current;
    if (card) {
      gsap.to(card, {
        opacity: 0,
        scale: 0.92,
        y: 18,
        duration: 0.35,
        ease: 'power3.in',
        onComplete: () => setVisible(false),
      });
    } else {
      setVisible(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible]);

  if (!visible) return null;

  return (
    <div ref={wrapRef} className={styles.wrap} role="dialog" aria-modal="true" aria-label="Welcome to Dr.ME">
      <div className={styles.scrim} onClick={close} aria-hidden="true" />
      <div ref={cardRef} className={styles.card}>
        <div className={styles.stage}>
          <div className={styles.halo}>
            <Halo />
          </div>
          <div className={styles.logo}>
            <LogoMark pathClassName={styles['logo-path']} pathRef={pathRef} />
          </div>
        </div>

        <header className={styles.heading}>
          <span className={styles['heading-kicker']}>[ first run ]</span>
          <h2 className={styles['heading-title']}>
            this is a <span>live portfolio</span>
          </h2>
          <p className={styles['heading-sub']}>
            Hi — I'm Vyacheslav (drme-bit), a full-stack developer from Odesa.
            This site is built like a terminal: spin the 3D skills globe, open
            projects &amp; the blog, then say hello. Everything here responds —
            that's the whole point.
          </p>
        </header>

        <div className={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.index} className={styles['step-row']}>
              <span className={styles['step-index']}>{step.index}</span>
              <span className={styles['step-title']}>{step.title}</span>
              <span className={styles['step-hint']}>{step.hint}</span>
            </div>
          ))}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.cta} onClick={close}>
            enter the site
            <span className={styles['cta-arrow']}>→</span>
          </button>
          <span className={styles['cta-hint']}>press [enter] · click outside to skip</span>
        </div>

        <div className={styles.foot}>
          <span>drme-bit · odesa, ukraine</span>
          <span className={styles['foot-dot']} />
          <span>built with react, three.js &amp; too much coffee</span>
        </div>
      </div>
    </div>
  );
}
