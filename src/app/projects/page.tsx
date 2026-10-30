import { projects } from '@/features/projects/lib/registry';
import { ProjectsList } from '@/features/projects/ui/Projects';
import { TransitionLink } from '@/features/transitions';

export default function ProjectsPage() {
  const { total, active, paused, deprecated } = projects.stats;

  return (
    <main className="mx-auto w-full max-w-[1440px] px-[clamp(1.25rem,5vw,5rem)] pb-16 pt-32 max-[700px]:pt-24">
      <header className="grid items-end gap-8 border-b border-[var(--border)] pb-10 md:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] md:gap-12 md:pb-14">
        <div>
          <p className="m-0 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
            <TransitionLink href="/" className="transition-colors hover:text-[var(--text)]">Home</TransitionLink>
            <span aria-hidden="true"> / </span> Work
          </p>
          <h1 className="mb-0 mt-5 max-w-[10ch] font-display text-[clamp(3.25rem,9vw,8rem)] font-semibold leading-[0.88] tracking-[-0.075em] text-[var(--text)]">
            Selected<br />work<span className="text-[var(--accent-secondary)]">.</span>
          </h1>
        </div>
        <div className="flex flex-col items-start gap-6 md:items-end md:text-right">
          <p className="m-0 max-w-[42ch] text-[1rem] leading-[1.75] text-[var(--text-secondary)]">
            Products, tools, and game systems built around real people and real use.
          </p>
          <dl className="m-0 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.65rem] uppercase tracking-[0.1em] text-[var(--text-ghost)] md:justify-end">
            <div className="flex gap-1.5"><dt>Projects</dt><dd className="m-0 text-[var(--text)]">{String(total).padStart(2, '0')}</dd></div>
            <div className="flex gap-1.5"><dt>Active</dt><dd className="m-0 text-[var(--text)]">{active}</dd></div>
            <div className="flex gap-1.5"><dt>In progress</dt><dd className="m-0 text-[var(--text)]">{paused}</dd></div>
            <div className="flex gap-1.5"><dt>Archived</dt><dd className="m-0 text-[var(--text)]">{deprecated}</dd></div>
          </dl>
        </div>
      </header>

      <div className="mt-2">
        <ProjectsList />
      </div>

    </main>
  );
}
