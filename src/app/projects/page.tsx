'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TransitionLink } from '@/features/transitions';
import { FiArrowLeft, FiArrowRight, FiGithub } from '@/shared/ui/Icon';
import { projects } from '@/features/projects/lib/registry';
import { STATUS_META } from '@/features/projects/lib/constants';
import { ICON_MAP } from '@/entities/skill';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Project } from '@/features/projects/lib/project-repository';

gsap.registerPlugin(ScrollTrigger);

const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-[var(--accent-success)]',
  PAUSED: 'bg-[var(--accent-secondary)]',
  DEPRECATED: 'bg-white/25',
};

function ProjectRow({ project, index }: { project: Project; index: number }) {
  const router = useRouter();
  const meta = STATUS_META[project.status] || STATUS_META.ACTIVE;

  return (
    <article
      onClick={() => router.push(`/projects/${project.id}`)}
      className="pj-row group flex cursor-pointer items-baseline gap-5 border-b border-[var(--border)] py-6 transition-colors duration-200 first:border-t hover:bg-[var(--glass)] max-[700px]:gap-3"
    >
      <span className="w-8 shrink-0 font-mono text-[0.62rem] text-[var(--text-ghost)] max-[700px]:hidden">
        {String(index + 1).padStart(2, '0')}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-dim)]">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${STATUS_DOT[project.status] || STATUS_DOT.ACTIVE}`}
            />
            {meta.label}
          </span>
        </div>
        <h2 className="m-0 mt-1.5 font-display text-[1.25rem] font-semibold leading-snug tracking-[var(--tracking-tight)] text-foreground transition-transform duration-200 group-hover:translate-x-1">
          {project.title}
        </h2>
        <p className="m-0 mt-1 line-clamp-2 max-w-[68ch] text-[0.84rem] leading-[1.6] text-muted-foreground">
          {project.desc}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="inline-flex flex-wrap gap-x-3 gap-y-1">
            {project.techNames.slice(0, 5).map((t) => {
              const Icon = ICON_MAP[t];
              return (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 font-mono text-[0.62rem] text-[var(--text-ghost)]"
                >
                  {Icon && <Icon aria-hidden="true" className="text-[0.85em] opacity-70" />}
                  {t}
                </span>
              );
            })}
            {project.techNames.length > 5 && (
              <span className="font-mono text-[0.62rem] text-[var(--text-ghost)]">
                +{project.techNames.length - 5}
              </span>
            )}
          </span>
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${project.title} repository`}
              onClick={(e) => e.stopPropagation()}
              className="ml-auto inline-flex text-[var(--text-ghost)] transition-colors hover:text-foreground"
            >
              <FiGithub size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <FiArrowRight
        size={14}
        aria-hidden="true"
        className="shrink-0 self-center text-[var(--text-ghost)] opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-foreground"
      />
    </article>
  );
}

export default function ProjectsList() {
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useGSAP(
    () => {
      if (!gridRef.current) return;
      const rows = gridRef.current.querySelectorAll('.pj-row');
      if (rows.length) {
        gsap.fromTo(
          rows,
          { opacity: 0, y: 24 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: gridRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        );
      }
    },
    { scope: gridRef },
  );

  const allProjects = projects.all;
  const stats = projects.stats;

  return (
    <div className="mx-auto w-full max-w-[880px] animate-rise px-5 pb-20 pt-28 max-[700px]:pt-24">
      <header>
        <p className="m-0 font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-ghost)]">
          <TransitionLink href="/">home</TransitionLink>
          <span aria-hidden="true"> / </span>
          <span className="text-[var(--text-dim)]">projects</span>
        </p>
        <h1 className="m-0 mt-3 font-display text-[clamp(2.4rem,6vw,3.6rem)] font-bold leading-none tracking-[var(--tracking-section)] text-foreground">
          projects
        </h1>
        <p className="m-0 mt-3 max-w-[52ch] text-[0.9rem] leading-[1.65] text-muted-foreground">
          what i&apos;ve built
        </p>
        <dl className="m-0 mt-6 flex flex-wrap gap-x-6 gap-y-2">
          {[
            ['total', stats.total],
            ['active', stats.active],
            ['paused', stats.paused],
            ['archived', stats.deprecated],
          ].map(([label, value]) => (
            <div key={label} className="flex items-baseline gap-2">
              <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-[var(--text-ghost)]">
                {label}
              </dt>
              <dd className="m-0 font-display text-[1.1rem] font-semibold text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <main ref={gridRef} className="mt-8">
        {allProjects.map((project, i) => (
          <ProjectRow key={project.id} project={project} index={i} />
        ))}
      </main>

      <footer className="mt-12">
        <TransitionLink
          href="/"
          className="inline-flex items-center gap-2 font-mono text-[0.7rem] text-[var(--text-dim)] transition-colors hover:text-foreground"
        >
          <FiArrowLeft size={14} aria-hidden="true" />
          <span>back to home</span>
        </TransitionLink>
      </footer>
    </div>
  );
}
