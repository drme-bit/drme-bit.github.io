'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TransitionLink } from '@/features/transitions';
import { BookOpen, FiArrowLeft, FiArrowRight, FiFolder } from '@/shared/ui/Icon';
import { SignalCable } from '@/widgets/not-found/SignalCable';
import styles from './NotFound.module.scss';

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className={styles.page}>
      <div className={styles.topline}>
        <span>
          drme-bit <span aria-hidden="true">/</span> route error
        </span>
        <span className={styles.status}>
          <span className={styles.statusDot} aria-hidden="true" /> 404
        </span>
      </div>

      <section className={styles.hero} aria-labelledby="not-found-title">
        <SignalCable />
        <div className={styles.message}>
          <span className={styles.eyebrow}>
            Connection lost <span>404</span>
          </span>
          <h1 id="not-found-title">No signal here.</h1>
          <p>This page isn&apos;t connected. It may have moved, or the link may be out of date.</p>
          <code className={styles.path} title={pathname ?? undefined}>
            {pathname || '/'}
          </code>
          <div className={styles.actions}>
            <TransitionLink href="/" className={styles.primaryAction}>
              Back to home <FiArrowRight size={16} aria-hidden="true" />
            </TransitionLink>
            <button type="button" onClick={() => router.back()} className={styles.backAction}>
              <FiArrowLeft size={15} aria-hidden="true" /> Go back
            </button>
          </div>
        </div>
      </section>

      <nav className={styles.recovery} aria-label="Useful pages">
        <span className={styles.recoveryLabel}>Find your way around</span>
        <TransitionLink href="/projects">
          <FiFolder size={16} aria-hidden="true" />
          <span>Projects</span>
          <FiArrowRight size={15} aria-hidden="true" />
        </TransitionLink>
        <TransitionLink href="/blog">
          <BookOpen size={16} aria-hidden="true" />
          <span>Writing</span>
          <FiArrowRight size={15} aria-hidden="true" />
        </TransitionLink>
        <TransitionLink href="/resume">
          <span className={styles.resumeGlyph}>CV</span>
          <span>Résumé</span>
          <FiArrowRight size={15} aria-hidden="true" />
        </TransitionLink>
      </nav>

      <div className={styles.footer}>
        <span>There&apos;s plenty to explore.</span>
        <span>{pathname || '/'}</span>
      </div>
    </main>
  );
}
