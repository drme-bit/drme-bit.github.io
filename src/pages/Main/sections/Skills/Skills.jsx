import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useReveal from '@/hooks/useReveal';
import useScrollPhase from '@/hooks/useScrollPhase';
import Globe from '@/components/ui/Globe/Globe';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import { useScene } from '@/contexts/SceneContext';
import { useModal } from '@/contexts/ModalContext';
import { SKILLS_DATA, GROUP_COLORS, ICON_MAP } from './skillsData';
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import './Skills.scss';

const SCROLL_PHASES = [
  { id: 'intro', start: 0, end: 0.25 },
  { id: 'transition', start: 0.25, end: 0.6 },
  { id: 'interactive', start: 0.6, end: 1 },
];

const GROUP_OPTIONS = Object.entries(GROUP_COLORS).map(([key, color]) => ({ key, color }));

function openSkillModal(openModal, skill, onClose) {
  const Icon = ICON_MAP[skill.name];
  const related = SKILLS_DATA.find((s) => s.name === skill.name)?.related || [];
  const projects = SKILLS_DATA.find((s) => s.name === skill.name)?.projects || [];

  openModal({
    className: 'modal-panel--skills-sheet',
    onClose,
    content: (
      <div className="skills-sheet-content">
        <div className="skills-mobile-sheet-handle" />

        <div className="skills-mobile-sheet-header">
          <div className="skills-mobile-sheet-icon-wrap" style={{ '--card-color': GROUP_COLORS[skill.group] }}>
            {Icon && <Icon className="skills-mobile-sheet-icon" />}
          </div>
          <div className="skills-mobile-sheet-titles">
            <span className="skills-mobile-sheet-name" style={{ color: GROUP_COLORS[skill.group] }}>
              {skill.name}
            </span>
            <span className="skills-mobile-sheet-group">{skill.group}</span>
          </div>
        </div>

        <div className="skill-level">
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`skill-level-dot${n <= skill.level ? ' is-filled' : ''}`}
              style={n <= skill.level ? { background: GROUP_COLORS[skill.group] } : {}}
            />
          ))}
        </div>

        <p className="skills-mobile-sheet-desc">{skill.desc}</p>

        {related.length > 0 && (
          <div className="skills-mobile-sheet-section">
            <span className="skills-mobile-sheet-label">Related</span>
            <div className="skills-mobile-sheet-tags">
              {related.map((name) => (
                <span key={name} className="skill-related-tag">{name}</span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="skills-mobile-sheet-section">
            <span className="skills-mobile-sheet-label">Used in</span>
            <div className="skills-mobile-sheet-tags">
              {projects.map((pid) => (
                <Link key={pid} to={`/project/${pid}`} className="skill-project-link">
                  {pid}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
  });
}

export default function Skills() {
  const [ref, visible] = useReveal();
  const [filterGroup, setFilterGroup] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const { showScene, hideScene } = useScene();
  const { openModal } = useModal();

  const { overallProgress, sectionRef } = useScrollPhase({
    phases: SCROLL_PHASES,
    sectionId: 'skills',
  });

  // Smooth scene visibility — crossfade
  useEffect(() => {
    if (overallProgress > 0.02 && overallProgress < 0.96) {
      hideScene();
    } else {
      showScene();
    }
  }, [overallProgress, hideScene, showScene]);

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

  const handleMarkerClick = useCallback((skillName) => {
    const skill = SKILLS_DATA.find((s) => s.name === skillName);
    if (!skill) return;
    setSelectedSkill(skillName);
    openSkillModal(openModal, skill, () => setSelectedSkill(null));
  }, [openModal]);

  const handleFilterGroup = useCallback((group) => {
    setFilterGroup((prev) => (prev === group ? null : group));
    setDropdownOpen(false);
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilterGroup(null);
    setSearchQuery('');
  }, []);

  const handleKey = useCallback((e) => {
    if (e.key === 'Escape') {
      setSearchQuery('');
      searchRef.current?.blur();
      setDropdownOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const isMobile = window.innerWidth < 768;

  // Scroll-driven animation values
  const riseT = Math.min(overallProgress / 0.25, 1);
  const transitionT = Math.min(Math.max((overallProgress - 0.15) / 0.35, 0), 1);

  // Header fades up and out as scroll progresses
  const headerOpacity = 1 - Math.min(overallProgress / 0.2, 1);
  const headerY = isMobile ? (riseT * -30) : (riseT * -60);

  // Globe starts right, moves to center on scroll
  const globeX = isMobile ? (0 - transitionT * 0) : (5 - transitionT * 25); // 25vw → 5vw
  const globeScale = isMobile ? (1.05 - transitionT * -0.25) : (1.05 - transitionT * 0.1);

  const filtersVisible = overallProgress > 0.3;

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
        {/* Header — left side, fades up on scroll */}
        <div
          className="skills-header"
          style={{
            opacity: headerOpacity,
            transform: `translateY(${headerY}px)`,
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

        {/* Compact filter bar — centered top */}
        <div className={`skills-filters ${filtersVisible ? 'is-visible' : ''}`} style={{ top: isMobile ? '-10vh' : '10vh' }}>
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
              <button className="skills-search-clear" onClick={() => setSearchQuery('')} tabIndex={-1}>
                <FiX />
              </button>
            )}
          </div>

          <div className="skills-filter-dropdown" ref={dropdownRef}>
            <button
              className={`skills-filter-trigger ${filterGroup ? 'is-active' : ''}`}
              onClick={() => setDropdownOpen((p) => !p)}
            >
              <span
                className="skills-filter-dot"
                style={{ background: filterGroup ? GROUP_COLORS[filterGroup] : 'var(--text-ghost)' }}
              />
              <span className="skills-filter-label">{filterGroup || 'all'}</span>
              <FiChevronDown className={`skills-filter-chevron ${dropdownOpen ? 'is-open' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="skills-filter-menu">
                <button
                  className={`skills-filter-option ${!filterGroup ? 'is-active' : ''}`}
                  onClick={() => handleFilterGroup(null)}
                >
                  all
                  <span className="skills-filter-option-count">{SKILLS_DATA.length}</span>
                </button>
                {GROUP_OPTIONS.map(({ key, color }) => (
                  <button
                    key={key}
                    className={`skills-filter-option ${filterGroup === key ? 'is-active' : ''}`}
                    onClick={() => handleFilterGroup(key)}
                  >
                    <span className="skills-filter-dot" style={{ background: color }} />
                    {key}
                    <span className="skills-filter-option-count">
                      {SKILLS_DATA.filter((s) => s.group === key).length}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {(searchQuery || filterGroup) && (
            <span className="skills-filter-count">
              {filteredSkills.length}/{SKILLS_DATA.length}
            </span>
          )}

          {(searchQuery || filterGroup) && (
            <button className="skills-filter-clear" onClick={clearAllFilters}>
              <FiX size={12} />
            </button>
          )}
        </div>

        {/* Globe — right side, moves to center on scroll */}
        <div className="skills-layout">
          <div
            className="skills-globe-area"
            style={{
              transform: `translateX(${globeX}vw) scale(${globeScale})`,
            }}
          >
            <Globe
              className="skills-globe"
              phiRef={phiRef}
              thetaRef={thetaRef}
              paused={false}
              onMarkerClick={transitionT >= 1 ? handleMarkerClick : undefined}
              selectedSkill={selectedSkill}
              filteredSkills={filteredSkillNames}
              markersDisabled={transitionT < 1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
