import { useNavigate } from 'react-router-dom';
import useReveal from '@/hooks/useReveal';
import useHorizontalScroll from '@/hooks/useHorizontalScroll';
import SectionTitle from '@/components/ui/SectionTitle/SectionTitle';
import Carousel from '@/components/ui/Carousel/Carousel';
import { PROJECTS } from '@/data/projectsData';
import { FiArrowRight, FiExternalLink } from 'react-icons/fi';
import './Projects.scss';

const STATUS_META = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

function ProjectCard({ project, index, isActive }) {
  const navigate = useNavigate();
  const meta = STATUS_META[project.status] || STATUS_META.ARCHIVED;

  const handleClick = () => {
    navigate(`/project/${project.id}`);
  };

  return (
    <div className={`project-card${isActive ? ' is-active' : ''}`}>
      <div className="project-card-image">
        <Carousel
          images={project.images?.filter(Boolean) || (project.image ? [project.image] : [])}
          isActive={isActive}
          showThumbs={true}
        />
      </div>

      <div className="project-card-content">
        <div className="project-card-header">
          <span className="project-card-id">
            <span className="project-card-prompt">$</span>
            ./project_{String(index + 1).padStart(3, '0')}
          </span>
          <span className={`project-badge ${meta.cls}`}>
            <span className="project-badge-dot">{meta.icon}</span>
            {meta.label}
          </span>
        </div>

        <h3 className="project-card-title">{project.title}</h3>
        
        <p className="project-card-desc">{project.desc}</p>

        <div className="project-card-tech">
          {project.tech.slice(0, 6).map((t) => (
            <span key={t} className="project-tech-tag">{t}</span>
          ))}
          {project.tech.length > 6 && (
            <span className="project-tech-more">+{project.tech.length - 6}</span>
          )}
        </div>

        <div className="project-card-actions">
          <button className="project-cta" onClick={handleClick}>
            <span>cat details.md</span>
            <FiArrowRight className="project-cta-icon" />
          </button>
          {project.url && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="project-link"
              onClick={(e) => e.stopPropagation()}
            >
              <FiExternalLink />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [sectionRef, sectionVisible] = useReveal();
  const {
    progress,
    currentIndex,
    containerRef,
    scrollTo,
    scrollNext,
    scrollPrev,
    handlers,
  } = useHorizontalScroll({
    itemCount: PROJECTS.length,
    snapThreshold: 0.15,
  });

  const count = PROJECTS.length;

  return (
    <section
      id="projects"
      ref={(el) => {
        containerRef.current = el;
        sectionRef.current = el;
      }}
      className={`section section--projects reveal${sectionVisible ? ' is-visible' : ''}`}
      style={{ height: `${count * 100}vh` }}
    >
      <div className="projects-sticky">
        <div className="projects-inner">
          <SectionTitle
            title="system registry"
            accent="_"
            visible={sectionVisible}
          />

          <div className="projects-header">
            <div className="projects-counter">
              <span className="projects-counter-current">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="projects-counter-sep">/</span>
              <span className="projects-counter-total">
                {String(count).padStart(2, '0')}
              </span>
            </div>
          </div>

          <div className="projects-viewport" {...handlers}>
            <div className="projects-track">
              {PROJECTS.map((project, i) => (
                <div key={project.id} className="projects-track-item">
                  <ProjectCard
                    project={project}
                    index={i}
                    isActive={i === currentIndex}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="projects-footer">
            <div className="projects-progress">
              <div className="projects-progress-track">
                <div
                  className="projects-progress-fill"
                  style={{ width: `${(progress * 100).toFixed(1)}%` }}
                />
              </div>
            </div>

            <div className="projects-nav">
              <button
                className="projects-nav-btn"
                onClick={scrollPrev}
                disabled={currentIndex === 0}
              >
                ←
              </button>
              <button
                className="projects-nav-btn"
                onClick={scrollNext}
                disabled={currentIndex === count - 1}
              >
                →
              </button>
            </div>
          </div>

          <p className="projects-hint">
            <span className="projects-hint-icon">↕</span>
            Scroll to explore
          </p>
        </div>
      </div>
    </section>
  );
}
