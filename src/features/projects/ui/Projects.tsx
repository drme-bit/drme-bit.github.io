'use client';

import Image from 'next/image';
import { FiArrowUpRight, FiExternalLink, FiGithub } from '@/shared/ui/Icon';
import { TransitionLink } from '@/features/transitions';
import { Blog } from '@/features/blog/ui/Blog';
import { projects } from '../lib/registry';
import { STATUS_META } from '../lib/constants';
import type { Project } from '../lib/project-repository';
import ProjectsHero from './ProjectsHero';

const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-[var(--accent-success)]',
  PAUSED: 'bg-[var(--text-dim)]',
  DEPRECATED: 'bg-[var(--text-ghost)]',
};

function ProjectGallery({ title, images, priority }: { title: string; images: string[]; priority: boolean }) {
  const visibleImages = images.slice(0, 3);
  const hasSideImages = visibleImages.length > 1;

  if (visibleImages.length === 0) return null;

  return (
    <div
      className={`grid aspect-[1.45] gap-2 max-[900px]:aspect-[1.35] max-[560px]:aspect-[1.1] ${
        hasSideImages ? 'grid-cols-[minmax(0,1.35fr)_minmax(0,0.75fr)] grid-rows-2' : 'grid-cols-1'
      }`}
    >
      {visibleImages.map((src, index) => {
        const spansRows = hasSideImages && (index === 0 || visibleImages.length === 2);
        return (
          <figure
            key={src}
            className={`group/image relative m-0 min-h-0 min-w-0 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)] ${
              spansRows ? 'row-span-2' : ''
            }`}
          >
            <Image
              src={src}
              alt={`${title} — screen ${index + 1}`}
              fill
              sizes="(max-width: 900px) 92vw, 58vw"
              priority={priority && index === 0}
              className="object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.035] motion-reduce:transition-none"
            />
          </figure>
        );
      })}
    </div>
  );
}

function ProjectStory({ project, index, total }: { project: Project; index: number; total: number }) {
  const status = STATUS_META[project.status] ?? STATUS_META.ACTIVE;
  const images = project.images.length > 0 ? project.images : project.image ? [project.image] : [];
  const isReversed = index % 2 === 1;

  return (
    <article className="grid gap-8 border-t border-[var(--border)] py-10 md:gap-10 md:py-14 lg:grid-cols-[minmax(250px,0.78fr)_minmax(0,1.22fr)] lg:items-center lg:gap-14">
      <div className={`flex min-w-0 flex-col items-start ${isReversed ? 'lg:order-2' : ''}`}>
        <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-[0.76rem] text-[var(--text-dim)]">
          <span className="font-mono tabular-nums text-[var(--text-ghost)]">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="inline-flex items-center gap-2">
            <span className={`size-1.5 rounded-full ${STATUS_DOT[project.status] ?? STATUS_DOT.ACTIVE}`} aria-hidden="true" />
            {status.label}
          </span>
        </div>

        <h3 className="m-0 max-w-[18ch] font-display text-[clamp(1.7rem,3.2vw,2.65rem)] font-medium leading-[1.08] tracking-[var(--tracking-tight)] text-[var(--text)]">
          {project.title}
        </h3>
        <p className="mb-0 mt-4 max-w-[54ch] text-[0.94rem] leading-[1.75] text-[var(--text-secondary)]">
          {project.desc}
        </p>

        {project.features.length > 0 && (
          <ul className="mb-0 mt-5 flex list-none flex-col gap-2 p-0 text-[0.82rem] leading-[1.55] text-[var(--text-dim)]">
            {project.features.slice(0, 2).map((feature) => (
              <li key={feature} className="flex gap-2.5">
                <span className="mt-[0.55em] size-1 shrink-0 rounded-full bg-[var(--accent-secondary)]" aria-hidden="true" />
                {feature}
              </li>
            ))}
          </ul>
        )}

        <p className="mb-0 mt-5 text-[0.76rem] leading-[1.6] text-[var(--text-ghost)]">
          {project.techSkills.slice(0, 5).map((skill) => skill.name).join('  ·  ')}
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-t border-[var(--border)] pt-4 text-[0.82rem]">
          <TransitionLink
            href={`/projects/${project.id}`}
            className="inline-flex items-center gap-1.5 font-medium text-[var(--text)] underline decoration-[color-mix(in_srgb,var(--text)_30%,transparent)] underline-offset-4 transition-colors hover:decoration-[var(--accent-secondary)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-secondary)]"
          >
            Read the case study
            <FiArrowUpRight size={14} aria-hidden="true" />
          </TransitionLink>
          {project.url && project.url !== '#' && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--text-dim)] underline decoration-[color-mix(in_srgb,var(--text)_20%,transparent)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:decoration-[var(--text)]"
            >
              Live project <FiExternalLink size={13} aria-hidden="true" />
            </a>
          )}
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[var(--text-dim)] underline decoration-[color-mix(in_srgb,var(--text)_20%,transparent)] underline-offset-4 transition-colors hover:text-[var(--text)] hover:decoration-[var(--text)]"
            >
              Source <FiGithub size={13} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>

      <div className={isReversed ? 'lg:order-1' : ''}>
        <ProjectGallery title={project.title} images={images} priority={index === 0} />
      </div>
    </article>
  );
}

export function ProjectsList() {
  const allProjects = projects.all;

  return (
    <div>
      {allProjects.map((project, index) => (
        <ProjectStory key={project.id} project={project} index={index} total={allProjects.length} />
      ))}
    </div>
  );
}

export function Projects() {
  const allProjects = projects.all;

  return (
    <div className="relative w-full">
      <section className="w-full px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-20" aria-labelledby="projects-heading">
        <div className="mx-auto w-full max-w-[1320px]">
          <ProjectsHero count={allProjects.length} />
          <ProjectsList />
        </div>
      </section>
      <Blog />
    </div>
  );
}
