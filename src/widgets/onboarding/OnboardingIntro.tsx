'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { LOADED_EVENT } from '@/features/loading';
import { LogoMark } from '@/shared/ui/LogoMark/LogoMark';
import { BookOpen, FiArrowRight, FiFolder, FiUser, FiX } from '@/shared/ui/Icon';

const ONBOARDING_KEY = 'drme-onboarded';
const LOADED_FLAG = 'drme-loaded';

const destinations = [
  { href: '/projects', label: 'Projects', detail: 'Three builds, full stories', icon: FiFolder },
  { href: '/blog', label: 'Writing', detail: 'Notes from the process', icon: BookOpen },
  { href: '/resume', label: 'About me', detail: 'Experience and résumé', icon: FiUser },
];

function readFlag(kind: 'local' | 'session', key: string) {
  try {
    const storage = kind === 'local' ? window.localStorage : window.sessionStorage;
    return storage.getItem(key) !== null;
  } catch {
    return false;
  }
}

export function OnboardingIntro() {
  const [visible, setVisible] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, '1');
    } catch {
      // The welcome can still be dismissed when storage is unavailable.
    }
    setVisible(false);
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);

  useEffect(() => {
    const showIfFirstVisit = () => {
      if (readFlag('local', ONBOARDING_KEY)) return;
      returnFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      setVisible(true);
    };

    if (
      document.documentElement.dataset.portfolioLoaded === 'true' ||
      readFlag('session', LOADED_FLAG)
    ) {
      showIfFirstVisit();
    }
    window.addEventListener(LOADED_EVENT, showIfFirstVisit);
    return () => window.removeEventListener(LOADED_EVENT, showIfFirstVisit);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = dialogRef.current;
    const firstControl = dialog?.querySelector<HTMLElement>('button, a[href]');
    firstControl?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== 'Tab' || !dialog) return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]'),
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [dismiss, visible]);

  if (!visible) return null;

  return (
    <div
      className="onboarding-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) dismiss();
      }}
    >
      <div
        ref={dialogRef}
        className="onboarding-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
      >
        <button
          type="button"
          className="onboarding-close"
          aria-label="Close welcome"
          onClick={dismiss}
        >
          <FiX size={16} />
        </button>

        <div className="onboarding-brand">
          <LogoMark className="onboarding-mark" />
          <span>drme-bit</span>
          <span className="onboarding-location">Odesa, Ukraine</span>
        </div>

        <div className="onboarding-copy">
          <p className="onboarding-kicker">A portfolio you can move through</p>
          <h1 id="onboarding-title">Hi, I&apos;m Vyacheslav.</h1>
          <p className="onboarding-description">
            Full-stack developer building software, game systems and the tools around them. This
            portfolio is interactive, so take a look around.
          </p>
        </div>

        <nav className="onboarding-destinations" aria-label="Explore the portfolio">
          {destinations.map(({ href, label, detail, icon: Icon }) => (
            <Link key={href} href={href} className="onboarding-destination" onClick={dismiss}>
              <Icon size={16} aria-hidden="true" />
              <span className="onboarding-destination-copy">
                <span>{label}</span>
                <span>{detail}</span>
              </span>
              <FiArrowRight className="onboarding-destination-arrow" size={15} aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="onboarding-footer">
          <span>Scroll, explore, ask the guide.</span>
          <button type="button" onClick={dismiss}>
            Start exploring <FiArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
      </div>

      <style jsx>{`
        .onboarding-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgb(0 0 0 / 64%);
          backdrop-filter: blur(8px);
          animation: ob-fade 180ms ease-out both;
        }
        .onboarding-dialog {
          position: relative;
          width: min(100%, 520px);
          padding: 28px;
          color: var(--text);
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 12px;
          box-shadow: 0 24px 80px rgb(0 0 0 / 32%);
          animation: ob-enter 240ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }
        .onboarding-close {
          position: absolute;
          top: 16px;
          right: 16px;
          display: grid;
          width: 32px;
          height: 32px;
          place-items: center;
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid transparent;
          border-radius: 6px;
          cursor: pointer;
        }
        .onboarding-close:hover {
          color: var(--text);
          background: var(--bg);
          border-color: var(--border);
        }
        .onboarding-close:focus-visible,
        .onboarding-destination:focus-visible,
        .onboarding-footer button:focus-visible {
          outline: 2px solid var(--accent-secondary);
          outline-offset: 2px;
        }
        .onboarding-brand {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          font-weight: 600;
        }
        .onboarding-mark {
          width: 22px;
          height: 22px;
          color: var(--text);
        }
        .onboarding-location {
          margin-left: auto;
          padding-right: 38px;
          color: var(--text-ghost);
          font-size: 12px;
          font-weight: 400;
        }
        .onboarding-copy {
          margin-top: 34px;
        }
        .onboarding-kicker {
          margin: 0 0 10px;
          color: var(--accent-secondary);
          font-size: 12px;
        }
        .onboarding-copy h1 {
          margin: 0;
          font-size: clamp(28px, 7vw, 36px);
          line-height: 1.1;
          font-weight: 600;
        }
        .onboarding-description {
          max-width: 42ch;
          margin: 12px 0 0;
          color: var(--text-secondary);
          font-size: 14px;
          line-height: 1.65;
        }
        .onboarding-destinations {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-top: 28px;
        }
        .onboarding-destination {
          display: flex;
          min-width: 0;
          min-height: 90px;
          flex-direction: column;
          align-items: flex-start;
          gap: 11px;
          padding: 12px;
          color: var(--text-secondary);
          text-decoration: none;
          background: var(--bg);
          border: 1px solid var(--border);
          border-radius: 8px;
          transition:
            border-color 140ms ease,
            color 140ms ease,
            transform 140ms ease;
        }
        .onboarding-destination:hover {
          color: var(--text);
          border-color: var(--border-hover);
          transform: translateY(-2px);
        }
        .onboarding-destination-copy {
          display: grid;
          gap: 3px;
        }
        .onboarding-destination-copy span:first-child {
          color: var(--text);
          font-size: 13px;
          font-weight: 550;
        }
        .onboarding-destination-copy span:last-child {
          color: var(--text-ghost);
          font-size: 11px;
          line-height: 1.35;
        }
        .onboarding-destination-arrow {
          display: none;
        }
        .onboarding-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--border);
        }
        .onboarding-footer > span {
          color: var(--text-ghost);
          font-size: 12px;
        }
        .onboarding-footer button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 36px;
          padding: 0 12px;
          color: var(--bg);
          font: inherit;
          font-size: 13px;
          font-weight: 550;
          background: var(--text);
          border: 0;
          border-radius: 6px;
          cursor: pointer;
        }
        .onboarding-footer button:hover {
          opacity: 0.88;
        }
        @keyframes ob-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes ob-enter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @media (max-width: 520px) {
          .onboarding-overlay {
            padding: 14px;
          }
          .onboarding-dialog {
            padding: 22px 18px 18px;
          }
          .onboarding-copy {
            margin-top: 26px;
          }
          .onboarding-destinations {
            grid-template-columns: 1fr;
            gap: 6px;
            margin-top: 22px;
          }
          .onboarding-destination {
            min-height: 54px;
            flex-direction: row;
            align-items: center;
            gap: 11px;
            padding: 9px 11px;
          }
          .onboarding-destination-copy {
            gap: 2px;
          }
          .onboarding-destination-arrow {
            display: block;
            margin-left: auto;
          }
          .onboarding-footer {
            align-items: flex-start;
            flex-direction: column;
            margin-top: 18px;
            padding-top: 14px;
          }
          .onboarding-location {
            padding-right: 38px;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .onboarding-overlay,
          .onboarding-dialog {
            animation: none;
          }
          .onboarding-destination {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}
