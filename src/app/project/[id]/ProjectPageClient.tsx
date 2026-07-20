'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiHome,
  FiChevronLeft,
  FiChevronRight,
  FiGithub,
  FiExternalLink,
  FiCheck,
  FiCode,
  FiAlertCircle,
} from 'react-icons/fi';
import { getProjectById, getProjectIndex, PROJECTS } from '@/data/projectsData';
import styles from './ProjectPage.module.scss';

interface Project {
  id: string;
  title: string;
  url?: string;
  repo?: string;
  desc: string;
  fullDesc?: string;
  tech: string[];
  status: string;
  image?: string | null;
  images?: string[];
  video?: string | null;
  stages?: { title: string; duration?: string; desc: string }[];
  features?: string[];
  architecture?: string;
  challenges?: string;
  plans?: string;
  sections?: ContentSection[];
  [key: string]: unknown;
}

interface ContentSection {
  id: string;
  label: string;
  type: string;
  body?: string | string[];
  items?: unknown[];
  cards?: { title: string; icon?: React.ComponentType<{ size?: number }>; body: string }[];
}

const STATUS_META: Record<string, { icon: string; cls: string; label: string }> = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

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
          ? { title: 'System Design', icon: FiCode, body: project.architecture }
          : null,
        project.challenges
          ? { title: 'Challenges', icon: FiAlertCircle, body: project.challenges }
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
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

function GalleryCarousel({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setFullscreen(null);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  const handleImgClick = isMobile ? undefined : () => setFullscreen(images[current] || images[0]);

  if (images.length === 1) {
    return (
      <div className={styles['pp-gallery']}>
        <div className={styles['pp-gallery-main']}>
          <img
            src={images[0]}
            alt=""
            className={styles['pp-gallery-img']}
            onClick={isMobile ? undefined : () => setFullscreen(images[0])}
          />
        </div>
        {!isMobile && fullscreen && (
          <div className={styles['pp-gallery-fullscreen']} onClick={() => setFullscreen(null)}>
            <img src={fullscreen} alt="" className={styles['pp-gallery-fullscreen-img']} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles['pp-gallery']}>
      <div className={styles['pp-gallery-main']}>
        <button
          className={`${styles['pp-gallery-zone']} ${styles['pp-gallery-zone--prev']}`}
          onClick={prev}
          aria-label="Previous"
        >
          <span className={styles['pp-gallery-zone-shadow']} />
        </button>
        <img
          src={images[current]}
          alt=""
          className={styles['pp-gallery-img']}
          onClick={handleImgClick}
        />
        <button
          className={`${styles['pp-gallery-zone']} ${styles['pp-gallery-zone--next']}`}
          onClick={next}
          aria-label="Next"
        >
          <span className={styles['pp-gallery-zone-shadow']} />
        </button>
      </div>
      <div className={styles['pp-gallery-thumbs']}>
        {images.map((src, i) => (
          <button
            key={i}
            className={`${styles['pp-gallery-thumb']}${i === current ? ` ${styles['is-active']}` : ''}`}
            onClick={() => setCurrent(i)}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
      {!isMobile && fullscreen && (
        <div className={styles['pp-gallery-fullscreen']} onClick={() => setFullscreen(null)}>
          <img src={fullscreen} alt="" className={styles['pp-gallery-fullscreen-img']} />
        </div>
      )}
    </div>
  );
}

function renderSectionContent(section: ContentSection) {
  if (section.type === 'timeline' && Array.isArray(section.items)) {
    return (
      <div className={styles['pp-stages']}>
        {section.items.map((stage, i) => {
          const s = stage as { title: string; duration?: string; desc: string };
          return (
            <div key={s.title || i} className={styles['pp-stage']}>
              <div className={styles['pp-stage-marker']}>
                <span className={styles['pp-stage-num']}>{String(i + 1).padStart(2, '0')}</span>
                {i < section.items!.length - 1 && <div className={styles['pp-stage-line']} />}
              </div>
              <div className={styles['pp-stage-content']}>
                <div className={styles['pp-stage-head']}>
                  <h3 className={styles['pp-stage-title']}>{s.title}</h3>
                  {s.duration && (
                    <span className={styles['pp-stage-duration']}>{s.duration}</span>
                  )}
                </div>
                <p className={styles['pp-stage-desc']}>{s.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (section.type === 'list' && Array.isArray(section.items)) {
    return (
      <div className={styles['pp-features']}>
        {section.items.map((item, i) => (
          <div key={String(item)} className={styles['pp-feature-item']}>
            <FiCheck size={14} className={styles['pp-feature-check']} />
            <span>{String(item)}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'cards' && Array.isArray(section.cards)) {
    return (
      <div className={styles['pp-arch-cards']}>
        {section.cards.map((card, i) => {
          const CardIcon = card.icon || FiCode;
          return (
            <div key={card.title || i} className={styles['pp-arch-card']}>
              <div className={styles['pp-arch-card-head']}>
                <CardIcon size={14} />
                {card.title}
              </div>
              <p className={styles['pp-arch-text']}>{card.body}</p>
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
      <div className={styles['pp-content-body']}>
        {splitParagraphs(
          Array.isArray(section.body) ? section.body.join('\n\n') : section.body,
        ).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return null;
}

export default function ProjectPageClient({ params }: { params: Promise<{ id: string }> }) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const project = getProjectById(id) as Project | undefined;
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!project) router.replace('/');
  }, [project, router]);

  const meta = project ? STATUS_META[project.status] || STATUS_META.ARCHIVED : null;
  const currentIndex = project ? getProjectIndex(id) : -1;
  const prevProject = currentIndex > 0 ? PROJECTS[currentIndex - 1] : null;
  const nextProject =
    project && currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : null;
  const contentSections: ContentSection[] = project
    ? Array.isArray(project.sections) && project.sections.length > 0
      ? (project.sections as ContentSection[])
      : buildDefaultSections(project)
    : [];

  const links: { label: string; url: string }[] = [];
  if (project?.url && project.url !== '#') {
    links.push({ label: 'Live Site', url: project.url });
  }
  if (project?.repo) {
    links.push({ label: 'Source Code', url: project.repo });
  }

  useEffect(() => {
    if (!project) return;
    const observers = contentSections.map((section) => {
      const el = document.getElementById(`section-${section.id}`);
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
  }, [contentSections, project]);

  if (!project) return null;

  return (
    <div className={styles['project-page']}>
      {/* Top Nav */}
      <nav className={styles['pp-nav']}>
        <Link href="/" className={styles['pp-nav-home']}>
          <FiHome size={12} />
        </Link>
        <div className={styles['pp-nav-divider']} />
        <div className={styles['pp-nav-sections']}>
          {contentSections.map((s) => (
            <button
              key={s.id}
              className={`${styles['pp-nav-link']}${activeSection === s.id ? ` ${styles['is-active']}` : ''}`}
              onClick={() =>
                document.getElementById(`section-${s.id}`)?.scrollIntoView()
              }
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className={styles['pp-nav-divider']} />
        <div className={styles['pp-nav-arrows']}>
          {prevProject && (
            <Link href={`/project/${prevProject.id}`} className={styles['pp-nav-arrow']}>
              <FiChevronLeft size={14} />
            </Link>
          )}
          {nextProject && (
            <Link href={`/project/${nextProject.id}`} className={styles['pp-nav-arrow']}>
              <FiChevronRight size={14} />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className={styles['pp-hero']}>
        {(project.video || project.image) && (
          <div className={styles['pp-hero-bg']}>
            {project.video ? (
              <video
                src={project.video}
                className={styles['pp-hero-bg-video']}
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img src={project.image!} alt="" className={styles['pp-hero-bg-img']} />
            )}
            <div className={styles['pp-hero-bg-overlay']} />
            <div className={styles['pp-hero-bg-fade']} />
          </div>
        )}
        <div className={styles['pp-hero-inner']}>
          <div className={styles['pp-hero-breadcrumb']}>
            <Link href="/">home</Link>
            <span>/</span>
            <Link href="/#projects">projects</Link>
            <span>/</span>
            <span className={styles['pp-hero-bc-current']}>{project.id}</span>
          </div>
          <h1 className={styles['pp-hero-title']}>{project.title}</h1>
          <p className={styles['pp-hero-desc']}>{project.desc}</p>
          <div className={styles['pp-hero-meta']}>
            <span className={`${styles['pp-hero-status']} ${styles[meta!.cls]}`}>
              {meta!.icon} {meta!.label}
            </span>
            <span className={styles['pp-hero-counter']}>
              {String(currentIndex + 1).padStart(2, '0')} /{' '}
              {String(PROJECTS.length).padStart(2, '0')}
            </span>
          </div>
          <div className={styles['pp-hero-actions']}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['pp-btn']}
              >
                {link.label === 'Source Code' ? (
                  <FiGithub size={14} />
                ) : (
                  <FiExternalLink size={14} />
                )}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className={styles['pp-content']}>
        {/* Main Content */}
        <main className={styles['pp-main']}>
          {contentSections.map((section, index) => (
            <section
              key={section.id}
              id={`section-${section.id}`}
              className={styles['pp-section']}
            >
              <div className={styles['pp-section-header']}>
                <span className={styles['pp-section-number']}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h2 className={styles['pp-section-title']}>{section.label}</h2>
              </div>
              {renderSectionContent(section)}
            </section>
          ))}
        </main>

        {/* Right Sidebar */}
        <aside className={styles['pp-right-sidebar']}>
          <div className={styles['pp-right-sidebar-sticky']}>
            {/* Links */}
            {links.length > 0 && (
              <div className={styles['pp-right-section']}>
                <span className={styles['pp-right-label']}>Links</span>
                <div className={styles['pp-right-links']}>
                  {links.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles['pp-right-link']}
                    >
                      {link.label === 'Source Code' ? (
                        <FiGithub size={12} />
                      ) : (
                        <FiExternalLink size={12} />
                      )}
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className={styles['pp-right-section']}>
              <span className={styles['pp-right-label']}>Status</span>
              <span className={`${styles['pp-right-status']} ${styles[meta!.cls]}`}>
                {meta!.icon} {meta!.label}
              </span>
              <span className={styles['pp-right-counter']}>
                {String(currentIndex + 1).padStart(2, '0')} /{' '}
                {String(PROJECTS.length).padStart(2, '0')}
              </span>
            </div>

            {/* Stack */}
            <div className={styles['pp-right-section']}>
              <span className={styles['pp-right-label']}>Stack</span>
              <div className={styles['pp-right-stack']}>
                {project.tech.map((t) => (
                  <span key={t} className={styles['pp-right-tag']}>
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className={styles['pp-right-section']}>
              <span className={styles['pp-right-label']}>Sections</span>
              <nav className={styles['pp-right-nav']}>
                {contentSections.map((s) => (
                  <button
                    key={s.id}
                    className={`${styles['pp-right-nav-link']}${activeSection === s.id ? ` ${styles['is-active']}` : ''}`}
                    onClick={() =>
                      document.getElementById(`section-${s.id}`)?.scrollIntoView()
                    }
                  >
                    {s.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>
      </div>

      {/* Bottom Nav */}
      <nav className={styles['pp-bottom-nav']}>
        {prevProject && (
          <Link
            href={`/project/${prevProject.id}`}
            className={styles['pp-bottom-nav-btn']}
          >
            <FiChevronLeft size={14} />
            <span>{prevProject.title}</span>
          </Link>
        )}
        <Link href="/" className={styles['pp-bottom-nav-home']}>
          <FiHome size={14} />
        </Link>
        {nextProject && (
          <Link
            href={`/project/${nextProject.id}`}
            className={`${styles['pp-bottom-nav-btn']} ${styles['pp-bottom-nav-btn--next']}`}
          >
            <span>{nextProject.title}</span>
            <FiChevronRight size={14} />
          </Link>
        )}
      </nav>
    </div>
  );
}
