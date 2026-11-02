import { FiCheck } from '@/shared/ui/Icon';
import { PRINCIPLES } from './data';

export function PrinciplesComparison() {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-x-12 p-0 sm:grid-cols-2">
      {PRINCIPLES.map((principle) => (
        <li
          key={principle.title}
          className="flex gap-3 border-t border-[var(--border)] py-5"
        >
          <FiCheck
            aria-hidden="true"
            size={16}
            className="mt-1 shrink-0 text-[var(--accent-success)]"
          />
          <span className="flex min-w-0 flex-col gap-1">
            <span className="font-display text-[1rem] font-medium tracking-[var(--tracking-tight)] text-[var(--text)]">
              {principle.title}
            </span>
            <span className="text-[0.86rem] leading-[1.65] text-[var(--text-secondary)]">
              {principle.desc}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
