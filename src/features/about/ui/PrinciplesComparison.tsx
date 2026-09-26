'use client';

import { FiArrowRight, FiCheck, FiAlertCircle, FiMinus } from '@/shared/ui/Icon';
import { PRINCIPLES, STATS } from './data';

const BEFORE = [
  'Months of silence, then a big-bang release nobody asked for',
  'Optimizing on gut feeling — profiling never happens',
  'Clever abstractions only their author understands',
  'Handoffs with gaps that nobody owns',
] as const;

export function PrinciplesComparison() {
  return (
    <div className="mt-5">
      <div className="max-w-2xl">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--text-ghost)]">
          Before and after
        </p>
        <h3 className="mt-3 font-display text-3xl font-semibold tracking-[var(--tracking-section)] text-[var(--text)] sm:text-4xl">
          The same project, shipped two ways
        </h3>
      </div>

      <div className="mt-8 grid gap-px overflow-hidden rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--border)] md:grid-cols-[2fr_3fr]">
        <div className="bg-[var(--bg)] p-7 sm:p-8">
          <div className="flex items-center gap-2">
            <FiAlertCircle aria-hidden size={15} className="text-[var(--text-dim)]" />
            <h4 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--text-dim)]">
              The usual way
            </h4>
          </div>
          <ul className="mt-6 flex list-none flex-col gap-4 p-0">
            {BEFORE.map((item) => (
              <li
                key={item}
                className="flex gap-3 text-[0.86rem] leading-[1.6] text-[var(--text-dim)]"
              >
                <FiMinus
                  aria-hidden
                  size={15}
                  className="mt-[0.2rem] shrink-0 text-[var(--text-ghost)]"
                />
                <span className="line-through decoration-[var(--text-ghost)]/40">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-[var(--card-bg)] p-7 sm:p-8">
          <div className="flex items-center gap-2">
            <FiCheck aria-hidden size={15} className="text-[var(--accent-success)]" />
            <h4 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[var(--text)]">
              How I work
            </h4>
          </div>
          <ul className="mt-6 flex list-none flex-col gap-5 p-0">
            {PRINCIPLES.map((p) => (
              <li key={p.title} className="flex gap-3">
                <FiCheck
                  aria-hidden
                  size={15}
                  className="mt-[0.2rem] shrink-0 text-[var(--accent-success)]"
                />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="font-display text-[0.95rem] font-semibold tracking-[var(--tracking-tight)] text-[var(--text)]">
                    {p.title}
                  </span>
                  <span className="text-[0.82rem] leading-[1.6] text-[var(--text-secondary)]">
                    {p.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
        <dl className="m-0 flex flex-wrap items-baseline gap-x-8 gap-y-3">
          {STATS.map((s) => (
            <div key={s.label} className="flex items-baseline gap-2">
              <dt className="order-last text-[0.72rem] text-[var(--text-dim)]">{s.label}</dt>
              <dd className="m-0 order-first text-[0.85rem] font-semibold tracking-[var(--tracking-tight)] text-[var(--text)] tabular-nums">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>
        <a
          href="#contact"
          className="group inline-flex items-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent px-4 py-2.5 text-[0.78rem] font-semibold text-[var(--text)] no-underline transition-colors duration-200 hover:border-[var(--border-hover)] hover:bg-[var(--glass)]"
        >
          Get in touch
          <FiArrowRight
            size={14}
            aria-hidden
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          />
        </a>
      </div>
    </div>
  );
}
