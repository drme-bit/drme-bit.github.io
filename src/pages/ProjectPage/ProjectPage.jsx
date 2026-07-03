import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiHome, FiChevronLeft, FiChevronRight, FiGithub, FiExternalLink, FiCheck, FiCode, FiAlertCircle, FiMonitor } from 'react-icons/fi';
import { getProjectById, getProjectIndex, PROJECTS } from '@/data/projectsData';
import CustomCursor from '@/components/ui/CustomCursor/CustomCursor';
import CursorTrail from '@/components/ui/CursorTrail/CursorTrail';
import './ProjectPage.scss';

const STATUS_META = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

const PRESENTATION_META = {
  patch: {
    cls: 'pp-page--patch',
    eyebrow: 'release notes',
    hint: 'structured like a patch breakdown',
  },
  classic: {
    cls: 'pp-page--classic',
    eyebrow: 'project profile',
    hint: 'structured like a case study',
  },
  compact: {
    cls: 'pp-page--compact',
    eyebrow: 'snapshot',
    hint: 'compressed and data-heavy',
  },
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

function normalizeSection(section) {
  if (!section) return null;

  return {
    variant: 'default',
    ...section,
  };
}

function buildSidebarFacts(project, meta, stageWeeks) {
  if (Array.isArray(project.facts) && project.facts.length > 0) {
    return project.facts;
  }

  const facts = [{ label: 'Status', value: meta.label }];

  if (Array.isArray(project.tech) && project.tech.length > 0) {
    facts.push({ label: 'Stack', value: project.tech.join(' · ') });
  }

  if (stageWeeks > 0) {
    facts.push({ label: 'Timeline', value: `${stageWeeks}+ weeks` });
  }

  if (Array.isArray(project.stages) && project.stages.length > 0) {
    facts.push({ label: 'Stages', value: `${project.stages.length} sections` });
  }

  if (Array.isArray(project.features) && project.features.length > 0) {
    facts.push({ label: 'Features', value: `${project.features.length} items` });
  }

  return facts;
}

function getPresentation(project) {
  const preset = project.presentation?.mode || project.presentation?.layout || 'classic';
  return PRESENTATION_META[preset] || PRESENTATION_META.classic;
}

function renderSectionContent(section) {
  if (section.type === 'timeline' && Array.isArray(section.items)) {
    return (
      <div className={`pp-stages pp-stages--${section.variant || 'default'}`}>
        {section.items.map((stage, i) => (
          <div key={stage.title || i} className="pp-stage">
            <div className="pp-stage-marker">
              <span className="pp-stage-num">{String(i + 1).padStart(2, '0')}</span>
              {i < section.items.length - 1 && <div className="pp-stage-line" />}
            </div>
            <div className="pp-stage-card">
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
      <div className={`pp-features pp-features--${section.variant || 'default'}`}>
        {section.items.map((item, i) => (
          <div key={item} className="pp-feature-item">
            <div className="pp-feature-check">
              <FiCheck size={12} />
            </div>
            <span>{item}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'cards' && Array.isArray(section.cards)) {
    return (
      <div className={`pp-arch-cards pp-arch-cards--${section.variant || 'default'}`}>
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

  if (section.type === 'stats' && Array.isArray(section.items)) {
    return (
      <div className={`pp-stats-grid pp-stats-grid--${section.variant || 'default'}`}>
        {section.items.map((item) => (
          <div key={item.label} className="pp-stat-card">
            <span className="pp-stat-label">{item.label}</span>
            <span className="pp-stat-value">{item.value}</span>
            {item.note && <span className="pp-stat-note">{item.note}</span>}
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'quote') {
    return (
      <blockquote className={`pp-quote pp-quote--${section.variant || 'default'}`}>
        <p>{section.body}</p>
        {section.byline && <footer>{section.byline}</footer>}
      </blockquote>
    );
  }

  if (section.type === 'callout') {
    return (
      <div className={`pp-callout pp-callout--${section.variant || 'default'}`}>
        {section.calloutLabel && <span className="pp-callout-label">{section.calloutLabel}</span>}
        <p>{section.body}</p>
      </div>
    );
  }

  if (section.type === 'grid' && Array.isArray(section.items)) {
    return (
      <div className={`pp-grid pp-grid--${section.variant || 'default'}`}>
        {section.items.map((item) => (
          <article key={item.title} className="pp-grid-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
            {item.meta && <span className="pp-grid-meta">{item.meta}</span>}
          </article>
        ))}
      </div>
    );
  }

  if (section.type === 'split' && Array.isArray(section.columns)) {
    return (
      <div className={`pp-split pp-split--${section.variant || 'default'}`}>
        {section.columns.map((column, i) => (
          <div key={column.title || i} className="pp-split-column">
            {column.title && <h3>{column.title}</h3>}
            {(column.body ? splitParagraphs(column.body) : []).map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
            {Array.isArray(column.items) && (
              <ul>
                {column.items.map((item) => <li key={item}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    );
  }

  if (section.type === 'text') {
    return (
      <div className={`pp-content-body pp-content-body--${section.variant || 'default'}`}>
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
  const scrollRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!project) navigate('/', { replace: true });
  }, [project, navigate]);

  if (!project) return null;

  const meta = STATUS_META[project.status] || STATUS_META.ARCHIVED;
  const presentation = getPresentation(project);
  const currentIndex = getProjectIndex(id);
  const prevProject = currentIndex > 0 ? PROJECTS[currentIndex - 1] : null;
  const nextProject = currentIndex < PROJECTS.length - 1 ? PROJECTS[currentIndex + 1] : null;
  const contentSections = Array.isArray(project.sections) && project.sections.length > 0
    ? project.sections.map(normalizeSection).filter(Boolean)
    : buildDefaultSections(project);
  const [activeSection, setActiveSection] = useState(contentSections[0]?.id || 'overview');

  const links = [];
  if (project.url && project.url !== '#') {
    links.push({ label: 'Live Site', url: project.url });
  }
  if (project.repo) {
    links.push({ label: 'Source Code', url: project.repo });
  }

  const scrollTo = (sectionId) => {
    document.getElementById(`section-${sectionId}`)?.scrollIntoView({ behavior: 'smooth' });
  };

  const stageWeeks = Array.isArray(project.stages)
    ? project.stages.reduce((acc, s) => {
      const nums = s.duration.match(/\d+/g);
      return nums ? acc + Math.max(...nums.map(Number)) : acc;
    }, 0)
    : 0;
  const sidebarFacts = buildSidebarFacts(project, meta, stageWeeks);

  useEffect(() => {
    const observers = contentSections.map((section) => {
      const el = document.getElementById(`section-${section.id}`);
      if (!el) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(section.id);
        },
        { threshold: 0.35 },
      );
      observer.observe(el);
      return observer;
    });

    return () => observers.forEach((observer) => observer?.disconnect());
  }, [contentSections]);

  return (
    <div className="project-page" ref={scrollRef}>
      <CustomCursor />
      <CursorTrail />

      <div className={`project-page-shell ${presentation.cls}`}>

      <nav className="pp-nav">
        <div className="pp-nav-inner">
          <Link to="/" className="pp-nav-brand">
            <FiHome size={16} />
            home
          </Link>

          <div className="pp-nav-center">
            {contentSections.map((s) => (
              <button
                key={s.id}
                className={`pp-nav-link${activeSection === s.id ? ' is-active' : ''}`}
                onClick={() => scrollTo(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="pp-nav-adjacent">
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
        </div>
      </nav>

      <header className="pp-hero">
        <div className="pp-hero-bg">
          {project.video ? (
            <video
              className="pp-hero-bg-media pp-hero-bg-media--video"
              src={project.video}
              autoPlay
              muted
              loop
              playsInline
              poster={project.image || undefined}
            />
          ) : null}
          <div className="pp-hero-bg-overlay" />
          <div className="pp-hero-bg-fade" />
          <div className="pp-hero-grid" />
        </div>

        <div className="pp-hero-inner">
          <div className="pp-hero-eyebrow-row">
            <span className="pp-hero-eyebrow">{presentation.eyebrow}</span>
            <span className="pp-hero-hint">{presentation.hint}</span>
          </div>

          <div className="pp-hero-breadcrumb">
            <Link to="/">home</Link>
            <span className="pp-hero-bc-sep">/</span>
            <span>projects</span>
            <span className="pp-hero-bc-sep">/</span>
            <span className="pp-hero-bc-current">{project.id}</span>
          </div>

          <div className="pp-hero-title-row">
            <div className="pp-hero-counter">
              <span className="pp-hero-counter-current">{String(currentIndex + 1).padStart(2, '0')}</span>
              <span className="pp-hero-counter-sep">/</span>
              <span className="pp-hero-counter-total">{String(PROJECTS.length).padStart(2, '0')}</span>
            </div>
            <h1 className="pp-hero-title">{project.title}</h1>
          </div>

          <p className="pp-hero-desc">{project.desc}</p>

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

      <div className="pp-layout">
        <aside className="pp-sidebar">
          <div className="pp-sidebar-sticky">
            {sidebarFacts.map((fact) => (
              <div key={fact.label} className="pp-sidebar-section">
                <span className="pp-sidebar-label">{fact.label}</span>
                {fact.label === 'Status' ? (
                  <span className={`pp-status ${meta.cls}`}>
                    <span className="pp-status-dot">{meta.icon}</span>
                    {fact.value}
                  </span>
                ) : fact.label === 'Stack' && typeof fact.value === 'string' && fact.value.includes('·') ? (
                  <div className="pp-sidebar-tags">
                    {fact.value.split(' · ').map((item) => (
                      <span key={item} className="pp-tag">{item}</span>
                    ))}
                  </div>
                ) : (
                  <span className="pp-sidebar-stat">{fact.value}</span>
                )}
              </div>
            ))}

            <nav className="pp-sidebar-nav">
              <span className="pp-sidebar-label">On this page</span>
              {contentSections.map((s) => (
                <button key={s.id} className="pp-sidebar-nav-link" onClick={() => scrollTo(s.id)}>
                  {s.label}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        <main className="pp-main">
          {contentSections.map((section, index) => (
            <section key={section.id} id={`section-${section.id}`} className={`pp-content-section pp-content-section--${section.type || 'text'} pp-content-section--${section.variant || 'default'}`}>
              <div className="pp-content-header">
                <span className="pp-content-number">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="pp-content-title">{section.label}</h2>
                {section.note && <span className="pp-content-note">{section.note}</span>}
              </div>

              {renderSectionContent(section)}
            </section>
          ))}
        </main>

        <aside className="pp-right">
          <div className="pp-right-sticky">
            {project.video ? (
              <div className="pp-right-preview">
                <video src={project.video} autoPlay muted loop playsInline />
              </div>
            ) : project.image ? (
              <div className="pp-right-preview">
                <img src={project.image} alt={project.title} />
              </div>
            ) : (
              <div className="pp-right-preview pp-right-preview--empty">
                <FiMonitor size={32} />
              </div>
            )}

            <div className="pp-right-section">
              <span className="pp-right-label">Technologies</span>
              <div className="pp-right-tech">
                {project.tech.map((t) => (
                  <div key={t} className="pp-right-tech-item">
                    <div className="pp-right-tech-dot" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pp-right-section">
              <span className="pp-right-label">Quick Links</span>
              <div className="pp-right-links">
                {links.map((link) => (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="pp-right-link">
                    <FiExternalLink size={12} />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <nav className="pp-bottom-nav" aria-label="Project navigation">
        <Link to="/" className="pp-bottom-nav-home">
          <FiHome size={14} />
          home
        </Link>

        <div className="pp-bottom-nav-center">
          {contentSections.map((s) => (
            <button
              key={s.id}
              className={`pp-bottom-nav-link${activeSection === s.id ? ' is-active' : ''}`}
              onClick={() => scrollTo(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>

        <div className="pp-bottom-nav-adjacent">
          {prevProject && (
            <Link to={`/project/${prevProject.id}`} className="pp-bottom-nav-arrow" aria-label="Previous project">
              <FiChevronLeft size={14} />
            </Link>
          )}
          {nextProject && (
            <Link to={`/project/${nextProject.id}`} className="pp-bottom-nav-arrow" aria-label="Next project">
              <FiChevronRight size={14} />
            </Link>
          )}
        </div>
      </nav>

      <footer className="pp-footer">
        <div className="pp-footer-inner">
          <Link to="/" className="pp-footer-back">
            <FiChevronLeft size={14} />
            Back to home
          </Link>
          <div className="pp-footer-meta">
            <span className="pp-footer-project-label">Project</span>
            <span className="pp-footer-project-name">{project.title.replace(/ —.*/, '')}</span>
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
}
