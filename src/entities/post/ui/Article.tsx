'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Check, Cross } from '@/shared/ui/Icon';

/*  Shared article system for blog posts: reveal wrapper, headings,
    callouts, grids. The hero lives in PostPageClient (sticky).  */

export function Section({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}s` }}
      className={`transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-[14px] opacity-0'
      }`}
    >
      {children}
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function H2({ index, id, children }: { index?: string; id?: string; children: ReactNode }) {
  const autoId = id ?? (typeof children === 'string' ? slugify(children) : undefined);
  return (
    <h2
      id={autoId}
      className="m-0 flex scroll-mt-24 items-baseline gap-3 font-display text-[clamp(1.3rem,3vw,1.7rem)] font-semibold tracking-[var(--tracking-tight)] text-foreground"
    >      {index && (
        <span aria-hidden="true" className="font-mono text-[0.7rem] font-normal text-[var(--text-ghost)]">
          {index}
        </span>
      )}
      {children}
    </h2>
  );
}

export function H3({ id, children }: { id?: string; children: ReactNode }) {
  const autoId = id ?? (typeof children === 'string' ? slugify(children) : undefined);
  return (
    <h3 id={autoId} className="m-0 scroll-mt-24 font-display text-[1.05rem] font-semibold text-foreground">{children}</h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 text-[0.92rem] leading-[1.8] text-[var(--text-secondary)]">{children}</p>
  );
}

export function C({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[4px] border border-[var(--border)] bg-[var(--glass)] px-1 py-px font-mono text-[0.82em] text-[var(--text)]">
      {children}
    </code>
  );
}

type CalloutTone = 'info' | 'warn' | 'tip';

const CALLOUT_TONE: Record<CalloutTone, string> = {
  info: 'border-[var(--accent-secondary)]/40',
  warn: 'border-[var(--accent-warm)]/40',
  tip: 'border-[var(--accent-success)]/40',
};

const CALLOUT_LABEL: Record<CalloutTone, string> = {
  info: 'text-[var(--accent-secondary)]',
  warn: 'text-[var(--accent-warm)]',
  tip: 'text-[var(--accent-success)]',
};

export function Callout({ tone, label, children }: { tone: CalloutTone; label: string; children: ReactNode }) {
  return (
    <div className={`rounded-[var(--radius-md)] border border-l-2 bg-[var(--glass)] px-4 py-3 ${CALLOUT_TONE[tone]}`}>
      <p className={`m-0 font-mono text-[0.62rem] uppercase tracking-[0.14em] ${CALLOUT_LABEL[tone]}`}>
        {label}
      </p>
      <div className="mt-1.5 text-[0.86rem] leading-[1.7] text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}

export function Grid2({ children }: { children: ReactNode }) {
  return <div className="grid gap-2.5 sm:grid-cols-2">{children}</div>;
}

export function MiniCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--glass)] px-3.5 py-3">
      <p className="m-0 font-mono text-[0.72rem] font-medium text-foreground">{title}</p>
      <p className="m-0 mt-1 text-[0.78rem] leading-[1.6] text-[var(--text-dim)]">{desc}</p>
    </div>
  );
}

export function CompareCard({ title, items, variant }: { title: string; items: string[]; variant: 'before' | 'after' }) {
  const Icon = variant === 'before' ? Cross : Check;
  const tone = variant === 'before' ? 'text-[var(--accent-danger)]' : 'text-[var(--accent-success)]';
  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--glass)] px-4 py-3.5">
      <p className="m-0 flex items-center gap-2 text-[0.88rem] font-semibold text-foreground">
        <Icon size={13} aria-hidden="true" className={tone} />
        {title}
      </p>
      <ul className="m-0 mt-2.5 flex list-none flex-col gap-1.5 p-0">
        {items.map((item, i) => (
          <li key={i} className="text-[0.8rem] leading-[1.6] text-[var(--text-dim)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Article({ children }: { children: ReactNode }) {
  return <div id="post-article" className="mx-auto flex w-full max-w-[760px] flex-col gap-9">{children}</div>;
}
