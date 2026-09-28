'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { TransitionLink } from '@/features/transitions';
import { FiGithub } from '@/shared/ui/Icon';
import { Check, Code, Warning, External, ArrowLeft, ArrowRight } from '@/shared/ui/Icon';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects } from '@/features/projects/lib/registry';
import { STATUS_META } from '@/features/projects/lib/constants';
import type { Project } from '@/features/projects/lib/project-repository';
import { NavLeaf, useNav } from '@/app/providers/NavProvider';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';
import { useActivity } from '@/app/providers/ActivityProvider';

gsap.registerPlugin(ScrollTrigger);

interface ContentSection {
  id: string;
  label: string;
  type: string;
  body?: string | string[];
  items?: unknown[];
  cards?: { title: string; icon?: React.ComponentType<{ size?: number }>; body: string }[];
}

function splitParagraphs(text: string | undefined | null): string[] {
  if (!text) return [];
  return String(text)
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildDefaultSections(project: Project): ContentSection[] {
  const sections: ContentSection[] = [];

  const overviewSource = project.fullDesc || project.desc;
  if (overviewSource) {
    sections.push({
      id: 'overview',
      label: 'Overview',
      type: 'text',
      body: splitParagraphs(overviewSource),
    });
  }

  if (Array.isArray(project.stages) && project.stages.length > 0) {
    sections.push({
      id: 'stages',
      label: 'Development',
      type: 'timeline',
      items: project.stages,
    });
  }

  if (Array.isArray(project.features) && project.features.length > 0) {
    sections.push({
      id: 'features',
      label: 'Features',
      type: 'list',
      items: project.features,
    });
  }

  if (project.architecture || project.challenges) {
    sections.push({
      id: 'architecture',
      label: 'Architecture',
      type: 'cards',
      cards: [
        project.architecture
          ? { title: 'System Design', icon: Code, body: project.architecture }
          : null,
        project.challenges
          ? { title: 'Challenges', icon: Warning, body: project.challenges }
          : null,
      ].filter(Boolean) as ContentSection['cards'],
    });
  }

  if (Array.isArray(project.images) && project.images.length > 0) {
    sections.push({
      id: 'gallery',
      label: 'Gallery',
      type: 'gallery',
      items: project.images,
    });
  }

  if (project.plans) {
    sections.push({
      id: 'plans',
      label: 'Plans',
      type: 'text',
      body: splitParagraphs(project.plans),
    });
  }

  return sections;
}

function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia(`(max-width: ${breakpoint}px)`).matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

function GalleryCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const prev = useCallback(
    () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1)),
    [images.length],
  );
  const next = useCallback(
    () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1)),
    [images.length],
  );

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setFullscreen(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [prev, next]);

  const handleImgClick = isMobile ? undefined : () => setFullscreen(images[current] || images[0]);

  const mainImg = (src: string, onClick?: () => void) => (
    <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)]">
      <Image
        src={src}
        alt=""
        width={1200}
        height={800}
        sizes="(max-width: 700px) 100vw, 800px"
        className="h-auto w-full cursor-zoom-in object-cover"
        onClick={onClick}
      />
    </div>
  );

  if (images.length === 1) {
    return (
      <div>
        {mainImg(images[0], handleImgClick)}
        {!isMobile && fullscreen && (
          <div
            className="fixed inset-0 z-[1100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm lg:p-10"
            onClick={() => setFullscreen(null)}
          >
            <Image
              src={fullscreen}
              alt=""
              width={1600}
              height={1200}
              sizes="92vw"
              className="max-h-full w-auto max-w-full rounded-[var(--radius-md)] object-contain"
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="group relative">
        {mainImg(images[current], handleImgClick)}
        <button
          type="button"
          onClick={prev}
          aria-label="Previous image"
          className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-black/60 text-white opacity-0 outline-none transition-all duration-200 group-hover:opacity-100 hover:bg-black/80 focus-visible:opacity-100 max-[700px]:opacity-100"
        >
          <ArrowLeft size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next image"
          className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-black/60 text-white opacity-0 outline-none transition-all duration-200 group-hover:opacity-100 hover:bg-black/80 focus-visible:opacity-100 max-[700px]:opacity-100"
        >
          <ArrowRight size={15} aria-hidden="true" />
        </button>
        <span className="absolute right-3 bottom-3 rounded-full bg-black/60 px-2 py-0.5 font-mono text-[0.62rem] text-white/80">
          {current + 1} / {images.length}
        </span>
      </div>
      <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Image ${i + 1}`}
            aria-pressed={i === current}
            className={`relative h-[52px] w-[80px] shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-sm)] border outline-none transition-all ${
              i === current
                ? 'border-[var(--accent-secondary)]'
                : 'border-[var(--border)] opacity-55 hover:opacity-100'
            }`}
          >
            <Image src={src} alt="" width={128} height={88} className="h-full w-full object-cover" />
          </button>
        ))}
      </div>
      {!isMobile && fullscreen && (
        <div
          className="fixed inset-0 z-[1100] flex cursor-zoom-out items-center justify-center bg-black/85 p-4 backdrop-blur-sm lg:p-10"
          onClick={() => setFullscreen(null)}
        >
          <Image
            src={fullscreen}
            alt=""
            width={1600}
            height={1200}
            sizes="92vw"
            className="max-h-full w-auto max-w-full rounded-[var(--radius-md)] object-contain"
          />
        </div>
      )}
    </div>
  );
}

function renderSectionContent(section: ContentSection) {
  if (section.type === 'timeline' && Array.isArray(section.items)) {
    return (
      <div className="flex flex-col">
        {section.items.map((stage, i) => {
          const s = stage as { title: string; duration?: string; desc: string };
          const last = i === section.items!.length - 1;
          return (
            <div key={s.title || i} className="relative flex gap-4 pb-8 last:pb-0">
              {!last && (
                <span aria-hidden="true" className="absolute top-7 bottom-0 left-[7px] w-px bg-[var(--border)]" />
              )}
              <span
                aria-hidden="true"
                className="mt-1 size-[15px] shrink-0 rounded-full border-2 border-[var(--accent-secondary)] bg-[var(--bg)]"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h3 className="m-0 text-[1rem] font-semibold text-foreground">{s.title}</h3>
                  {s.duration && (
                    <span className="font-mono text-[0.62rem] text-[var(--text-ghost)]">{s.duration}</span>
                  )}
                </div>
                <p className="m-0 mt-1.5 max-w-[68ch] text-[0.86rem] leading-[1.7] text-muted-foreground">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (section.type === 'list' && Array.isArray(section.items)) {
    return (
      <ul className="m-0 grid list-none gap-x-8 gap-y-2.5 p-0 sm:grid-cols-2">
        {section.items.map((item) => (
          <li key={String(item)} className="flex items-start gap-2.5 text-[0.86rem] leading-[1.6] text-[var(--text-secondary)]">
            <Check size={14} aria-hidden="true" className="mt-1 shrink-0 text-[var(--accent-secondary)]" />
            <span>{String(item)}</span>
          </li>
        ))}
      </ul>
    );
  }

  if (section.type === 'cards' && Array.isArray(section.cards)) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {section.cards.map((card, i) => {
          const CardIcon = card.icon || Code;
          return (
            <div key={card.title || i} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-5">
              <p className="m-0 flex items-center gap-2 text-[0.9rem] font-semibold text-foreground">
                <CardIcon size={15} aria-hidden="true" className="text-[var(--accent-secondary)]" />
                {card.title}
              </p>
              <p className="m-0 mt-2 text-[0.84rem] leading-[1.7] text-muted-foreground">{card.body}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (section.type === 'gallery' && Array.isArray(section.items)) {
    return <GalleryCarousel images={section.items as string[]} />;
  }

  if (section.type === 'text') {
    return (
      <div className="flex max-w-[68ch] flex-col gap-4">
        {splitParagraphs(
          Array.isArray(section.body) ? section.body.join('\n\n') : section.body,
        ).map((paragraph, i) => (
          <p key={i} className="m-0 text-[0.92rem] leading-[1.8] text-[var(--text-secondary)]">
            {paragraph}
          </p>
        ))}
      </div>
    );
  }

  return null;
}

const STATUS_DOT: Record<string, string> = {
  ACTIVE: 'bg-[var(--accent-success)]',
  PAUSED: 'bg-[var(--accent-secondary)]',
  DEPRECATED: 'bg-white/25',
};

export default function ProjectPageClient({ params: _params }: { params: Promise<{ id: string }> }) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const project = projects.get(id);
  const { setPageConfig, setActiveSection, active } = useNav();
  const { incrementProjectsViewed } = useActivity();
  const heroRef = useRef<HTMLHeadElement>(null);
  const heroInnerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    incrementProjectsViewed();
  }, [id, incrementProjectsViewed]);

  useEffect(() => {
    if (!project) router.replace('/');
  }, [project, router]);

  const meta = project ? STATUS_META[project.status] || STATUS_META.ACTIVE : null;
  const allProjects = projects.all;
  const currentIndex = project ? allProjects.findIndex(p => p.id === id) : -1;
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject =
    project && currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;
  const contentSections: ContentSection[] = useMemo(
    () =>
      project
        ? Array.isArray(project.sections) && project.sections.length > 0
          ? (project.sections as ContentSection[])
          : buildDefaultSections(project)
        : [],
    [project],
  );

  const links: { label: string; url: string }[] = [];
  if (project?.url && project.url !== '#') {
    links.push({ label: 'Live Site', url: project.url });
  }
  if (project?.repo) {
    links.push({ label: 'Source Code', url: project.repo });
  }

  // Configure GlobalNav — set once per projects
  useEffect(() => {
    if (!project || contentSections.length === 0) return;

    const contextItems: NavLeaf[] = contentSections.map((s) => ({
      id: s.id,
      label: s.label,
      type: 'section' as const,
      targetId: s.id,
    }));

    const onSectionClick = (sectionId: string) => {
      scrollToTarget(`#section-${sectionId}`);
    };

    setPageConfig({
      contextItems,
      onSectionClick,
      pagination: {
        prev: prevProject
          ? {
              label: prevProject.id,
              href: `/project/${prevProject.id}`,
              onClick: () => router.push(`/project/${prevProject.id}`),
            }
          : undefined,
        next: nextProject
          ? {
              label: nextProject.id,
              href: `/project/${nextProject.id}`,
              onClick: () => router.push(`/project/${nextProject.id}`),
            }
          : undefined,
      },
    });
  }, [project, contentSections, prevProject, nextProject, router, setPageConfig]);

  useEffect(() => {
    if (!project) return;
    const observers = contentSections.map((section) => {      const el = document.getElementById(`section-${section.id}`);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section.id);
        },
        { threshold: 0.3 },
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [contentSections, project, setActiveSection]);

  // Hero gets covered by the content card: inner copy drifts up + fades.
  // Kept shallow so the title stays readable while it slides away.
  useGSAP(() => {
    const inner = heroInnerRef.current;
    const hero = heroRef.current;
    if (!inner || !hero || !project) return;
    const tween = gsap.to(inner, {
      yPercent: -8,
      opacity: 0.6,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [id, project]);

  if (!project) return null;

  return (
    <div className="-mt-11 w-full animate-rise pb-20">
      {/* Hero — sticky, pulled under the navbar, content slides over.
          -top-11 (not top-0): the border rests above the viewport, so no
          gap can ever open between navbar and hero, resting or stuck. */}
      <header ref={heroRef} className="sticky -top-11 z-[1] flex h-[78vh] min-h-[520px] items-end overflow-hidden border-b border-[var(--border)] will-change-transform">
        {(project.video || project.image) && (
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
            {project.video ? (
              <video
                src={project.video}
                className="h-full w-full scale-110 object-cover blur-[20px] saturate-[1.2]"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <Image
                src={project.image!}
                alt=""
                fill
                sizes="100vw"
                className="scale-110 object-cover blur-[20px] saturate-[1.2]"
                priority
              />
            )}
            <div className="absolute inset-0 bg-[var(--bg)] opacity-65" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_bottom,transparent,var(--bg))]" />
          </div>
        )}
        <div ref={heroInnerRef} className="relative mx-auto w-full max-w-[1200px] px-8 pt-24 pb-16 will-change-[transform,opacity] max-[700px]:px-5 max-[700px]:py-10">
          <p className="m-0 font-mono text-[0.62rem] tracking-[0.1em] text-[var(--text-ghost)]">
            <TransitionLink href="/">home</TransitionLink>
            <span aria-hidden="true"> / </span>
            <TransitionLink href="/#projects">projects</TransitionLink>
            <span aria-hidden="true"> / </span>
            <span className="text-[var(--text-dim)]">{project.id}</span>
          </p>
          <h1 className="m-0 mt-4 max-w-[16ch] font-display text-[clamp(2.2rem,5.5vw,3.8rem)] font-bold leading-[1.03] tracking-[var(--tracking-section)] text-[var(--text)]">
            {project.title}
          </h1>
          <p className="m-0 mt-3 max-w-[60ch] text-[0.95rem] leading-[1.65] text-[var(--text-secondary)]">
            {project.desc}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.64rem] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
              <span
                aria-hidden="true"
                className={`size-1.5 rounded-full ${STATUS_DOT[project.status] || STATUS_DOT.ACTIVE}`}
              />
              {meta!.label}
            </span>
            <span className="font-mono text-[0.64rem] tracking-[0.1em] text-[var(--text-ghost)]">
              {String(currentIndex + 1).padStart(2, '0')} / {String(allProjects.length).padStart(2, '0')}
            </span>
            <span className="flex gap-2 max-[700px]:w-full">
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-sm)] bg-[var(--text)] px-3 py-1.5 font-mono text-[0.68rem] font-medium text-[var(--bg)] no-underline transition-opacity hover:opacity-85"
                >
                  {link.label === 'Source Code' ? (
                    <FiGithub size={13} aria-hidden="true" />
                  ) : (
                    <External size={13} aria-hidden="true" />
                  )}
                  {link.label}
                </a>
              ))}
            </span>
          </div>
        </div>
      </header>

      {/* Content + big sidebar — overlapping card over the hero.
          NOTE: no items-start here — the aside must stretch full height,
          otherwise its sticky rail has zero travel range. */}
      <div className="relative z-[2] -mt-6 rounded-t-[24px] border-t border-[var(--border)] bg-[var(--bg)]">
      <div className="mx-auto grid w-full max-w-[1200px] gap-10 px-5 pt-10 [grid-template-columns:minmax(0,1fr)_320px] max-[1024px]:grid-cols-1 max-[700px]:px-4">
        <main className="flex min-w-0 flex-col gap-12">
          {contentSections.map((section, index) => (
            <section key={section.id} id={`section-${section.id}`} className="scroll-mt-24">
              <div className="flex items-baseline gap-3 border-b border-[var(--border)] pb-3">
                <span className="font-mono text-[0.62rem] text-[var(--text-ghost)]">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className="m-0 font-display text-[1.5rem] font-semibold tracking-[var(--tracking-tight)] text-foreground">
                  {section.label}
                </h2>
              </div>
              <div className="pt-5">{renderSectionContent(section)}</div>
            </section>
          ))}

          {/* Prev / next */}
          <nav aria-label="More projects" className="grid gap-3 border-t border-[var(--border)] pt-6 sm:grid-cols-2">
            {prevProject ? (
              <button
                type="button"
                onClick={() => router.push(`/projects/${prevProject.id}`)}
                className="group flex cursor-pointer flex-col gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-transparent p-4 text-left transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--glass)]"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">
                  <ArrowLeft size={12} aria-hidden="true" /> prev
                </span>
                <span className="font-display text-[1rem] font-semibold text-foreground">
                  {prevProject.title}
                </span>
              </button>
            ) : <span aria-hidden="true" />}
            {nextProject ? (
              <button
                type="button"
                onClick={() => router.push(`/projects/${nextProject.id}`)}
                className="group flex cursor-pointer flex-col items-end gap-1 rounded-[var(--radius-md)] border border-[var(--border)] bg-transparent p-4 text-right transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--glass)]"
              >
                <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-[var(--text-ghost)]">
                  next <ArrowRight size={12} aria-hidden="true" />
                </span>
                <span className="font-display text-[1rem] font-semibold text-foreground">
                  {nextProject.title}
                </span>
              </button>
            ) : <span aria-hidden="true" />}
          </nav>
        </main>

        {/* Right sidebar — 320px sticky rail with its own scroll
            for short viewports. */}
        <aside className="max-[1024px]:hidden">
          <div className="sticky top-24 flex max-h-[calc(100vh-7rem)] flex-col gap-3 overflow-y-auto overscroll-contain pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <nav
              aria-label="On this page"
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-3"
            >
              <p className="m-0 px-2 pb-1.5 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
                on this page
              </p>
              <div className="flex flex-col gap-0.5">
                {contentSections.map((s, i) => {
                  const isActive = active.sectionId === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => scrollToTarget(`#section-${s.id}`)}
                      aria-current={isActive || undefined}
                      className={`flex w-full cursor-pointer items-baseline gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-left transition-colors ${
                        isActive
                          ? 'bg-[var(--glass-hover)] text-foreground'
                          : 'text-[var(--text-dim)] hover:bg-[var(--glass)] hover:text-foreground'
                      }`}
                    >
                      <span
                        className={`font-mono text-[0.6rem] ${isActive ? 'text-[var(--accent-secondary)]' : 'text-[var(--text-ghost)]'}`}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate text-[0.82rem]">{s.label}</span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <p className="m-0 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
                status
              </p>
              <p className="m-0 mt-2.5 inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                <span
                  aria-hidden="true"
                  className={`size-1.5 rounded-full ${STATUS_DOT[project.status] || STATUS_DOT.ACTIVE}`}
                />
                {meta!.label}
              </p>
              <p className="m-0 mt-1.5 font-mono text-[0.64rem] text-[var(--text-ghost)]">
                {String(currentIndex + 1).padStart(2, '0')} / {String(allProjects.length).padStart(2, '0')} projects
              </p>
            </div>

            <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--bg-elevated)] p-4">
              <p className="m-0 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-[var(--text-ghost)]">
                stack · {project.techNames.length}
              </p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {project.techNames.map((t) => (
                  <span
                    key={t}
                    className="rounded-[var(--radius-sm)] border border-[var(--border)] px-2 py-1 font-mono text-[0.62rem] text-[var(--text-dim)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {links.length > 0 && (
              <div className="flex flex-col gap-2">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)] px-3 py-2 font-mono text-[0.68rem] text-[var(--text-secondary)] no-underline transition-colors hover:border-[var(--border-hover)] hover:text-foreground"
                  >
                    {link.label === 'Source Code' ? (
                      <FiGithub size={13} aria-hidden="true" />
                    ) : (
                      <External size={13} aria-hidden="true" />
                    )}
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
      </div>
    </div>
  );
}
