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
  const [hoveredSkill, setHoveredSkill] = useState(null);
  const [animatedItems, setAnimatedItems] = useState(new Set());
  const searchRef = useRef(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const globeWrapRef = useRef(null);
  const ringRef = useRef(null);
  const svgRef = useRef(null);
  const itemRefs = useRef(new Map());
  const posCache = useRef(new Map());
  const { x, y } = useCursorParallax();

  const { overallProgress, sectionRef } = useScrollPhase({
    phases: SCROLL_PHASES,
    sectionId: 'skills',
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  const filteredSkills = useMemo(() => {
    let result = SKILLS_DATA;
    if (filterGroup) result = result.filter((s) => s.group === filterGroup);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (isMobile && result.length > 15) result = result.slice(0, 15);
    return result;
  }, [filterGroup, searchQuery]);

  const skillPositions = useMemo(() => {
    const n = filteredSkills.length;
    return filteredSkills.map((_, i) => {
      // Fibonacci sphere with clamped poles to avoid clustering
      const t = (i + 0.5) / n;
      const y = 1 - 2 * t; // 1 → -1
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
    [],
  );

  // Project skills onto 2D + draw connection lines
  useEffect(() => {
    const filteredIdxMap = new Map(filteredSkills.map((s, i) => [s.name, i]));
    const cs = getComputedStyle(document.body);
    let cachedAccent = cs.getPropertyValue('--accent-secondary').trim() || '#7dd3fc';
    let cachedGhost = cs.getPropertyValue('--text-ghost').trim() || 'rgba(255,255,255,0.17)';
    let lastPhi = phiRef.current;
    let lastTheta = thetaRef.current;
    let lastLines = '';

    const tick = () => {
      const globeWrap = globeWrapRef.current;
      const ring = ringRef.current;
      const svg = svgRef.current;
      if (!globeWrap || !ring) {
        rafId = requestAnimationFrame(tick);
        return;
      }

      const phi = phiRef.current;
      const theta = thetaRef.current;
      if (phi === lastPhi && theta === lastTheta) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      lastPhi = phi;
      lastTheta = theta;

      const w = globeWrap.clientWidth;
      const h = globeWrap.clientHeight;
      const cosPhi = Math.cos(phi);
      const sinPhi = Math.sin(phi);
      const cosTheta = Math.cos(theta);
      const sinTheta = Math.sin(theta);

      const zToOpacity = (z) => {
        if (z < -0.15) return 0;
        if (z < 0) return ((z + 0.15) / 0.15) * 0.6;
        return 0.6 + z * 0.4;
      };

      posCache.current.clear();
      itemRefs.current.forEach((el, name) => {
        if (!el) return;
        const idx = filteredIdxMap.get(name);
        if (idx === undefined) {
          el.style.opacity = '0';
          return;
        }
        const pos = skillPositions[idx];
        if (!pos) return;

        // Match cobe rotation order: phi (Y-axis) first, then theta (X-axis)
        const rx0 = pos.x * cosPhi + pos.z * sinPhi;
        const ry0 = pos.y;
        const rz0 = -pos.x * sinPhi + pos.z * cosPhi;

        const rx = rx0;
        const ry = ry0 * cosTheta - rz0 * sinTheta;
        const rz = ry0 * sinTheta + rz0 * cosTheta;

        const cx = w / 2 + rx * (w * 0.48);
        const cy = h / 2 - ry * (h * 0.48);

        const opacity = zToOpacity(rz);
        const scale = 0.65 + (rz + 1) * 0.35;
        el.style.transform = `translate(calc(${cx}px - 50%), calc(${cy}px - 50%)) scale(${scale})`;
        el.style.opacity = opacity;
        el.style.pointerEvents = rz > 0 ? 'auto' : 'none';
        el.style.zIndex = Math.round((rz + 1) * 5);

        posCache.current.set(name, { x: cx, y: cy, z: rz });
      });

      if (svg) {
        const lines = [];
        const selectedName = selected?.name;

        filteredSkills.forEach((skill) => {
          if (!skill.related) return;
          const from = posCache.current.get(skill.name);
          if (!from) return;

          skill.related.forEach((relName) => {
            const to = posCache.current.get(relName);
            if (!to) return;

            const isHighlighted = selectedName === skill.name || selectedName === relName;

            const avgZ = (from.z + to.z) / 2;
            const baseOpacity = isHighlighted ? 0.6 : 0.15;
            const opacity = baseOpacity * zToOpacity(avgZ);
            if (opacity < 0.01) return;

            const midX = (from.x + to.x) / 2;
            const midY = (from.y + to.y) / 2;
            const dx = midX - w / 2;
            const dy = midY - h / 2;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const bulge = 0.3;
            const cpX = midX + (dx / dist) * dist * bulge;
            const cpY = midY + (dy / dist) * dist * bulge;

            const color = isHighlighted ? cachedAccent : cachedGhost;
            const dash = isHighlighted ? '' : ' stroke-dasharray="4 4"';
            const sw = isHighlighted ? 1.5 : 0.8;

            lines.push(
              `<path d="M${from.x},${from.y} Q${cpX},${cpY} ${to.x},${to.y}" fill="none" stroke="${color}" stroke-width="${sw}"${dash} opacity="${opacity}"/>`,
            );
          });
        });

        const newLines = lines.join('');
        if (newLines !== lastLines) {
          svg.innerHTML = newLines;
          lastLines = newLines;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    let rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
    };
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

  // Animate skill items on first visible
  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => {
      filteredSkills.forEach((skill, i) => {
        setTimeout(() => {
          setAnimatedItems(prev => new Set([...prev, skill.name]));
        }, i * 50);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [visible, filteredSkills]);

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
  // On mobile: simplified version — globe takes full width, sidebar below
  const riseT = isMobile
    ? Math.min(overallProgress / 0.15 + 0.3, 1)
    : Math.min(overallProgress / 0.2, 1);
  const globeY = isMobile ? (1 - riseT) * 20 : (1 - riseT) * 30;

  const transitionT = isMobile ? 1 : Math.min(Math.max((overallProgress - 0.2) / 0.3, 0), 1);

  const globeFlexPercent = isMobile ? 100 : 100 - transitionT * 45;
  const globeTranslateX = isMobile ? 0 : 1 - transitionT;

  const sidebarOpacity = isMobile ? (visible ? 1 : 0) : transitionT;
  const sidebarX = isMobile ? 0 : (1 - transitionT) * 60;

  const setItemRef = useCallback(
    (name) => (el) => {
      if (el) itemRefs.current.set(name, el);
      else itemRefs.current.delete(name);
    },
    [],
  );

  return (
    <section
      id="skills"
      ref={(el) => {
        ref.current = el;
        sectionRef.current = el;
      }}
      className={`section section--skills reveal${visible ? ' is-visible' : ''}`}
      style={{ height: isMobile ? '150vh' : '200vh', transition: 'height 0.3s ease-out', paddingTop: '15vh',  }}
    >
      <SectionHeader title="skills" number="02" visible={visible} />

      <div
        className="skills-intro"
        style={{ opacity: isMobile ? 1 : 1 - Math.min(overallProgress / 0.2, 1) }}
      >
        <h2 className="section-title">
          My<span className="section-accent"> toolkit</span>
          <span className="section-title-sub"> — technologies I work with daily</span>
        </h2>
        <p className="skills-intro-desc">
          A full-stack skill set spanning frontend frameworks, backend runtimes, databases, and
          devops tooling — always expanding.
        </p>
      </div>

      <div className="skills-sticky">
        <div className="skills-phase">
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
                thetaRef={thetaRef}
                paused={!!selected}
              />
              <div className="skills-globe-glow" />
            </div>

            {/* Skill icons + connection lines */}
            <div className="skills-ring" ref={ringRef}>
              <svg ref={svgRef} className="skills-connections" />
              {filteredSkills.map((skill, i) => {
                  const Icon = ICON_MAP[skill.name] || FiSearch;
                  const isSelected = selected?.name === skill.name;
                  const isRelated = relatedNames.has(skill.name);

                  const isAnimated = animatedItems.has(skill.name);
                  const isHovered = hoveredSkill === skill.name;

                  return (
                    <button
                      key={skill.name}
                      ref={setItemRef(skill.name)}
                      className={`skills-ring-item${isSelected ? ' is-selected' : ''}${isRelated ? ' is-related' : ''}${!isSelected && !isRelated && filterGroup ? ' is-dimmed' : ''}${isAnimated ? ' is-animated' : ''}${isHovered ? ' is-hovered' : ''}`}
                      style={{
                        '--item-color': GROUP_COLORS[skill.group],
                        '--anim-delay': `${i * 50}ms`,
                      }}
                      onClick={() => handleSelect(skill)}
                      onMouseEnter={() => setHoveredSkill(skill.name)}
                      onMouseLeave={() => setHoveredSkill(null)}
                    >
                      <Icon className="skills-ring-icon" />
                      <span className="skills-ring-tooltip">{skill.name}</span>
                      <span className="skills-ring-pulse" />
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
                  <button
                    className="skill-category skill-category--clear"
                    onClick={clearAllFilters}
                  >
                    <span className="skill-category-label">Clear all</span>
                  </button>
                )}
              </div>
            </div>
          </div>
      </div>
    </section>
  );
}
