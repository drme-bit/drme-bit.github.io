export default function ProjectsHero({ count }: { count: number }) {
  return (
    <header className="grid items-end gap-6 border-b border-[var(--border)] pb-8 md:gap-10 md:pb-10 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.55fr)]">
      <div>
        <p className="mb-4 text-[0.82rem] font-medium text-[var(--text-dim)]">Selected work</p>
        <h2
          id="projects-heading"
          className="m-0 max-w-[15ch] font-display text-[clamp(2.8rem,7vw,6rem)] font-semibold leading-[0.96] tracking-[-0.075em] text-[var(--text)]"
        >
          Built to be used.
        </h2>
      </div>
      <div className="flex items-end justify-between gap-6 lg:pb-1">
        <p className="m-0 max-w-[38ch] text-[0.92rem] leading-[1.7] text-[var(--text-secondary)]">
          A selection of products, tools, and game systems shaped by real use.
        </p>
        <span className="shrink-0 font-mono text-[0.72rem] tabular-nums text-[var(--text-ghost)]">
          {String(count).padStart(2, '0')} projects
        </span>
      </div>
    </header>
  );
}
