'use client';

import { useMemo, useState } from 'react';
import { useInView } from '@/shared/hooks/useInView';
import { PiStarFill, FiTwitter, FiLinkedin, FiInstagram, FiGithub } from '@/shared/ui/atoms/Icon';

/*  Static testimonials (Firebase removed)  */

interface Endorsement {
  id: string;
  name: string;
  role: string;
  rating: number;
  text: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
  };
}

const ENDORSEMENTS: Endorsement[] = [
  {
    id: 'chadrack',
    name: 'Chadrack',
    role: 'director of photography',
    rating: 5,
    text: 'Needed a portfolio that could sell frames as confidently as the filmic work they document. What shipped reads less like a website and more like a reel you can scroll. Detail-obsessed from 1440px down to mobile.',
    social: { twitter: 'https://twitter.com', linkedin: 'https://linkedin.com' },
  },
  {
    id: 'mak',
    name: 'Mak VieSAinte',
    role: 'founder',
    rating: 5,
    text: 'Fast, opinionated, zero hand-holding. Every build came back better than the brief — one conversation became a full design system, and the deadline never slipped once.',
  },
  {
    id: 'osiris',
    name: 'Osiris Balonga',
    role: 'lead front-end',
    rating: 5,
    text: 'Rare to hand over a codebase that feels cleaner than your own. Typography, motion, keyboard paths — all thought through. I stole three patterns from this for our own product.',
    social: { github: 'https://github.com', linkedin: 'https://linkedin.com' },
  },
  {
    id: 'jacques',
    name: 'Jacques',
    role: 'product owner',
    rating: 5,
    text: 'We keep coming back because the work survives contact with real users. Direction shifts mid-project? Absorbed without drama. That is the whole job, and it was handled.',
    social: { linkedin: 'https://linkedin.com' },
  },
  {
    id: 'riche',
    name: 'Riche Makso',
    role: 'cto · product designer',
    rating: 5,
    text: 'The rare person who moves between engineering and product cleanly. Specs arrived tight, craftsmanship even tighter, and every deliverable had the why attached. Hire without hesitation.',
    social: { twitter: 'https://twitter.com', github: 'https://github.com' },
  },
  {
    id: 'jemima',
    name: 'Jemima',
    role: 'make-up artiste',
    rating: 5,
    text: 'Didn’t need to understand the tech — just knew it felt like the work would never embarrass us. It didn’t. Clients saw the site and assumed the team was twice our size.',
    social: { instagram: 'https://instagram.com' },
  },
];

/*  Small pieces ── */

function Stars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, s) => (
        <PiStarFill
          key={s}
          size={size}
          className={s < rating ? 'text-[var(--accent-warm)]' : 'text-border'}
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
  const size = index % 3 === 1 ? 'h-[178px] w-[168px] max-[640px]:h-[118px] max-[640px]:w-[110px]'
    : index % 3 === 2 ? 'h-[168px] w-[158px] max-[640px]:h-[111px] max-[640px]:w-[103px]'
      : 'h-[158px] w-[148px] max-[640px]:h-[104px] max-[640px]:w-[96px]';

  return (
    <button
      type="button"
      onMouseEnter={() => onHover(e.id)}
      onFocus={() => onHover(e.id)}
      aria-label={e.name}
      className={`relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-lg)] bg-[#101010] p-0 transition-all duration-300 focus-visible:[outline:1px_solid_var(--accent-secondary)] focus-visible:outline-offset-3 ${size} ${
        active ? '-translate-y-0.5 border border-[var(--accent-secondary)]' : 'border border-[#101010]'
      }`}
    >
      <span className="font-display text-[clamp(1.2rem,2.2vw,1.7rem)] font-bold tracking-[-0.02em] text-white max-[640px]:text-[1.05rem]">
        {initialsOf(e.name)}
      </span>
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
    <button
      type="button"
      className={`group flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border-none bg-transparent p-[0.55rem_0.4rem] text-left transition-colors duration-200 hover:bg-[var(--glass)] focus-visible:[outline:1px_solid_var(--accent-secondary)] focus-visible:outline-offset-2`}
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
        aria-hidden="true"
        className={`pointer-events-none ml-auto inline-flex gap-[0.4rem] text-[var(--text-ghost)] transition-all duration-200 ${
          active
            ? 'translate-x-0 opacity-100'
            : '-translate-x-1.5 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100'
        }`}
      >
        {e.social?.twitter && <FiTwitter size={11} />}
        {e.social?.linkedin && <FiLinkedin size={11} />}
        {e.social?.instagram && <FiInstagram size={11} />}
        {e.social?.github && <FiGithub size={11} />}
      </span>
    </button>
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
            Testimonials
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
          {/*  Photo grid ─ 3 offset columns  */}
          <div className="flex items-start gap-3 pb-2 max-[1100px]:w-full max-[1100px]:overflow-x-auto" role="listbox" aria-label="People">
            <div className="flex flex-col gap-3">
              {ENDORSEMENTS.map((e, i) => (i % 3 === 0 ? (
                <Tile key={e.id} e={e} index={i} active={e.id === activeId} onHover={setActiveId} />
              ) : null))}
            </div>
            <div className="flex flex-col gap-3 max-[1100px]:mt-8 mt-13">
              {ENDORSEMENTS.map((e, i) => (i % 3 === 1 ? (
                <Tile key={e.id} e={e} index={i} active={e.id === activeId} onHover={setActiveId} />
              ) : null))}
            </div>
            <div className="flex flex-col gap-3 max-[1100px]:mt-4 mt-6">
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
            <span className="text-[var(--text-ghost)]">· {active.role}</span>
            <span className="ml-auto font-mono text-[0.62rem] tracking-[0.12em] text-[var(--text-ghost)]">
              {String(busyIdx).padStart(2, '0')} / {String(busy).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}