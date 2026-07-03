import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '@/hooks/useReveal';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import SkillsGlobe, { SKILLS_DATA, GROUP_COLORS } from './SkillsGlobe';
import useCursorParallax from '@/hooks/useCursorParallax';
import './Skills.scss';

export default function Skills() {
  const [ref, visible] = useReveal();
  const [selected, setSelected] = useState(SKILLS_DATA[0]);
  const [filterGroup, setFilterGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);
  const { x, y } = useCursorParallax();

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

  const groupCounts = useMemo(() =>
    SKILLS_DATA.reduce((acc, s) => { acc[s.group] = (acc[s.group] || 0) + 1; return acc; }, {}),
  []);

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

  const hasActiveFilter = filterGroup || searchQuery;

  const relatedNames = useMemo(() => {
    if (!selected) return new Set();
    const skill = SKILLS_DATA.find(s => s.name === selected.name);
    return new Set(skill?.related || []);
  }, [selected]);

  const skillProjects = useMemo(() => {
    if (!selected) return [];
    const skill = SKILLS_DATA.find(s => s.name === selected.name);
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

  return (
    <section id="skills" ref={ref} className={`section section--skills reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="skills" number="02" visible={visible} />
      <div className="section-inner">
        <h2 className="section-title">
          Tools &<span className="section-accent"> technologies</span>
          <span className="section-title-sub"> — click a node to learn more</span>
        </h2>

        <div className="skills-layout">
          <div className="skills-globe-wrap" style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}>
            <SkillsGlobe selected={selected} onSelect={handleSelect} filterGroup={filterGroup} searchQuery={searchQuery} />
          </div>

          <div className="skills-sidebar">
            <div className="skills-search">
              <input
                ref={searchRef}
                className="skills-search-input"
                type="text"
                placeholder="Search skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="skills-search-clear" onClick={() => setSearchQuery('')} tabIndex={-1}>
                  &times;
                </button>
              )}
            </div>

            <div className={`skill-info-wrap${selected ? ' is-visible' : ''}`} style={{ transform: `translate(${x * 2}px, ${y * 1}px)` }}>
              <aside className="skill-info">
                {selected && (
                  <>
                    <span className="skill-info-name" style={{ color: GROUP_COLORS[selected.group] }}>{selected.name}</span>
                    <span className="skill-info-group" style={{ color: GROUP_COLORS[selected.group] }}>{selected.group}</span>
                    {levelDots}
                    <p className="skill-info-desc">{selected.desc}</p>
                    {relatedNames.size > 0 && (
                      <div className="skill-related">
                        <span className="skill-related-label">Related</span>
                        <div className="skill-related-tags">
                          {[...relatedNames].map((name) => (
                            <span key={name} className="skill-related-tag">{name}</span>
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
              </aside>
            </div>

            <div className="skill-categories" style={{ transform: `translate(${x * 2}px, ${y * 1}px)` }}>
              {Object.entries(GROUP_COLORS).map(([key, color]) => (
                <button
                  key={key}
                  className={`skill-category${filterGroup === key ? ' is-active' : ''}`}
                  onClick={() => handleFilterGroup(key)}
                >
                  <span className="skill-category-dot" style={{ background: color, opacity: filterGroup && filterGroup !== key ? 0.2 : 1 }} />
                  <span className="skill-category-label" style={{ opacity: filterGroup && filterGroup !== key ? 0.15 : 1 }}>{key}</span>
                  <span className="skill-category-count">{groupCounts[key]}</span>
                </button>
              ))}
              {hasActiveFilter && (
                <button className="skill-category skill-category--clear" onClick={clearAllFilters}>
                  <span className="skill-category-label">Clear</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
