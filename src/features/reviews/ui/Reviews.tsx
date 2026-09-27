'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { useInView } from '@/shared/hooks/useInView';
import { ENDORSEMENTS } from '@/entities/review';
import type { Endorsement } from '@/entities/review';
import { PiStarFill, FiTwitter, FiLinkedin, FiInstagram, FiGithub, SiDiscord } from '@/shared/ui/Icon';

/*  Static testimonials (Firebase removed) — data lives in entities/review.  */

/*  Small pieces ── */

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, s) => (
        <PiStarFill
          key={s}
          size={size}
          className={s < rating ? 'text-[var(--accent-warm)]' : 'text-black/20'}
        />
      ))}
    </span>
  );
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

/*  Avatar tile ── */

function Tile({
  e, index, active, onHover,
}: {
  e: Endorsement;
  index: number;
  active: boolean;
  onHover: (id: string) => void;
}) {
  const size = index % 3 === 1 ? 'h-[178px] w-[168px] max-[640px]:h-auto max-[640px]:w-full max-[640px]:aspect-square'
    : index % 3 === 2 ? 'h-[168px] w-[158px] max-[640px]:h-auto max-[640px]:w-full max-[640px]:aspect-square'
      : 'h-[158px] w-[148px] max-[640px]:h-auto max-[640px]:w-full max-[640px]:aspect-square';

  const portrait =
    e.image && (/^(https?:|data:|\/)/.test(e.image) ? e.image : `/${e.image}`);

  return (
    <button
      type="button"
      onMouseEnter={() => onHover(e.id)}
      onFocus={() => onHover(e.id)}
      aria-label={e.name}
      style={portrait ? undefined : { backgroundColor: e.color ?? '#101010' }}
      className={`relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-lg)] p-0 transition-all duration-300 focus-visible:[outline:1px_solid_var(--accent-secondary)] focus-visible:outline-offset-3 ${size} ${
        active ? '-translate-y-0.5 border border-[var(--accent-secondary)]' : 'border border-[#101010]'
      }`}
    >
      {portrait ? (
        <Image src={portrait} alt={e.name} fill sizes="168px" className="object-cover" />
      ) : (
        <span className="font-display text-[clamp(1.2rem,2.2vw,1.7rem)] font-bold tracking-[-0.02em] text-white max-[640px]:text-[1.05rem]">
          {initialsOf(e.name)}
        </span>
      )}
    </button>
  );
}

/*  Roster row ── */

function Row({
  e, active, onHover,
}: {
  e: Endorsement;
  active: boolean;
  onHover: (id: string) => void;
}) {
  return (
    <div
      role="option"
      aria-selected={active}
      aria-label={`${e.name}, ${e.role}`}
      tabIndex={0}
      className={`group flex w-full items-center gap-3 rounded-[var(--radius-sm)] border-none bg-transparent p-[0.55rem_0.4rem] text-left transition-colors duration-200 outline-none hover:bg-[var(--glass)] focus-visible:bg-[var(--glass)]`}
      onMouseEnter={() => onHover(e.id)}
      onFocus={() => onHover(e.id)}
    >
      <span
        aria-hidden="true"
        className={`h-4 shrink-0 rounded transition-all duration-300 ${
          active ? 'w-[22px] bg-foreground' : 'w-1 bg-[var(--text-ghost)]'
        }`}
      />
      <span className="flex min-w-0 flex-col gap-[0.15rem]">
        <span className="font-display text-[1.05rem] font-semibold leading-[1.15] text-foreground transition-colors duration-200">
          {e.name}
        </span>
        <span className="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
          {e.role}
        </span>
      </span>
      <span
        aria-hidden="false"
        className={`pointer-events-none ml-auto inline-flex gap-[0.4rem] text-[var(--text-ghost)] transition-all duration-200 ${
          active
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
        }`}
      >
        {(
          [
            ['twitter', e.social?.twitter, FiTwitter, 'Twitter'],
            ['linkedin', e.social?.linkedin, FiLinkedin, 'LinkedIn'],
            ['instagram', e.social?.instagram, FiInstagram, 'Instagram'],
            ['github', e.social?.github, FiGithub, 'GitHub'],
            ['discord', e.social?.discord, SiDiscord, 'Discord'],
          ] as const
        ).map(([key, href, Icon, label]) =>
          href ? (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${e.name} on ${label}`}
              onClick={(ev) => ev.stopPropagation()}
              className="pointer-events-auto inline-flex text-[var(--text-dim)] transition-colors hover:text-foreground"
            >
              <Icon size={12} />
            </a>
          ) : null,
        )}
      </span>
    </div>
  );
}

/*  Section ── */

// Inverted light band: white background, black elements, no gradients.
const SECTION_TOKENS = [
  '[--bg:#ffffff]',
  '[--bg-surface:#f6f6f4]',
  '[--text:#101010]',
  '[--text-dim:#484844]',
  '[--text-ghost:#8c8c86]',
  '[--border:#e4e2dd]',
  '[--terminal-border:#e4e2dd]',
  '[--terminal-bar:#faf9f7]',
  '[--terminal-bar-border:rgba(10,10,10,0.08)]',
  '[--glass:rgba(10,10,10,0.05)]',
  '[--glass-hover:rgba(10,10,10,0.09)]',
].join(' ');

export default function Reviews() {
  const [activeId, setActiveId] = useState(ENDORSEMENTS[0].id);
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.12 });

  const active = useMemo(
    () => ENDORSEMENTS.find((e) => e.id === activeId) ?? ENDORSEMENTS[0],
    [activeId],
  );

  const busy = ENDORSEMENTS.length;
  const busyIdx = ENDORSEMENTS.findIndex((e) => e.id === active.id) + 1;

  return (
    <section id="reviews" className={`relative border-t border-[#e4e2dd] bg-white ${SECTION_TOKENS}`}>
      <div className="relative mx-auto w-full max-w-[1400px] px-[4vw] py-24 max-[700px]:px-5 max-[700px]:py-16">
        <header className="mb-14 flex flex-col gap-[0.4rem] max-[700px]:mb-9">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[var(--text-ghost)]">
            03 / 03
          </span>
          <h2 className="m-0 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-none tracking-[-0.03em] text-foreground">
            Kind words
          </h2>
          <p className="m-0 font-mono text-[0.7rem] lowercase tracking-[0.1em] text-muted-foreground">
            what people say after the merge is green
          </p>
        </header>

        <div
          ref={ref}
          className={`grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-start gap-x-20 gap-y-16 transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] max-[1100px]:grid-cols-1 max-[1100px]:gap-y-11 ${
            inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
          }`}
        >
          {/*  Photo grid ─ offset columns on desktop, even grid on phones  */}
          <div className="flex items-start gap-3 pb-2 max-[1100px]:w-full max-[640px]:grid max-[640px]:grid-cols-4 max-[640px]:gap-2 max-[640px]:pb-0" role="listbox" aria-label="People">
            <div className="flex flex-col gap-3 max-[640px]:contents">
              {ENDORSEMENTS.map((e, i) => (i % 3 === 0 ? (
                <Tile key={e.id} e={e} index={i} active={e.id === activeId} onHover={setActiveId} />
              ) : null))}
            </div>
            <div className="flex flex-col gap-3 max-[1100px]:mt-8 mt-13 max-[640px]:contents">
              {ENDORSEMENTS.map((e, i) => (i % 3 === 1 ? (
                <Tile key={e.id} e={e} index={i} active={e.id === activeId} onHover={setActiveId} />
              ) : null))}
            </div>
            <div className="flex flex-col gap-3 max-[1100px]:mt-4 mt-6 max-[640px]:contents">
              {ENDORSEMENTS.map((e, i) => (i % 3 === 2 ? (
                <Tile key={e.id} e={e} index={i} active={e.id === activeId} onHover={setActiveId} />
              ) : null))}
            </div>
          </div>

          {/*  Roster  */}
          <div className="flex flex-col gap-[0.2rem] pt-[0.4rem]">
            {ENDORSEMENTS.map((e) => (
              <Row key={e.id} e={e} active={e.id === activeId} onHover={setActiveId} />
            ))}
          </div>
        </div>

        {/*  Comment reader ─ shows the hovered person's note  */}
        <div className="mt-16 flex flex-col gap-[1.1rem] border-t border-[var(--terminal-border)] pt-8">
          <div className="flex flex-col gap-[0.9rem] animate-rise" key={active.id}>
            <Stars rating={active.rating} size={13} />
            <p className="m-0 max-w-[60ch] font-display text-[clamp(1.35rem,2.6vw,2rem)] font-medium leading-[1.35] tracking-[-0.015em] text-foreground">
              {active.text}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[0.82rem] text-muted-foreground">
            <span className="font-semibold text-foreground">{active.name}</span>
            <span className="text-[var(--text-dim)]">· {active.role}</span>
            {active.discordTag && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--terminal-bar-border)] bg-[var(--terminal-bar)] px-2 py-0.5 font-mono text-[0.68rem] text-[var(--text-dim)]">
                <SiDiscord size={11} aria-hidden="true" />@{active.discordTag}
              </span>
            )}
            <span className="ml-auto font-mono text-[0.62rem] tracking-[0.12em] text-[var(--text-ghost)]">
              {String(busyIdx).padStart(2, '0')} / {String(busy).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}