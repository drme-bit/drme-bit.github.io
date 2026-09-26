'use client';

import { useEffect } from 'react';
import GlyphPortal from '@/shared/ui/GlyphPortal/GlyphPortal';

/* Scroll-driven camera through live type — the hand-off into Projects.
   Solid violet zone (paper, field, landing and hero all #150d31):
   percentage gradients render per-box and always show a seam.

   Styling is Tailwind arbitrary (no SCSS module): the `!` suffixes win
   over GlyphPortal's unlayered <style> internals, which beat layered
   utilities on equal specificity. */

export function ProjectsPortal() {
  // While the portal covers the viewport, the fixed Scene canvas behind it
  // is pure waste (full-screen WebGL nobody sees) — pause it.
  useEffect(() => {
    const section = document.querySelector('section[id^="gp-"]');
    if (!section || typeof IntersectionObserver === 'undefined') return;
    let paused = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        // Sleep the background GL the moment the portal touches the viewport:
        // WebGL + the SVG flight together is what stutters WebKit, and the
        // paper is opaque anyway, so nothing visible is lost.
        const next = entry.isIntersecting && entry.intersectionRatio > 0.05;
        if (next !== paused) {
          paused = next;
          window.dispatchEvent(new CustomEvent<boolean>('bg-pause', { detail: paused }));
        }
      },
      { threshold: [0, 0.05, 0.6, 1] },
    );
    io.observe(section);
    return () => {
      io.disconnect();
      window.dispatchEvent(new CustomEvent<boolean>('bg-pause', { detail: false }));
    };
  }, []);

  return (
    <GlyphPortal
      word="PROJECTS"
      scrollLength={1.8}
      interactive
      annotations={false}
      fontFamily="var(--font-display), 'Arial Black', sans-serif"
      fontWeight={800}
      enterLabel="View work"
      className="font-[family-name:var(--font-sans)]! [&_[data-gp-content]]:bg-[#150d31]! [&_[data-gp-content]]:min-h-[30vh]! [&_[data-gp-content]]:py-[clamp(1.5rem,4vh,3rem)]! [&_[data-gp-pin]]:will-change-transform"
      style={{
        '--gp-paper': 'var(--bg)',
        '--gp-ink': 'var(--text)',
        '--gp-field': '#150d31',
        '--gp-foreground': '#f0eeeb',
      }}
      background={
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, background: '#150d31' }}
        />
      }
      front={
        <p className="absolute! [inset:auto_24px_calc(100%-var(--gp-word-top,35%)+28px)]! m-0 flex flex-col items-center gap-[0.35rem] text-center text-[13px] leading-[1.5] text-[var(--text-dim)]">
          <span>Shipped, not shelved.</span>
          <span>Scroll to step inside ↓</span>
        </p>
      }
    >
      <></>
    </GlyphPortal>
  );
}
