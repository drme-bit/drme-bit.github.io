import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '@/hooks/useReveal';
import useScrollPhase from '@/hooks/useScrollPhase';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import Globe from '@/components/ui/Globe/Globe';
import { SKILLS_DATA, GROUP_COLORS, ICON_MAP } from './skillsData';
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
    let frame = 0;
    const isMobile = window.innerWidth <= 768;
    const tick = () => {
      frame++;
      if (isMobile && frame % 2 !== 0) { raf = requestAnimationFrame(tick); return; }
      const globeWrap = globeWrapRef.current;
      const ring = ringRef.current;
      const svg = svgRef.current;
      if (!globeWrap || !ring) { raf = requestAnimationFrame(tick); return; }

      const w = globeWrap.offsetWidth;
      const h = globeWrap.offsetHeight;
      const phi = phiRef.current;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);

      // Read computed colors once per frame (CSS vars don't resolve in innerHTML)
      const cs = getComputedStyle(document.body);
      const accentSecondary = cs.getPropertyValue('--accent-secondary').trim() || '#7dd3fc';
      const textGhost = cs.getPropertyValue('--text-ghost').trim() || 'rgba(255,255,255,0.17)';

      // z → opacity: front (z=1) → 1.0, equator (z=0) → 0.6, behind (z<0) → fades to 0
      const zToOpacity = (z) => {
        if (z < -0.15) return 0;
        if (z < 0) return ((z + 0.15) / 0.15) * 0.6;
        return 0.6 + z * 0.4;
      };

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

        const opacity = zToOpacity(rz);
        el.style.left = `${cx}px`;
        el.style.top = `${cy}px`;
        el.style.opacity = opacity;
        el.style.transform = `translate(-50%, -50%) scale(${0.65 + (rz + 1) * 0.35})`;
        el.style.pointerEvents = rz > 0 ? 'auto' : 'none';
        el.style.zIndex = Math.round((rz + 1) * 5);

        posCache.current.set(name, { x: cx, y: cy, z: rz });
      });

      // Draw SVG connection lines between related skills
      if (svg) {
        const lines = [];
        const selectedName = selected?.name;

        // Build a flat index: all SKILLS_DATA positions (always same sphere)
        const allIdxMap = new Map(SKILLS_DATA.map((s, i) => [s.name, i]));

        filteredSkills.forEach((skill) => {
          if (!skill.related) return;
          const from = posCache.current.get(skill.name);
          if (!from) return;

          skill.related.forEach((relName) => {
            const to = posCache.current.get(relName);
            if (!to) return;

            const isHighlighted = selectedName === skill.name || selectedName === relName;

            // Fade by average z-depth of both endpoints
            const avgZ = (from.z + to.z) / 2;
            const baseOpacity = isHighlighted ? 0.6 : 0.15;
            const opacity = baseOpacity * zToOpacity(avgZ);
            if (opacity < 0.01) return;

            // Compute midpoint on sphere surface for curved path
            const fi = allIdxMap.get(skill.name);
            const ti = allIdxMap.get(relName);
            if (fi === undefined || ti === undefined) return;
            const fp = skillPositions[fi];
            const tp = skillPositions[ti];
            if (!fp || !tp) return;

            const mx = fp.x + tp.x;
            const my = fp.y + tp.y;
            const mz = fp.z + tp.z;
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

            const color = isHighlighted ? accentSecondary : textGhost;
            const dash = isHighlighted ? '' : ' stroke-dasharray="4 4"';
            const sw = isHighlighted ? 1.5 : 0.8;

            lines.push(
              `<path d="M${from.x},${from.y} Q${cpX},${cpY} ${to.x},${to.y}" fill="none" stroke="${color}" stroke-width="${sw}"${dash} opacity="${opacity}"/>`
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

              {(searchQuery || filterGroup) && (
                <div className="skills-search-count">
                  {filteredSkills.length} of {SKILLS_DATA.length} skills
                </div>
              )}

              {filteredSkills.length === 0 && (searchQuery || filterGroup) && (
                <div className="skills-no-results">
                  No skills found. Try a different search or clear filters.
                </div>
              )}

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
