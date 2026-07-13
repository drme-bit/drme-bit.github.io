import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '@/hooks/useReveal';
import useScrollPhase from '@/hooks/useScrollPhase';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import Globe from '@/components/ui/Globe/Globe';
import { SKILLS_DATA, GROUP_COLORS, ICON_MAP } from './SkillsGlobe';
import useCursorParallax from '@/hooks/useCursorParallax';
import { FiSearch, FiX } from 'react-icons/fi';
import './Skills.scss';

const SCROLL_PHASES = [
  { id: 'intro', start: 0, end: 0.25 },
  { id: 'interactive', start: 0.25, end: 0.6 },
  { id: 'detail', start: 0.6, end: 0.7 },
];

export default function Skills() {
  const [ref, visible] = useReveal();
  const [selected, setSelected] = useState(null);
  const [filterGroup, setFilterGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const phiRef = useRef(0);
  const globeWrapRef = useRef(null);
  const ringRef = useRef(null);
  const svgRef = useRef(null);
  const itemRefs = useRef(new Map());
  const posCache = useRef(new Map());
  const { x, y } = useCursorParallax();

  const {
    overallProgress,
    sectionRef,
  } = useScrollPhase({
    phases: SCROLL_PHASES,
    sectionId: 'skills',
  });

  const filteredSkills = useMemo(() => {
    let result = SKILLS_DATA;
    if (filterGroup) result = result.filter((s) => s.group === filterGroup);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [filterGroup, searchQuery]);

  const skillPositions = useMemo(() => {
    const n = filteredSkills.length;
    return filteredSkills.map((_, i) => {
      // Fibonacci sphere with clamped poles to avoid clustering
      const t = (i + 0.5) / n;
      const y = 1 - 2 * t;                              // 1 → -1
      const clampedY = Math.max(-0.82, Math.min(0.82, y)); // avoid poles
      const r = Math.sqrt(1 - clampedY * clampedY);
      const theta = 2.399963 * i;
      return { x: r * Math.cos(theta), y: clampedY, z: r * Math.sin(theta) };
    });
  }, [filteredSkills]);

  const groupCounts = useMemo(
    () =>
      SKILLS_DATA.reduce((acc, s) => {
        acc[s.group] = (acc[s.group] || 0) + 1;
        return acc;
      }, {}),
    []
  );

  // Project skills onto 2D + draw connection lines — runs every frame
  useEffect(() => {
    let raf;
    const tick = () => {
      const globeWrap = globeWrapRef.current;
      const ring = ringRef.current;
      const svg = svgRef.current;
      if (!globeWrap || !ring) { raf = requestAnimationFrame(tick); return; }

      const w = globeWrap.offsetWidth;
      const h = globeWrap.offsetHeight;
      const phi = phiRef.current;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      // Project each skill and cache positions
      posCache.current.clear();
      itemRefs.current.forEach((el, name) => {
        if (!el) return;
        const idx = filteredSkills.findIndex(s => s.name === name);
        if (idx === -1) { el.style.opacity = '0'; return; }
        const pos = skillPositions[idx];
        if (!pos) return;

        const rx = pos.x * cosPhi + pos.z * sinPhi;
        const ry = pos.y;
        const rz = -pos.x * sinPhi + pos.z * cosPhi;

        const cx = w / 2 + rx * (w * 0.48);
        const cy = h / 2 - ry * (h * 0.48);

        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;
        el.style.opacity = rz > -0.15 ? '1' : '0';
        el.style.transform = `translate(-50%, -50%) scale(${0.7 + (rz + 1) * 0.3})`;
        el.style.pointerEvents = rz > 0 ? 'auto' : 'none';
        el.style.zIndex = Math.round((rz + 1) * 5);

        posCache.current.set(name, { x: cx, y: cy, z: rz });
      });

      // Draw SVG connection lines between related skills (curved over globe)
      if (svg) {
        const lines = [];
        const selectedName = selected?.name;

        filteredSkills.forEach((skill) => {
          if (!skill.related) return;
          const fromPos = skillPositions[filteredSkills.findIndex(s => s.name === skill.name)];
          const from = posCache.current.get(skill.name);
          if (!from || from.z < -0.1 || !fromPos) return;

          skill.related.forEach((relName) => {
            const toPos = skillPositions[filteredSkills.findIndex(s => s.name === relName)];
            const to = posCache.current.get(relName);
            if (!to || to.z < -0.1 || !toPos) return;

            const isHighlighted = selectedName === skill.name || selectedName === relName;
            const opacity = isHighlighted ? 0.5 : 0.1;

            // Compute midpoint on sphere surface, then project
            const mx = fromPos.x + toPos.x;
            const my = fromPos.y + toPos.y;
            const mz = fromPos.z + toPos.z;
            const len = Math.sqrt(mx * mx + my * my + mz * mz) || 1;
            const midRx = (mx / len) * cosPhi + (mz / len) * sinPhi;
            const midRy = my / len;
            const midX = w / 2 + midRx * (w * 0.44);
            const midY = h / 2 - midRy * (h * 0.44);

            // Bulge midpoint outward from globe center
            const dx = (from.x + to.x) / 2 - w / 2;
            const dy = (from.y + to.y) / 2 - h / 2;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const bulge = 0.3;
            const cpX = midX + (dx / dist) * dist * bulge;
            const cpY = midY + (dy / dist) * dist * bulge;

            lines.push(
              `<path d="M${from.x},${from.y} Q${cpX},${cpY} ${to.x},${to.y}" fill="none" stroke="rgba(125,211,252,${opacity})" stroke-width="1" stroke-dasharray="${isHighlighted ? 'none' : '4 4'}"/>`
            );
          });
        });

        svg.innerHTML = lines.join('');
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [skillPositions, filteredSkills, selected]);

  const relatedNames = useMemo(() => {
    if (!selected) return new Set();
    const skill = SKILLS_DATA.find((s) => s.name === selected.name);
    return new Set(skill?.related || []);
  }, [selected]);

  const skillProjects = useMemo(() => {
    if (!selected) return [];
    const skill = SKILLS_DATA.find((s) => s.name === selected.name);
    return skill?.projects || [];
  }, [selected]);

  const handleSelect = useCallback((skill) => {
    setSelected((prev) => (prev?.name === skill.name ? null : skill));
  }, []);

  const handleFilterGroup = useCallback((group) => {
    setFilterGroup((prev) => (prev === group ? null : group));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterGroup(null);
    setSearchQuery('');
    setSelected(null);
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      searchRef.current?.blur();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const levelDots = selected ? (
    <div className="skill-level">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`skill-level-dot${n <= selected.level ? ' is-filled' : ''}`}
          style={n <= selected.level ? { background: GROUP_COLORS[selected.group] } : {}}
        />
      ))}
    </div>
  ) : null;

  // Smooth scroll-driven animation (0→1 over 300vh)
  // 0→0.2:   globe rises from bottom, only top half visible → fully visible
  // 0.2→0.5: globe holds, then shrinks to 55% + shifts left, sidebar slides in
  // 0.5→1:   normal layout

  // Phase 1 — Rise (0→20%): globe slides up from below
  const riseT = Math.min(overallProgress / 0.2, 1);
  const globeY = (1 - riseT) * 30; // 30vh → 0

  // Phase 2 — Transition (20%→50%): globe shrinks + moves left, sidebar appears
  const transitionT = Math.min(Math.max((overallProgress - 0.2) / 0.3, 0), 1);

  // Globe width: full width → 55%
  const globeFlexPercent = 100 - transitionT * 45;

  // Globe centering: translateX fades as sidebar takes its slot
  const globeTranslateX = (1 - transitionT);

  // Sidebar: slides in from right
  const sidebarOpacity = transitionT;
  const sidebarX = (1 - transitionT) * 60;

  const setItemRef = useCallback((name) => (el) => {
    if (el) itemRefs.current.set(name, el);
    else itemRefs.current.delete(name);
  }, []);

  return (
    <section
      id="skills"
      ref={(el) => {
        ref.current = el;
        sectionRef.current = el;
      }}
      className={`section section--skills reveal${visible ? ' is-visible' : ''}`}
      style={{ height: '200vh' }}
    >
      <div className="skills-sticky">
        <div className="skills-inner">
          <SectionHeader title="skills" number="02" visible={visible} />

          <div
            className="skills-intro"
            style={{ opacity: 1 - Math.min(overallProgress / 0.2, 1) }}
          >
            <h2 className="section-title">
              My<span className="section-accent"> toolkit</span>
              <span className="section-title-sub"> — technologies I work with daily</span>
            </h2>
            <p className="skills-intro-desc">
              A full-stack skill set spanning frontend frameworks, backend runtimes,
              databases, and devops tooling — always expanding.
            </p>
          </div>

          <div
            className="skills-phase"
          >
            {/* Globe + Skill Icons */}
            <div
              className="skills-globe-container"
              ref={globeWrapRef}
              style={{
                flex: `0 0 ${globeFlexPercent}%`,
                transform: `translateY(${globeY}vh) translateX(${globeTranslateX}px)`,
                willChange: 'transform',
              }}
            >
              {/* Globe visual — no extra transforms */}
              <div className="skills-globe-visual">
                <Globe
                  className="skills-globe"
                  scrollProgress={overallProgress}
                  phiRef={phiRef}
                  paused={!!selected}
                />
                <div className="skills-globe-glow" />
              </div>

              {/* Skill icons + connection lines */}
              <div
                className="skills-ring"
                ref={ringRef}
                style={{ opacity: transitionT }}
              >
                <svg ref={svgRef} className="skills-connections" />
                {filteredSkills.map((skill) => {
                  const Icon = ICON_MAP[skill.name] || FiSearch;
                  const isSelected = selected?.name === skill.name;
                  const isRelated = relatedNames.has(skill.name);

                  return (
                    <button
                      key={skill.name}
                      ref={setItemRef(skill.name)}
                      className={`skills-ring-item${isSelected ? ' is-selected' : ''}${isRelated ? ' is-related' : ''}${!isSelected && !isRelated && filterGroup ? ' is-dimmed' : ''}`}
                      style={{
                        '--item-color': GROUP_COLORS[skill.group],
                        left: '50%',
                        top: '50%',
                      }}
                      onClick={() => handleSelect(skill)}
                    >
                      <Icon className="skills-ring-icon" />
                      <span className="skills-ring-label">{skill.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar */}
            <div
              className="skills-sidebar"
              style={{
                transform: `translateX(${sidebarX}px)`,
                opacity: sidebarOpacity,
                maxWidth: `${transitionT * 380}px`,
                width: transitionT < 0.01 ? '0px' : `${transitionT * 100}%`,
                flexShrink: 0,
              }}
            >
              <div className="skills-search">
                <FiSearch className="skills-search-icon" />
                <input
                  ref={searchRef}
                  className="skills-search-input"
                  type="text"
                  placeholder="Search skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    className="skills-search-clear"
                    onClick={() => setSearchQuery('')}
                    tabIndex={-1}
                  >
                    <FiX />
                  </button>
                )}
              </div>

              <div
                className={`skill-info-panel ${selected ? 'is-visible' : ''}`}
                style={{
                  transform: `translate(${x * 2}px, ${y * 1}px)`,
                }}
              >
                {selected && (
                  <>
                    <div className="skill-info-header">
                      <span
                        className="skill-info-name"
                        style={{ color: GROUP_COLORS[selected.group] }}
                      >
                        {selected.name}
                      </span>
                      <span className="skill-info-group">{selected.group}</span>
                    </div>

                    {levelDots}

                    <p className="skill-info-desc">{selected.desc}</p>

                    {relatedNames.size > 0 && (
                      <div className="skill-related">
                        <span className="skill-related-label">Related</span>
                        <div className="skill-related-tags">
                          {[...relatedNames].map((name) => (
                            <span key={name} className="skill-related-tag">
                              {name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {skillProjects.length > 0 && (
                      <div className="skill-projects">
                        <span className="skill-projects-label">Used in</span>
                        <div className="skill-projects-links">
                          {skillProjects.map((pid) => (
                            <Link key={pid} to={`/project/${pid}`} className="skill-project-link">
                              {pid}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div
                className="skill-categories"
                style={{
                  transform: `translate(${x * 2}px, ${y * 1}px)`,
                }}
              >
                {Object.entries(GROUP_COLORS).map(([key, color]) => (
                  <button
                    key={key}
                    className={`skill-category ${filterGroup === key ? 'is-active' : ''}`}
                    onClick={() => handleFilterGroup(key)}
                  >
                    <span
                      className="skill-category-dot"
                      style={{
                        background: color,
                        opacity: filterGroup && filterGroup !== key ? 0.2 : 1,
                      }}
                    />
                    <span
                      className="skill-category-label"
                      style={{
                        opacity: filterGroup && filterGroup !== key ? 0.15 : 1,
                      }}
                    >
                      {key}
                    </span>
                    <span className="skill-category-count">{groupCounts[key]}</span>
                  </button>
                ))}

                {(filterGroup || searchQuery) && (
                  <button className="skill-category skill-category--clear" onClick={clearAllFilters}>
                    <span className="skill-category-label">Clear all</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
