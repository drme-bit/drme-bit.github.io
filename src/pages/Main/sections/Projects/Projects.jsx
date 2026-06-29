import { useEffect, useRef, useState } from 'react';
import useReveal from '@/hooks/useReveal';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import './Projects.scss';

/* ------------------------------------------------------------------ */
/*  Data — add image path to show a screenshot; null → fallback shown */
/* ------------------------------------------------------------------ */

const PROJECTS = [
  {
    id: 'drme-bit.github.io',
    title: 'drme-bit.github.io',
    url: 'https://github.com/drme-bit/drme-bit.github.io',
    desc: 'Isometric terrain portfolio built with React, Three.js, R3F and SCSS. Features real-time 3D globe, terminal-style hero section, and interactive project dashboard.',
    tech: ['React', 'Three.js', 'R3F', 'SCSS'],
    status: 'ACTIVE',
    image: 'images/projects/githubio_hero.png',
  },
  {
    id: 'nexagon',
    title: 'Nexagon — Game Servers Monitoring',
    url: 'https://www.blackvoxel.studio',
    desc: 'Web-instrument made for admins to administrate and monitor game servers, with real-time metrics and alerts built in Rust, React, WebGPU and WASM.',
    tech: ['Rust', 'React', 'WebGPU', 'WASM'],
    status: 'ACTIVE',
    image: 'images/projects/nexagon_main.png',
  },
];

/* ------------------------------------------------------------------ */
/*  Fallback canvas — procedural wave animation                       */
/* ------------------------------------------------------------------ */

function makeSignature(seedString) {
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) seed = (seed * 31 + seedString.charCodeAt(i)) % 100000;
  const rand = (n) => { const v = Math.sin(seed + n * 12.9898) * 43758.5453; return v - Math.floor(v); };
  return {
    freq1: 0.6 + rand(1) * 3.4,
    freq2: 1.2 + rand(2) * 5.2,
    phase: rand(3) * Math.PI * 2,
    ampRatio: 0.25 + rand(4) * 0.5,
    speed: 0.5 + rand(5) * 1.1,
  };
}

function drawFrame(ctx, w, h, sig, t) {
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, w, h);

  const mid = h / 2;
  const amp = h * 0.35;
  const pts = [];
  for (let x = 0; x <= w; x += 2) {
    const u = (x / w) * Math.PI * 2;
    const p = t * sig.speed;
    const y = mid
      + Math.sin(u * sig.freq1 + sig.phase + p) * amp * sig.ampRatio
      + Math.sin(u * sig.freq2 - p * 1.3) * amp * (1 - sig.ampRatio);
    pts.push({ x, y });
  }

  // filled shape
  ctx.beginPath();
  ctx.moveTo(pts[0].x, h);
  for (const p of pts) ctx.lineTo(p.x, p.y);
  ctx.lineTo(pts[pts.length - 1].x, h);
  ctx.closePath();
  const g = ctx.createLinearGradient(0, mid - amp, 0, h);
  g.addColorStop(0, 'rgba(94,200,216,0.12)');
  g.addColorStop(0.5, 'rgba(94,200,216,0.03)');
  g.addColorStop(1, 'rgba(94,200,216,0)');
  ctx.fillStyle = g;
  ctx.fill();

  // glow line
  ctx.shadowColor = 'rgba(94,200,216,0.25)';
  ctx.shadowBlur = 12;
  ctx.strokeStyle = 'rgba(94,200,216,0.5)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();

  // bright core
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(94,200,216,0.7)';
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.stroke();

  // subtle dot at current phase endpoint
  const last = pts[pts.length - 1];
  ctx.fillStyle = 'rgba(94,200,216,0.6)';
  ctx.shadowColor = 'rgba(94,200,216,0.4)';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(last.x, last.y, 2, 0, Math.PI * 2);
  ctx.fill();
}

function LivePreview({ seedString }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const sig = useRef(makeSignature(seedString));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const start = performance.now();
    const loop = (now) => {
      drawFrame(ctx, w, h, sig.current, (now - start) / 1000);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return <canvas ref={canvasRef} width={400} height={180} className="project-preview-canvas" />;
}

/* ------------------------------------------------------------------ */
/*  Preview — macOS‑style window with traffic‑light buttons           */
/* ------------------------------------------------------------------ */

function ProjectPreview({ project }) {
  return (
    <div className="project-window">
      <div className="project-window-bar">
        <div className="project-window-dots">
          <span className="project-window-dot project-window-dot--red" />
          <span className="project-window-dot project-window-dot--yellow" />
          <span className="project-window-dot project-window-dot--green" />
        </div>
        <span className="project-window-label">{project.id}</span>
        <span className="project-window-arrow">↗</span>
      </div>
      <div className="project-window-body">
        {project.image ? (
          <img
            src={project.image}
            alt={`${project.title} screenshot`}
            className="project-preview-img"
            loading="lazy"
          />
        ) : (
          <LivePreview seedString={project.id} />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Status badge                                                      */
/* ------------------------------------------------------------------ */

const STATUS_META = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

/* ------------------------------------------------------------------ */
/*  Project card                                                      */
/* ------------------------------------------------------------------ */

function formatId(i) {
  return `ENTRY_${String(i + 1).padStart(3, '0')}`;
}

function ProjectCard({ project, index, isCurrent }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const meta = STATUS_META[project.status] || STATUS_META.ARCHIVED;
  const disabled = project.url === '#';

  const handleClick = () => {
    if (disabled) return;
    window.open(project.url, '_blank', 'noopener noreferrer');
  };

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      className={`project-card${inView ? ' is-inview' : ''}${isCurrent ? ' is-current' : ''}${disabled ? ' project-card--disabled' : ''}`}
      onClick={handleClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
    >
      <div className="project-card-header">
        <span className="project-card-id">{formatId(index)}</span>
        <span className={`project-badge ${meta.cls}`}>
          <span className="project-badge-dot">{meta.icon}</span>
          {meta.label}
        </span>
        <span className="project-card-link">↗</span>
      </div>

      <ProjectPreview project={project} />

      <div className="project-card-body">
        <h3 className="project-card-title">{project.title}</h3>
        <div className="project-card-tech">
          {project.tech.map((t) => (
            <span key={t} className="project-tech-tag">{t}</span>
          ))}
        </div>
        <p className="project-card-desc">{project.desc}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Section                                                           */
/* ------------------------------------------------------------------ */

export default function Projects() {
  const outerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [sectionRef, sectionVisible] = useReveal();

  useEffect(() => {
    const section = outerRef.current;
    if (!section) return;
    const update = () => {
      const rect = section.getBoundingClientRect();
      const winH = window.innerHeight;
      const scrollable = rect.height - winH;
      if (scrollable <= 0) { setProgress(0); return; }
      setProgress(Math.max(0, Math.min(1, -rect.top / scrollable)));
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const count = PROJECTS.length;
  const currentIndex = Math.round(progress * (count - 1));
  const translatePct = progress * (count - 1) * 100;

  return (
    <section
      id="projects"
      ref={(el) => {
        outerRef.current = el;
        sectionRef.current = el;
      }}
      className={`section section--projects reveal${sectionVisible ? ' is-visible' : ''}`}
      style={{ height: `${count * 100}vh` }}
    >
      <div className="projects-sticky">
        <div className="projects-inner">
          <SectionHeader title="system registry" number="04" visible={sectionVisible} />
          <h2 className="section-title">Selected<span className="section-accent"> work</span></h2>

          <div className="projects-counter">
            <span className="projects-counter-current">{String(currentIndex + 1).padStart(2, '0')}</span>
            <span className="projects-counter-sep">/</span>
            <span className="projects-counter-total">{String(count).padStart(2, '0')}</span>
          </div>

          <div className="projects-viewport">
            <div
              className="projects-track"
              style={{ transform: `translateX(-${translatePct}%)` }}
            >
              {PROJECTS.map((project, i) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={i}
                  isCurrent={i === currentIndex}
                />
              ))}
            </div>
          </div>

          <div className="projects-progress">
            <div className="projects-progress-track">
              <div
                className="projects-progress-fill"
                style={{ width: `${(progress * 100).toFixed(1)}%` }}
              />
              {PROJECTS.map((_, i) => (
                <span
                  key={i}
                  className={`projects-progress-dot${i <= currentIndex ? ' is-filled' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
