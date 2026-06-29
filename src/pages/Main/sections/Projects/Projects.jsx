import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import useReveal from '@/hooks/useReveal';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import './Projects.scss';

const PROJECTS = [
  {
    id: 'drme-bit.github.io',
    title: 'drme-bit.github.io',
    url: 'https://github.com/drme-bit/drme-bit.github.io',
    desc: 'Isometric terrain portfolio.',
    tech: ['React', 'Three.js', 'R3F', 'SCSS'],
    status: 'ACTIVE',
  },
  {
    id: 'nexagon',
    title: 'Nexagon - Game Servers Monitoring',
    url: 'https://blackvoxel.studio',
    desc: 'Web-instrument made for admins to administrate and monitor game servers, with real-time metrics and alerts.',
    tech: ['Rust', 'React', 'WebGPU', 'WASM'],
    status: 'ACTIVE',
  },
];

const CELLS_X = 3;
const CELLS_Y = 2;
const DRAG_THRESHOLD = 4; // px of pointer movement before a press counts as a drag, not a click

function hashSeed(str) {
  let seed = 0;
  for (let i = 0; i < str.length; i++) seed = (seed * 31 + str.charCodeAt(i)) % 100000;
  return seed;
}
function seededRand(seed, n) {
  const v = Math.sin(seed + n * 12.9898) * 43758.5453;
  return v - Math.floor(v);
}
function seededShuffle(arr, seed) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(seededRand(seed, i) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/*
  Deterministic scattered layout: more grid cells than projects, each
  project assigned a seeded-shuffled cell and jittered within it. Guarantees
  no overlap at rest while still reading as "scattered", not "a grid".
*/
function computeInitialLayout(projects) {
  const cellW = 100 / CELLS_X;
  const cellH = 100 / CELLS_Y;
  const cellIndices = Array.from({ length: CELLS_X * CELLS_Y }, (_, i) => i);
  const shuffled = seededShuffle(cellIndices, 777); // fixed shuffle seed: stable across reloads

  const layout = {};
  projects.forEach((project, i) => {
    const seed = hashSeed(project.id);
    const cell = shuffled[i % shuffled.length];
    const cx = cell % CELLS_X;
    const cy = Math.floor(cell / CELLS_X);

    const width = 22 + seededRand(seed, 20) * 12; // 22-34% of container width
    const maxJitterX = Math.max(0, cellW - width) * 0.4;
    const jitterX = (seededRand(seed, 10) - 0.5) * 2 * maxJitterX;
    const jitterY = (seededRand(seed, 11) - 0.5) * cellH * 0.25;

    let x = cx * cellW + (cellW - width) * 0.3 + jitterX;
    let y = cy * cellH + cellH * 0.12 + jitterY;
    x = Math.max(0, Math.min(100 - width, x));
    y = Math.max(0, Math.min(82, y));

    layout[project.id] = { x, y, width };
  });
  return layout;
}

function makeSignature(seedString) {
  const seed = hashSeed(seedString);
  const rand = (n) => seededRand(seed, n);
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
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= w; gx += 20) {
    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();
  }
  for (let gy = 0; gy <= h; gy += 16) {
    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(94,200,216,0.55)';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  const mid = h / 2;
  const amp = h * 0.32;
  for (let x = 0; x <= w; x += 2) {
    const u = (x / w) * Math.PI * 2;
    const phase = t * sig.speed;
    const y = mid
      + Math.sin(u * sig.freq1 + sig.phase + phase) * amp * sig.ampRatio
      + Math.sin(u * sig.freq2 - phase * 1.3) * amp * (1 - sig.ampRatio);
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function LivePreview({ seedString, active }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const signature = useRef(makeSignature(seedString));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const sig = signature.current;

    if (!active) {
      cancelAnimationFrame(rafRef.current);
      drawFrame(ctx, w, h, sig, 0);
      return;
    }

    const start = performance.now();
    const loop = (now) => {
      const t = (now - start) / 1000;
      drawFrame(ctx, w, h, sig, t);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);

  return <canvas ref={canvasRef} width={140} height={64} className="project-preview" />;
}

function formatEntryId(index) {
  return `ENTRY_${String(index + 1).padStart(3, '0')}`;
}

function ProjectEntry({
  project, entryIndex, position, zIndex, isExpanded, isDragging,
  onToggleExpand, onPointerDown,
}) {
  const wrapRef = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style = {
    left: `${position.x}%`,
    top: `${position.y}%`,
    width: `${position.width}%`,
    zIndex,
  };

  return (
    <div
      ref={wrapRef}
      className={`registry-entry${inView ? ' is-visible' : ''}${isExpanded ? ' is-expanded' : ''}${isDragging ? ' is-dragging' : ''}`}
      style={style}
    >
      <div
        className="entry-bar"
        onPointerDown={isExpanded ? undefined : onPointerDown}
        onClick={isExpanded ? onToggleExpand : undefined}
      >
        <span className="entry-id">{formatEntryId(entryIndex)}</span>
        <span className="entry-title">{project.title}</span>
        <span className={`entry-status entry-status--${project.status.toLowerCase()}`}>{project.status}</span>
        <span className="entry-caret">{isExpanded ? '−' : '+'}</span>
      </div>

      <div className="entry-body">
        <LivePreview seedString={project.id} active={inView} />
        <div className="entry-meta">
          <p className={`entry-desc${isExpanded ? ' is-full' : ''}`}>{project.desc}</p>
          <div className="entry-tech">
            {project.tech.map((t) => (
              <span key={t} className="entry-tech-tag">{t}</span>
            ))}
          </div>
          {isExpanded && (
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="entry-link"
              onClick={(e) => e.stopPropagation()}
            >
              OPEN REPOSITORY →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const containerRef = useRef(null);
  const [projectsRef, projectsVisible] = useReveal();
  const initialLayout = useMemo(() => computeInitialLayout(PROJECTS), []);
  const [positions, setPositions] = useState(initialLayout);
  const [zIndices, setZIndices] = useState(() => {
    const z = {};
    PROJECTS.forEach((p, i) => { z[p.id] = i + 1; });
    return z;
  });
  const [expandedId, setExpandedId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const topZRef = useRef(PROJECTS.length + 1);

  const dragState = useRef(null); // { id, startX, startY, startPosX, startPosY, moved }

  const bringToFront = useCallback((id) => {
    topZRef.current += 1;
    setZIndices((current) => ({ ...current, [id]: topZRef.current }));
  }, []);

  const handlePointerDown = useCallback((project) => (e) => {
    const container = containerRef.current;
    if (!container) return;
    bringToFront(project.id);

    dragState.current = {
      id: project.id,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startPosX: positions[project.id].x,
      startPosY: positions[project.id].y,
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
      moved: false,
    };

    const handlePointerMove = (moveEvent) => {
      const ds = dragState.current;
      if (!ds) return;
      const dxPx = moveEvent.clientX - ds.startClientX;
      const dyPx = moveEvent.clientY - ds.startClientY;

      if (!ds.moved && Math.hypot(dxPx, dyPx) > DRAG_THRESHOLD) {
        ds.moved = true;
        setDraggingId(ds.id);
      }
      if (!ds.moved) return;

      const dxPct = (dxPx / ds.containerWidth) * 100;
      const dyPct = (dyPx / ds.containerHeight) * 100;

      setPositions((current) => {
        const entryWidth = current[ds.id].width;
        const nextX = Math.max(0, Math.min(100 - entryWidth, ds.startPosX + dxPct));
        const nextY = Math.max(0, Math.min(90, ds.startPosY + dyPct));
        return { ...current, [ds.id]: { ...current[ds.id], x: nextX, y: nextY } };
      });
    };

    const handlePointerUp = () => {
      const ds = dragState.current;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setDraggingId(null);
      dragState.current = null;

      // a press that never moved past the threshold is a click, not a drag —
      // toggle expand for it here, since the bar's onClick is intentionally
      // skipped while a drag could be starting (see render below)
      if (ds && !ds.moved) {
        setExpandedId((cur) => (cur === ds.id ? null : ds.id));
      }
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [positions, bringToFront]);

  const handleToggleExpand = useCallback((id) => {
    setExpandedId((current) => (current === id ? null : id));
  }, []);

  return (
    <section id="work" ref={projectsRef} className={`section section--projects reveal${projectsVisible ? ' is-visible' : ''}`}>
      <div className="section-inner">
        <SectionHeader title="system registry" visible={projectsVisible} />
        <h2 className="section-title">Selected<span className="section-accent"> work</span></h2>
        <p className="registry-hint">drag entries to rearrange · click to expand</p>

        <div className="registry-canvas" ref={containerRef}>
          {PROJECTS.map((project, i) => (
            <ProjectEntry
              key={project.id}
              project={project}
              entryIndex={i}
              position={positions[project.id]}
              zIndex={zIndices[project.id]}
              isExpanded={expandedId === project.id}
              isDragging={draggingId === project.id}
              onToggleExpand={() => handleToggleExpand(project.id)}
              onPointerDown={handlePointerDown(project)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}