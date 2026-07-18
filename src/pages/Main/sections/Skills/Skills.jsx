import { useState, useCallback, useMemo, useRef, useEffect, lazy } from 'react';
import useReveal from '@/hooks/useReveal';
import useScrollPhase from '@/hooks/useScrollPhase';
import useIsMobile from '@/hooks/useIsMobile';

const Globe = lazy(() => import('@/components/ui/Globe/Globe'));
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import { useScene } from '@/contexts/SceneContext';
import { useModal } from '@/contexts/ModalContext';
import { SKILLS_DATA, GROUP_COLORS, ICON_MAP } from './skillsData';
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import './Skills.scss';

const GROUP_OPTIONS = Object.entries(GROUP_COLORS).map(([key, color]) => ({ key, color }));

const GROUP_COUNTS = {};
GROUP_OPTIONS.forEach(({ key }) => {
  GROUP_COUNTS[key] = SKILLS_DATA.filter((s) => s.group === key).length;
});

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

        {skill.desc && <p className="skills-sheet-desc">{skill.desc}</p>}

        {related.length > 0 && (
          <div className="skills-sheet-section">
            <h4 className="skills-sheet-section-title">Related</h4>
            <div className="skills-sheet-tags">
              {related.map((r) => (
                <span key={r} className="skills-sheet-tag">{r}</span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className="skills-sheet-section">
            <h4 className="skills-sheet-section-title">Used in</h4>
            <div className="skills-sheet-tags">
              {projects.map((p) => (
                <span key={p} className="skills-sheet-tag skills-sheet-tag--project">{p}</span>
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
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const globeRef = useRef(null);
  const sectionElRef = useRef(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const debounceRef = useRef(null);
  const { showScene, hideScene } = useScene();
  const { openModal } = useModal();
  const isMobile = useIsMobile();

  const { getProgress, sectionRef } = useScrollPhase({
    phases: [
      { id: 'intro', start: 0, end: 0.25 },
      { id: 'transition', start: 0.25, end: 0.6 },
      { id: 'interactive', start: 0.6, end: 1 },
    ],
    sectionId: 'skills',
  });

  // ── DOM-direct scroll animation (zero React re-renders) ──
  const wasSceneVisible = useRef(true);
  const wasGlobeDisabled = useRef(true);
  const wasFiltersVisible = useRef(false);

  useEffect(() => {
    const el = sectionElRef.current;
    if (!el) return;
    let rafId;

    const tick = () => {
      const p = getProgress();

      // CSS custom properties — drives all scroll-based styles
      el.style.setProperty('--sp', p);
      el.style.setProperty('--rise', Math.min(p / 0.25, 1));
      el.style.setProperty('--transition', Math.min(Math.max((p - 0.15) / 0.35, 0), 1));
      el.style.setProperty('--header-opacity', 1 - Math.min(p / 0.2, 1));

      // Scene crossfade — only call context when crossing threshold
      const sceneVisible = p <= 0.02 || p >= 0.96;
      if (sceneVisible !== wasSceneVisible.current) {
        wasSceneVisible.current = sceneVisible;
        if (sceneVisible) showScene(); else hideScene();
      }

      // Globe disabled state — only call when crossing threshold
      const globeDisabled = p < 0.6;
      if (globeDisabled !== wasGlobeDisabled.current) {
        wasGlobeDisabled.current = globeDisabled;
        globeRef.current?.setDisabled(globeDisabled);
      }

      // Filters visibility — toggle CSS class directly
      const filtersVis = p > 0.3;
      if (filtersVis !== wasFiltersVisible.current) {
        wasFiltersVisible.current = filtersVis;
        el.classList.toggle('filters-visible', filtersVis);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getProgress, showScene, hideScene]);

  // Search — immediate display, debounced filter via manager
  const handleSearchInput = useCallback((value) => {
    setInputValue(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      globeRef.current?.search(value || null);
    }, 200);
  }, []);

  const clearSearch = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setInputValue('');
    globeRef.current?.search(null);
  }, []);

  // Filter by group via manager
  const handleFilterGroup = useCallback((group) => {
    const next = filterGroup === group ? null : group;
    setFilterGroup(next);
    setDropdownOpen(false);
    globeRef.current?.setFilter(next);
  }, [filterGroup]);

  const clearAllFilters = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFilterGroup(null);
    setInputValue('');
    globeRef.current?.reset();
  }, []);

  // Marker click via manager
  const handleMarkerClick = useCallback((skillName) => {
    const skill = SKILLS_DATA.find((s) => s.name === skillName);
    if (!skill) return;
    globeRef.current?.select(skillName);
    openSkillModal(openModal, skill, () => globeRef.current?.select(null));
  }, [openModal]);

  // Keyboard
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        setInputValue('');
        globeRef.current?.search(null);
        searchRef.current?.blur();
        setDropdownOpen(false);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const hasFilters = filterGroup || inputValue;

  return (
    <section
      id="skills"
      ref={(el) => {
        ref.current = el;
        sectionRef.current = el;
        sectionElRef.current = el;
      }}
      className={`section section--skills reveal${visible ? ' is-visible' : ''}`}
      style={{ height: '200vh' }}
    >
      <SectionHeader title="skills" number="02" visible={visible} />

      <div className="skills-sticky">
        <div className="skills-header">
          <span className="skills-header-num">02</span>
          <h2 className="skills-header-title">
            skills<span className="skills-header-accent">_</span>
          </h2>
          <p className="skills-header-desc">
            Click any marker on the globe to explore a skill in detail
          </p>
        </div>

        <div className="skills-filters">
          <div className="skills-search">
            <FiSearch className="skills-search-icon" />
            <input
              ref={searchRef}
              className="skills-search-input"
              type="text"
              placeholder="Search skills..."
              value={inputValue}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            {inputValue && (
              <button className="skills-search-clear" onClick={clearSearch} tabIndex={-1}>
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
                    <span className="skills-filter-option-count">{GROUP_COUNTS[key]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <button className="skills-filter-clear" onClick={clearAllFilters}>
              <FiX size={12} />
            </button>
          )}
        </div>

        <div className="skills-layout">
          <div className="skills-globe-area">
            <Globe
              ref={globeRef}
              className="skills-globe"
              phiRef={phiRef}
              thetaRef={thetaRef}
              onMarkerClick={handleMarkerClick}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
