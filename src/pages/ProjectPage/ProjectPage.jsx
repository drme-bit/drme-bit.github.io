import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHome, FiChevronLeft, FiChevronRight, FiGithub, FiExternalLink, FiCheck, FiCode, FiAlertCircle } from 'react-icons/fi';
import { getProjectById, getProjectIndex, PROJECTS } from '@/data/projectsData';
import './ProjectPage.scss';

function useIsMobile(breakpoint = 700) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= breakpoint : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, [breakpoint]);
  return isMobile;
}

const STATUS_META = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

function splitParagraphs(text) {
  if (!text) return [];
  return String(text)
    .split(/\n\s*\n+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildDefaultSections(project) {
  const sections = [];

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
        project.architecture ? { title: 'System Design', icon: FiCode, body: project.architecture } : null,
        project.challenges ? { title: 'Challenges', icon: FiAlertCircle, body: project.challenges } : null,
      ].filter(Boolean),
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

function GalleryCarousel({ images }) {
  const [current, setCurrent] = useState(0);
  const [fullscreen, setFullscreen] = useState(null);
  const isMobile = useIsMobile();

  const prev = () => setCurrent(c => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent(c => (c === images.length - 1 ? 0 : c + 1));

  useEffect(() => {
    const h = (e) => {
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
      <div className="pp-gallery">
        <div className="pp-gallery-main">
          <img
            src={images[0]}
            alt=""
            className="pp-gallery-img"
            onClick={isMobile ? undefined : () => setFullscreen(images[0])}
          />
        </div>
        {!isMobile && fullscreen && (
          <div className="pp-gallery-fullscreen" onClick={() => setFullscreen(null)}>
            <img src={fullscreen} alt="" className="pp-gallery-fullscreen-img" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pp-gallery">
      <div className="pp-gallery-main">
        <button className="pp-gallery-zone pp-gallery-zone--prev" onClick={prev} aria-label="Previous">
          <span className="pp-gallery-zone-shadow" />
        </button>
        <img
          src={images[current]}
          alt=""
          className="pp-gallery-img"
          onClick={handleImgClick}
        />
        <button className="pp-gallery-zone pp-gallery-zone--next" onClick={next} aria-label="Next">
          <span className="pp-gallery-zone-shadow" />
        </button>
      </div>
      <div className="pp-gallery-thumbs">
        {images.map((src, i) => (
          <button
            key={i}
            className={`pp-gallery-thumb${i === current ? ' is-active' : ''}`}
            onClick={() => setCurrent(i)}
          >
            <img src={src} alt="" />
          </button>
        ))}
      </div>
      {!isMobile && fullscreen && (
        <div className="pp-gallery-fullscreen" onClick={() => setFullscreen(null)}>
          <img src={fullscreen} alt="" className="pp-gallery-fullscreen-img" />
        </div>
      )}
    </div>
  );
}

function renderSectionContent(section) {
  if (section.type === 'timeline' && Array.isArray(section.items)) {
    return (
      <div className="pp-stages">
        {section.items.map((stage, i) => (
          <div key={stage.title || i} className="pp-stage">
            <div className="pp-stage-marker">
              <span className="pp-stage-num">{String(i + 1).padStart(2, '0')}</span>
              {i < section.items.length - 1 && <div className="pp-stage-line" />}
            </div>
            <div className="pp-stage-content">
              <div className="pp-stage-head">
                <h3 className="pp-stage-title">{stage.title}</h3>
                {stage.duration && <span className="pp-stage-duration">{stage.duration}</span>}
              </div>
              <p className="pp-stage-desc">{stage.desc}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'list' && Array.isArray(section.items)) {
    return (
      <div className="pp-features">
        {section.items.map((item, i) => (
          <div key={item} className="pp-feature-item">
            <FiCheck size={14} className="pp-feature-check" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'cards' && Array.isArray(section.cards)) {
    return (
      <div className="pp-arch-cards">
        {section.cards.map((card, i) => {
          const CardIcon = card.icon || FiCode;
          return (
            <div key={card.title || i} className="pp-arch-card">
              <div className="pp-arch-card-head">
                <CardIcon size={14} />
                {card.title}
              </div>
              <p className="pp-arch-text">{card.body}</p>
            </div>
          );
        })}
      </div>
    );
  }

  if (section.type === 'gallery' && Array.isArray(section.items)) {
    return <GalleryCarousel images={section.items} />;
  }

  if (section.type === 'text') {
    return (
      <div className="pp-content-body">
        {splitParagraphs(Array.isArray(section.body) ? section.body.join('\n\n') : section.body).map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    );
  }

  return null;
}

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const project = getProjectById(id);
  const [activeSection, setActiveSection] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!project) navigate('/', { replace: true });
  }, [project, navigate]);

  const meta = project ? STATUS_META[project.status] || STATUS_META.ARCHIVED : null;
  const currentIndex = project ? getProjectIndex(id) : -1;
  const prevProject = currentIndex > 0 ? PROJECTS[currentIndex - 1] : null;
  const nextProject = project && currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : null;
  const contentSections = project
    ? (Array.isArray(project.sections) && project.sections.length > 0
      ? project.sections
      : buildDefaultSections(project))
    : [];

  const links = [];
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
  }, [contentSections]);

  if (!project) return null;

  return (
    <div className="project-page">
      {/* Top Nav */}
      <nav className="pp-nav">
        <Link to="/" className="pp-nav-home">
          <FiHome size={12} />
        </Link>
        <div className="pp-nav-divider" />
        <div className="pp-nav-sections">
          {contentSections.map((s) => (
            <button
              key={s.id}
              className={`pp-nav-link${activeSection === s.id ? ' is-active' : ''}`}
              onClick={() => document.getElementById(`section-${s.id}`)?.scrollIntoView()}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="pp-nav-divider" />
        <div className="pp-nav-arrows">
          {prevProject && (
            <Link to={`/project/${prevProject.id}`} className="pp-nav-arrow">
              <FiChevronLeft size={14} />
            </Link>
          )}
          {nextProject && (
            <Link to={`/project/${nextProject.id}`} className="pp-nav-arrow">
              <FiChevronRight size={14} />
            </Link>
          )}
        </div>
      </nav>

      {/* Hero */}
      <header className="pp-hero">
        {(project.video || project.image) && (
          <div className="pp-hero-bg">
            {project.video ? (
              <video
                src={project.video}
                className="pp-hero-bg-video"
                autoPlay
                loop
                muted
                playsInline
              />
            ) : (
              <img src={project.image} alt="" className="pp-hero-bg-img" />
            )}
            <div className="pp-hero-bg-overlay" />
            <div className="pp-hero-bg-fade" />
          </div>
        )}
        <div className="pp-hero-inner">
          <div className="pp-hero-breadcrumb">
            <Link to="/">home</Link>
            <span>/</span>
            <Link to="/#projects">projects</Link>
            <span>/</span>
            <span className="pp-hero-bc-current">{project.id}</span>
          </div>
          <h1 className="pp-hero-title">{project.title}</h1>
          <p className="pp-hero-desc">{project.desc}</p>
          <div className="pp-hero-meta">
            <span className={`pp-hero-status ${meta.cls}`}>
              {meta.icon} {meta.label}
            </span>
            <span className="pp-hero-counter">
              {String(currentIndex + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
            </span>
          </div>
          <div className="pp-hero-actions">
            {links.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="pp-btn">
                {link.label === 'Source Code' ? <FiGithub size={14} /> : <FiExternalLink size={14} />}
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="pp-content">
        {/* Main Content */}
        <main className="pp-main">
          {contentSections.map((section, index) => (
            <section key={section.id} id={`section-${section.id}`} className="pp-section">
              <div className="pp-section-header">
                <span className="pp-section-number">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="pp-section-title">{section.label}</h2>
              </div>
              {renderSectionContent(section)}
            </section>
          ))}
        </main>

        {/* Right Sidebar */}
        <aside className="pp-right-sidebar">
          <div className="pp-right-sidebar-sticky">
            {/* Links */}
            {links.length > 0 && (
              <div className="pp-right-section">
                <span className="pp-right-label">Links</span>
                <div className="pp-right-links">
                  {links.map((link) => (
                    <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="pp-right-link">
                      {link.label === 'Source Code' ? <FiGithub size={12} /> : <FiExternalLink size={12} />}
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div className="pp-right-section">
              <span className="pp-right-label">Status</span>
              <span className={`pp-right-status ${meta.cls}`}>
                {meta.icon} {meta.label}
              </span>
              <span className="pp-right-counter">
                {String(currentIndex + 1).padStart(2, '0')} / {String(PROJECTS.length).padStart(2, '0')}
              </span>
            </div>

            {/* Stack */}
            <div className="pp-right-section">
              <span className="pp-right-label">Stack</span>
              <div className="pp-right-stack">
                {project.tech.map((t) => (
                  <span key={t} className="pp-right-tag">{t}</span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="pp-right-section">
              <span className="pp-right-label">Sections</span>
              <nav className="pp-right-nav">
                {contentSections.map((s) => (
                  <button
                    key={s.id}
                    className={`pp-right-nav-link${activeSection === s.id ? ' is-active' : ''}`}
              onClick={() => document.getElementById(`section-${s.id}`)?.scrollIntoView()}
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
      <nav className="pp-bottom-nav">
        {prevProject && (
          <Link to={`/project/${prevProject.id}`} className="pp-bottom-nav-btn">
            <FiChevronLeft size={14} />
            <span>{prevProject.title}</span>
          </Link>
        )}
        <Link to="/" className="pp-bottom-nav-home">
          <FiHome size={14} />
        </Link>
        {nextProject && (
          <Link to={`/project/${nextProject.id}`} className="pp-bottom-nav-btn pp-bottom-nav-btn--next">
            <span>{nextProject.title}</span>
            <FiChevronRight size={14} />
          </Link>
        )}
      </nav>
    </div>
  );
}
