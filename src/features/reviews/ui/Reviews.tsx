'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useInView } from '@/shared/hooks/useInView';
import { ENDORSEMENTS } from '@/entities/review';
import type { Endorsement } from '@/entities/review';

function portraitPath(endorsement: Endorsement) {
  if (!endorsement.image) return null;
  return /^(https?:|data:|\/)/.test(endorsement.image)
    ? endorsement.image
    : `/${endorsement.image}`;
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
}

function QuoteCard({ endorsement, index }: { endorsement: Endorsement; index: number }) {
  const image = portraitPath(endorsement);

  return (
    <article className="group relative isolate flex min-h-[340px] flex-col overflow-hidden rounded-[10px] p-7 md:min-h-[410px] md:p-9 lg:p-10">
      <div
        aria-hidden="true"
        className={`absolute inset-0 -z-10 ${index === 0 ? 'bg-[color-mix(in_srgb,var(--accent-secondary)_16%,var(--bg-surface))]' : 'bg-[color-mix(in_srgb,var(--accent-warm)_17%,var(--bg-surface))]'}`}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -top-[0.24em] -z-10 select-none font-display text-[clamp(16rem,30vw,30rem)] font-medium leading-none tracking-[-0.12em] text-[color-mix(in_srgb,var(--text)_4%,transparent)] transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none"
      >
        ”
      </span>

      <blockquote className="m-0 max-w-[27ch] font-display text-[clamp(1.7rem,3.5vw,3.15rem)] font-medium leading-[1.08] tracking-[-0.055em] text-[var(--text)]">
        “{endorsement.text}”
      </blockquote>

      <div className="mt-auto flex items-center gap-3 pt-10">
        <span className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--bg-elevated)] text-[0.75rem] font-medium text-[var(--text-secondary)]">
          {image ? (
            <Image src={image} alt="" fill sizes="44px" className="object-cover" />
          ) : (
            initialsOf(endorsement.name)
          )}
        </span>
        <span className="min-w-0 border-l border-[color-mix(in_srgb,var(--text)_16%,transparent)] pl-3">
          <span className="block truncate text-[0.9rem] font-semibold text-[var(--text)]">
            {endorsement.name}
          </span>
          <span className="mt-0.5 block truncate text-[0.78rem] text-[var(--text-secondary)]">
            {endorsement.role}
          </span>
        </span>
      </div>
    </article>
  );
}

export default function Reviews() {
  const [pairStart, setPairStart] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const prefersReducedMotion = useReducedMotion();
  const [contentRef, contentInView] = useInView<HTMLDivElement>({ threshold: 0.08 });
  const count = ENDORSEMENTS.length;
  const slideCount = Math.ceil(count / 2);
  const visible = count > 1
    ? [ENDORSEMENTS[pairStart], ENDORSEMENTS[(pairStart + 1) % count]]
    : ENDORSEMENTS.slice(0, 1);

  useEffect(() => {
    if (!contentInView || isInteracting || count < 3 || prefersReducedMotion) return;

    const timer = window.setInterval(() => {
      setPairStart((current) => ((Math.floor(current / 2) + 1) % slideCount) * 2);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [contentInView, count, isInteracting, prefersReducedMotion, slideCount]);

  if (count === 0) return null;


  return (
    <section
      id="reviews"
      onMouseEnter={() => setIsInteracting(true)}
      onMouseLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsInteracting(false);
        }
      }}
      className="relative border-t border-[var(--border)] bg-[var(--bg)]"
    >
      <div className="mx-auto w-full max-w-[1500px] px-5 py-20 md:px-8 md:py-28">
        <header className="mb-9 md:mb-12">
          <div>
            <p className="m-0 mb-3 text-[0.82rem] font-medium text-[var(--text-dim)]">
              From people I’ve worked with
            </p>
            <h2 className="m-0 font-display text-[clamp(2.8rem,7vw,5.5rem)] font-semibold leading-[0.96] tracking-[-0.075em] text-[var(--text)]">
              Kind words
            </h2>
          </div>
        </header>

        <div
          ref={contentRef}
          onPointerDown={(event) => {
            touchStartX.current = event.pointerType === 'touch' ? event.clientX : null;
          }}
          onPointerUp={(event) => {
            const startX = touchStartX.current;
            touchStartX.current = null;
            if (startX === null || Math.abs(event.clientX - startX) < 56) return;
            setPairStart((current) => {
              const currentSlide = Math.floor(current / 2);
              const direction = event.clientX < startX ? 1 : -1;
              return ((currentSlide + direction + slideCount) % slideCount) * 2;
            });
          }}
          onPointerCancel={() => {
            touchStartX.current = null;
          }}
          className={`touch-pan-y transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${contentInView ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={pairStart}
              initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: prefersReducedMotion ? 0 : -28 }}
              transition={{ duration: prefersReducedMotion ? 0.15 : 0.46, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-1 gap-2 md:grid-cols-[1.45fr_1fr]"
            >
              {visible.map((endorsement, index) => (
                <QuoteCard key={endorsement.id} endorsement={endorsement} index={index} />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        <footer className="mt-7 flex items-center justify-between gap-4 text-[0.82rem] text-[var(--text-dim)] md:mt-9">
          <span>Thoughtful work leaves a good impression.</span>
          <nav aria-label="Recommendations" className="flex items-center gap-1.5">
            {Array.from({ length: slideCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setPairStart(index * 2)}
                aria-label={`Show recommendation set ${index + 1}`}
                aria-current={Math.floor(pairStart / 2) === index ? 'page' : undefined}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[var(--geist-focus)] ${Math.floor(pairStart / 2) === index ? 'w-6 bg-[var(--text-secondary)]' : 'w-1.5 bg-[var(--border-hover)] hover:bg-[var(--text-dim)]'}`}
              />
            ))}
          </nav>
        </footer>
      </div>
    </section>
  );
}
