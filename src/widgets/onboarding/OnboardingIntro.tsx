'use client';

import { useEffect, useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { LogoMark } from '@/shared/ui/LogoMark/LogoMark';
import { Halo } from '@/shared/ui/Halo/Halo';
import { LOADED_EVENT } from '@/features/loading';

const ONBOARDING_KEY = 'drme-onboarded';
const LOADED_FLAG = 'drme-loaded';

function isOnboarded(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(ONBOARDING_KEY) !== null;
  } catch {
    return false;
  }
}

function hasLoadedBefore(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(LOADED_FLAG) !== null;
  } catch {
    return false;
  }
}

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
  /*  Initial visibility is computed once, during first render, so no
      synchronous setState is needed inside an effect below.  */
  const [dismissed] = useState<boolean>(isOnboarded);
  const [visible, setVisible] = useState<boolean>(() => !dismissed && hasLoadedBefore());

  /*  Subscribe for the loader finishing; the callback owns the setState.  */
  useEffect(() => {
    if (dismissed || visible) return;
    const show = () => setVisible(true);
    window.addEventListener(LOADED_EVENT, show);
    return () => window.removeEventListener(LOADED_EVENT, show);
  }, [dismissed, visible]);

  useGSAP(
    () => {
      if (!visible || !cardRef.current) return;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduced) {
        const targets = wrapRef.current?.querySelectorAll('[data-ob-animate]');
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
        '[data-ob="card"]',
        { opacity: 0, scale: 0.96, y: 14 },
        { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: 'power3.out' },
      )
        .fromTo(
          '[data-ob="halo"]',
          { opacity: 0, rotate: -50 },
          { opacity: 1, rotate: 0, duration: 0.9, ease: 'power2.out' },
          0.15,
        )
        .to(path, { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' }, 0.25)
        .to(path, { fillOpacity: 1, strokeOpacity: 0.15, duration: 0.4, ease: 'power1.out' }, 1.25)
        .fromTo(
          '[data-ob="heading"]',
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
          0.55,
        )
        .fromTo(
          '[data-ob="step"]',
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out', stagger: 0.09 },
          0.8,
        )
        .fromTo(
          '[data-ob="actions"]',
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' },
          1.25,
        )
        .fromTo(
          '[data-ob="foot"]',
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
    <div ref={wrapRef} className="fixed inset-0 z-[1200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Welcome to Dr.ME">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden="true" />
      <div
        ref={cardRef}
        data-ob="card"
        className="relative w-full max-w-[440px] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-6 shadow-[var(--shadow-lg)] max-[700px]:p-5"
      >
        <div className="relative mx-auto flex size-20 items-center justify-center" data-ob="halo">
          <span className="absolute inset-0" aria-hidden="true">
            <Halo />
          </span>
          <LogoMark
            className="relative size-12 text-[var(--text)]"
            pathClassName="fill-transparent stroke-[var(--text)]"
            pathRef={pathRef}
          />
        </div>

        <header data-ob="heading" data-ob-animate className="mt-4 text-center">
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-ghost)]">
            [ first run ]
          </span>
          <h2 className="m-0 mt-2 font-display text-[clamp(1.5rem,5vw,1.9rem)] font-semibold leading-tight tracking-[var(--tracking-tight)] text-foreground">
            this is a <span className="text-[var(--accent-secondary)]">live portfolio</span>
          </h2>
          <p className="m-0 mx-auto mt-2 max-w-[38ch] text-[0.82rem] leading-[1.65] text-muted-foreground">
            Hi — I&apos;m Vyacheslav (drme-bit), a full-stack developer from Odesa.
            This site is built like a terminal: spin the 3D skills globe, open
            projects &amp; the blog, then say hello. Everything here responds —
            that&apos;s the whole point.
          </p>
        </header>

        <div className="mt-5 flex flex-col rounded-[var(--radius-sm)] border border-[var(--border)]">
          {STEPS.map((step, i) => (
            <div
              key={step.index}
              data-ob="step"
              data-ob-animate
              className={`flex items-baseline gap-3 px-3.5 py-2.5 ${i > 0 ? 'border-t border-[var(--border)]' : ''}`}
            >
              <span className="font-mono text-[0.62rem] text-[var(--text-ghost)]">{step.index}</span>
              <span className="text-[0.82rem] font-medium text-foreground">{step.title}</span>
              <span className="ml-auto truncate font-mono text-[0.62rem] text-[var(--text-ghost)]">
                {step.hint}
              </span>
            </div>
          ))}
        </div>

        <div data-ob="actions" data-ob-animate className="mt-5 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={close}
            className="group inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-sm)] bg-[var(--text)] px-4 py-2.5 text-[0.85rem] font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
          >
            enter the site
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </button>
          <span className="font-mono text-[0.6rem] text-[var(--text-ghost)]">
            press [enter] · click outside to skip
          </span>
        </div>

        <div data-ob="foot" data-ob-animate className="mt-4 flex items-center justify-center gap-2 border-t border-[var(--border)] pt-3 font-mono text-[0.6rem] text-[var(--text-ghost)]">
          <span>drme-bit · odesa, ukraine</span>
          <span aria-hidden="true" className="size-1 rounded-full bg-[var(--border-hover)]" />
          <span>built with react, three.js &amp; too much coffee</span>
        </div>
      </div>
    </div>
  );
}
