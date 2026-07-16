import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '@/hooks/useReveal';
import useScrollPhase from '@/hooks/useScrollPhase';
import Globe from '@/components/ui/Globe/Globe';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import { useTerrain } from '@/contexts/TerrainContext';
import { SKILLS_DATA, GROUP_COLORS, ICON_MAP } from './skillsData';
import { FiSearch, FiX } from 'react-icons/fi';
import './Skills.scss';

const SCROLL_PHASES = [
  { id: 'intro', start: 0, end: 0.25 },
  { id: 'transition', start: 0.25, end: 0.6 },
  { id: 'interactive', start: 0.6, end: 1 },
];

export default function Skills() {
  const [ref, visible] = useReveal();
  const [selected, setSelected] = useState(null);
  const [filterGroup, setFilterGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const terrain = useTerrain();
  const wasPausedRef = useRef(false);

  const { overallProgress, sectionRef } = useScrollPhase({
    phases: SCROLL_PHASES,
    sectionId: 'skills',
  });

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  // Pause terrain when Skills section is active
  useEffect(() => {
    if (visible && overallProgress > 0 && overallProgress < 0.9) {
      if (!terrain.paused) {
        wasPausedRef.current = false;
        terrain.setPaused(true);
      }
    } else if (wasPausedRef.current === false && terrain.paused) {
      terrain.setPaused(false);
    }
  }, [visible, overallProgress]);

  const filteredSkills = useMemo(() => {
    let result = SKILLS_DATA;
    if (filterGroup) result = result.filter((s) => s.group === filterGroup);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }
    return result;
  }, [filterGroup, searchQuery]);

  const filteredSkillNames = useMemo(() => {
    if (!filterGroup && !searchQuery) return null;
    return new Set(filteredSkills.map((s) => s.name));
  }, [filteredSkills, filterGroup, searchQuery]);

  const groupCounts = useMemo(
    () =>
      SKILLS_DATA.reduce((acc, s) => {
        acc[s.group] = (acc[s.group] || 0) + 1;
        return acc;
      }, {}),
    [],
  );

  const handleMarkerClick = useCallback((skillName) => {
    const skill = SKILLS_DATA.find((s) => s.name === skillName);
    if (!skill) return;
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

  // Scroll-driven animation values (works on both mobile and desktop)
  const riseT = Math.min(overallProgress / 0.25, 1);
  const transitionT = Math.min(Math.max((overallProgress - 0.15) / 0.35, 0), 1);
  
  // Globe: starts right and large, shrinks and moves center-left
  const globeScale = isMobile ? (1.05 - transitionT * 0.15) : (1.2 - transitionT * 0.3);
  const globeTranslateX = isMobile ? (20 - transitionT * 18) : (30 - transitionT * 40);
  
  // Header: fades up on scroll (starts fading immediately)
  const headerOpacity = 1 - Math.min(overallProgress / 0.18, 1);
  const headerY = -riseT * 50;
  
  // Sidebar: appears after globe starts moving
  const sidebarVisible = overallProgress > 0.1;

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
      <SectionHeader title="skills" number="02" visible={visible} />
      <div className="skills-sticky">

        {/* Header - left side, fades up on scroll */}
        <div
          className="skills-header"
          style={{
            opacity: headerOpacity,
            transform: `translateY(${headerY}vh)`,
          }}
        >
          <span className="skills-header-num">02</span>
          <h2 className="skills-header-title">
            skills<span className="skills-header-accent">_</span>
          </h2>
          <p className="skills-header-desc">
            Click any marker on the globe to explore a skill in detail
          </p>
        </div>

        {/* Main layout */}
        <div className="skills-layout">
          {/* Globe - right side, large */}
          <div
            className="skills-globe-area"
            style={{
              transform: `translateX(${globeTranslateX}vw) scale(${globeScale})`,
            }}
          >
            <Globe
              className="skills-globe"
              phiRef={phiRef}
              thetaRef={thetaRef}
              paused={!!selected}
              onMarkerClick={handleMarkerClick}
              selectedSkill={selected?.name}
              filteredSkills={filteredSkillNames}
            />
          </div>

          {/* Sidebar - slides in from right */}
          <div className={`skills-sidebar ${sidebarVisible ? 'is-visible' : ''}`}>
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

            <div className={`skill-info-panel ${selected ? 'is-visible' : ''}`}>
              {selected && (
                <>
                  <div className="skill-info-header">
                    {(() => {
                      const Icon = ICON_MAP[selected.name];
                      return Icon ? (
                        <Icon
                          className="skill-info-icon"
                          style={{ color: GROUP_COLORS[selected.group] }}
                        />
                      ) : null;
                    })()}
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

            <div className="skill-categories">
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
    </section>
  );
}
