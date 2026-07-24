'use client';

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import useReveal from '@/shared/hooks/useReveal';
import useScrollPhase from '@/shared/hooks/useScrollPhase';
import useMergedRef from '@/shared/hooks/useMergedRef';
import { SKILLS_DATA, GROUP_COLORS, ICON_MAP } from './skillsData';
import type { SkillItem } from './skillsData';
import { getProjectById } from '@/data/projectsData';
import { FiSearch, FiX, FiChevronDown, FiMove, FiMousePointer, FiSliders, FiCopy, FiClock, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import styles from './Skills.module.scss';

const Globe = lazy(() => import('@/shared/ui/organisms/Globe/Globe'));

/* ─── Types ──────────────────────────────────────────────── */

interface GroupOption {
  key: string;
  color: string;
}

/* ─── Derived data ───────────────────────────────────────── */

const GROUP_OPTIONS: GroupOption[] = Object.entries(GROUP_COLORS).map(([key, color]) => ({ key, color }));

const GROUP_COUNTS: Record<string, number> = {};
GROUP_OPTIONS.forEach(({ key }) => {
  GROUP_COUNTS[key] = SKILLS_DATA.filter((s) => s.group === key).length;
});

/* ─── Helpers ────────────────────────────────────────────── */

const EXPLORER_GUIDE = [
  { step: '01', icon: FiMove, title: 'Rotate', detail: 'drag the globe' },
  { step: '02', icon: FiMousePointer, title: 'Inspect', detail: 'select a marker' },
  { step: '03', icon: FiSliders, title: 'Refine', detail: 'search or filter' },
];

const LEVEL_LABELS: Record<number, string> = {
  1: 'Learning',
  2: 'Familiar',
  3: 'Proficient',
  4: 'Advanced',
  5: 'Expert',
};

const MAX_HISTORY = 5;

/* ─── Skills ─────────────────────────────────────────────── */

export default function Skills() {
  const [ref, visible] = useReveal();
  const [filterGroup, setFilterGroup] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSkill, setCompareSkill] = useState<SkillItem | null>(null);
  const [history, setHistory] = useState<SkillItem[]>([]);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<{ setDisabled: (v: boolean) => void; search: (v: string | null) => void; setFilter: (v: string | null) => void; reset: () => void; select: (v: string | null) => void } | null>(null);
  const sectionElRef = useRef<HTMLElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getProgress, sectionRef } = useScrollPhase({
    phases: [
      { id: 'intro', start: 0, end: 0.25 },
      { id: 'transition', start: 0.25, end: 0.6 },
      { id: 'interactive', start: 0.6, end: 1 },
    ],
    sectionId: 'skills',
  });
  const mergedRef = useMergedRef<HTMLElement>(ref, sectionRef, sectionElRef);

  // ── DOM-direct scroll animation (zero React re-renders) ──
  const wereFiltersVisible = useRef(false);

  useEffect(() => {
    const el = sectionElRef.current;
    if (!el) return;
    let rafId: number;

    const tick = () => {
      const p = getProgress();

      const headerProgress = Math.min(p / 0.32, 1);
      const globeProgress = Math.min(Math.max((p - 0.08) / 0.45, 0), 1);
      const tipsProgress = Math.min(Math.max((p - 0.46) / 0.2, 0), 1);
      const filtersProgress = Math.min(Math.max((p - 0.62) / 0.16, 0), 1);
      const cardsProgress = Math.min(Math.max((p - 0.15) / 0.3, 0), 1);

      el.style.setProperty('--header-opacity', String(1 - headerProgress));
      el.style.setProperty('--header-x', `${headerProgress * -4}vw`);
      el.style.setProperty('--header-y', `${headerProgress * -1.5}rem`);
      el.style.setProperty('--globe-size', `${385 + globeProgress * 135}px`);
      el.style.setProperty('--globe-x', `${(1 - globeProgress) * 13}vw`);
      el.style.setProperty('--tips-opacity', String(tipsProgress));
      el.style.setProperty('--tips-x', `${(1 - tipsProgress) * 6}rem`);
      el.style.setProperty('--tips-y', `${(1 - tipsProgress) * 0.75}rem`);
      el.style.setProperty('--filters-opacity', String(filtersProgress));
      el.style.setProperty('--filters-y', `${(1 - filtersProgress) * -0.75}rem`);
      el.style.setProperty('--cards-opacity', String(cardsProgress));
      el.style.setProperty('--card-1-y', `${(1 - cardsProgress) * 40}px`);
      el.style.setProperty('--card-2-y', `${(1 - cardsProgress) * 60}px`);

      const filtersVisible = p > 0.62;
      if (filtersVisible !== wereFiltersVisible.current) {
        wereFiltersVisible.current = filtersVisible;
        el.classList.toggle(styles['filters-visible'], filtersVisible);
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [getProgress]);

  const addToHistory = useCallback((skill: SkillItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.name !== skill.name);
      return [skill, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const handleSearchInput = useCallback((value: string) => {
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

  const handleFilterGroup = useCallback((group: string | null) => {
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

  const handleMarkerClick = useCallback((skillName: string) => {
    const p = getProgress();
    if (p < 0.6) return;
    const skill = SKILLS_DATA.find((s) => s.name === skillName);
    if (!skill) return;
    globeRef.current?.select(skillName);
    addToHistory(skill);
    if (compareMode) {
      if (!selectedSkill) {
        setSelectedSkill(skill);
      } else if (!compareSkill) {
        setCompareSkill(skill);
      }
    } else {
      setSelectedSkill(skill);
    }
  }, [getProgress, compareMode, selectedSkill, compareSkill, addToHistory]);

  const closePanel = useCallback(() => {
    setSelectedSkill(null);
    setCompareSkill(null);
    setCompareMode(false);
    globeRef.current?.select(null);
  }, []);

  const toggleCompareMode = useCallback(() => {
    if (compareMode) {
      setCompareMode(false);
      setCompareSkill(null);
    } else {
      setCompareMode(true);
    }
  }, [compareMode]);

  const navigateHistory = useCallback((direction: 'prev' | 'next') => {
    if (!selectedSkill || history.length === 0) return;
    const currentIndex = history.findIndex((s) => s.name === selectedSkill.name);
    let newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = history.length - 1;
    if (newIndex >= history.length) newIndex = 0;
    setSelectedSkill(history[newIndex]);
    globeRef.current?.select(history[newIndex].name);
  }, [selectedSkill, history]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (compareMode) {
          toggleCompareMode();
        } else if (selectedSkill) {
          closePanel();
        } else {
          if (debounceRef.current) clearTimeout(debounceRef.current);
          setInputValue('');
          globeRef.current?.search(null);
          searchRef.current?.blur();
          setDropdownOpen(false);
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [selectedSkill, closePanel, compareMode, toggleCompareMode]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const hasFilters = filterGroup || inputValue;

  const renderSkillPanel = (skill: SkillItem, isCompare = false) => (
    <div className={styles['skills-panel-content']}>
      <div className={styles['skills-panel-header']}>
        <div className={styles['skills-panel-icon-wrap']} style={{ '--card-color': GROUP_COLORS[skill.group] } as React.CSSProperties}>
          {ICON_MAP[skill.name] && (
            <span className={styles['skills-panel-icon']}>
              {(() => { const Icon = ICON_MAP[skill.name]; return <Icon />; })()}
            </span>
          )}
        </div>
        <div className={styles['skills-panel-titles']}>
          <span className={styles['skills-panel-name']} style={{ color: GROUP_COLORS[skill.group] }}>
            {skill.name}
          </span>
          <span className={styles['skills-panel-group']}>{skill.group}</span>
        </div>
      </div>

      <div className={styles['skills-panel-level']}>
        <div className={styles['skills-panel-level-bar']}>
          <div
            className={styles['skills-panel-level-fill']}
            style={{ width: `${(skill.level / 5) * 100}%`, background: GROUP_COLORS[skill.group] }}
          />
        </div>
        <span className={styles['skills-panel-level-label']} style={{ color: GROUP_COLORS[skill.group] }}>
          {LEVEL_LABELS[skill.level]}
        </span>
      </div>

      {skill.funLevel && (
        <p className={styles['skills-panel-fun']}>&quot;{skill.funLevel}&quot;</p>
      )}

      {skill.desc && (
        <p className={styles['skills-panel-desc']}>{skill.desc}</p>
      )}

      {skill.related.length > 0 && (
        <div className={styles['skills-panel-section']}>
          <h4 className={styles['skills-panel-section-title']}>Works well with</h4>
          <div className={styles['skills-panel-related']}>
            <div className={styles['skills-panel-related-center']}>
              {ICON_MAP[skill.name] ? (
                <span className={styles['skills-panel-related-icon']} style={{ background: GROUP_COLORS[skill.group] }}>
                  {(() => { const Icon = ICON_MAP[skill.name]; return <Icon />; })()}
                </span>
              ) : (
                <span className={styles['skills-panel-related-node']} style={{ background: GROUP_COLORS[skill.group] }}>
                  {skill.name.slice(0, 2)}
                </span>
              )}
            </div>
            {skill.related.map((r, i) => {
              const relatedSkill = SKILLS_DATA.find((s) => s.name === r);
              const RelatedIcon = ICON_MAP[r];
              return (
                <span key={r} style={{ display: 'contents' }}>
                  {i > 0 && <span className={styles['skills-panel-related-separator']} />}
                  <button
                    className={styles['skills-panel-related-item']}
                    onClick={() => {
                      if (relatedSkill) {
                        setSelectedSkill(relatedSkill);
                        addToHistory(relatedSkill);
                        globeRef.current?.select(r);
                      }
                    }}
                  >
                    <span className={styles['skills-panel-related-dot']} style={{ background: relatedSkill ? GROUP_COLORS[relatedSkill.group] : 'var(--border)' }}>
                      {RelatedIcon && <RelatedIcon />}
                    </span>
                    <span className={styles['skills-panel-related-name']}>{r}</span>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {skill.projects.length > 0 && (
        <div className={styles['skills-panel-section']}>
          <h4 className={styles['skills-panel-section-title']}>Used In Projects</h4>
          <div className={styles['skills-panel-projects']}>
            {skill.projects.map((p) => {
              const project = getProjectById(p.toLowerCase().replace(/\s+/g, '-'));
              if (!project) return null;
              return (
                <button
                  key={p}
                  className={styles['skills-panel-project-card']}
                  onClick={() => {
                    closePanel();
                    const el = document.getElementById(p.toLowerCase().replace(/\s+/g, '-'));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  <div className={styles['skills-panel-project-image']}>
                    {project.image && (
                      <img src={project.image} alt="" className={styles['skills-panel-project-img']} />
                    )}
                    <div className={styles['skills-panel-project-overlay']} />
                  </div>
                  <div className={styles['skills-panel-project-info']}>
                    <span className={styles['skills-panel-project-title']}>{project.title}</span>
                    <div className={styles['skills-panel-project-tech']}>
                      {project.tech.slice(0, 3).map((t: string) => (
                        <span key={t} className={styles['skills-panel-project-tech-tag']}>{t}</span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <section
      id="skills"
      ref={mergedRef}
      className={`${styles.section} ${styles['section--skills']} ${styles.reveal}${visible ? ` ${styles['is-visible']}` : ''}`}
      aria-label="Skills explorer"
    >

      <div className={styles['skills-sticky']}>
        <div className={styles['skills-header']}>
          <span className={styles['skills-header-num']}>02</span>
          <h2 className={styles['skills-header-title']}>
            skills<span className={styles['skills-header-accent']}>_</span>
          </h2>
          <p className={styles['skills-header-desc']}>
            Click any marker on the globe to explore a skill in detail
          </p>
        </div>

        <div className={styles['skills-filters']}>
          <div className={styles['skills-search']}>
            <FiSearch className={styles['skills-search-icon']} />
            <input
              ref={searchRef}
              className={styles['skills-search-input']}
              type="search"
              aria-label="Search skills"
              placeholder="Search skills..."
              value={inputValue}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            {inputValue && (
              <button className={styles['skills-search-clear']} onClick={clearSearch} aria-label="Clear search">
                <FiX />
              </button>
            )}
          </div>

          <div className={styles['skills-filter-dropdown']} ref={dropdownRef}>
            <button
              className={`${styles['skills-filter-trigger']} ${filterGroup ? styles['is-active'] : ''}`}
              onClick={() => setDropdownOpen((p) => !p)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
            >
              <span
                className={styles['skills-filter-dot']}
                style={{ background: filterGroup ? GROUP_COLORS[filterGroup] : 'var(--text-ghost)' }}
              />
              <span className={styles['skills-filter-label']}>{filterGroup || 'all'}</span>
              <FiChevronDown className={`${styles['skills-filter-chevron']} ${dropdownOpen ? styles['is-open'] : ''}`} />
            </button>

            {dropdownOpen && (
              <div className={styles['skills-filter-menu']} role="listbox" aria-label="Skill group">
                <button
                  className={`${styles['skills-filter-option']} ${!filterGroup ? styles['is-active'] : ''}`}
                  onClick={() => handleFilterGroup(null)}
                >
                  all
                  <span className={styles['skills-filter-option-count']}>{SKILLS_DATA.length}</span>
                </button>
                {GROUP_OPTIONS.map(({ key, color }: GroupOption) => (
                  <button
                    key={key}
                    className={`${styles['skills-filter-option']} ${filterGroup === key ? styles['is-active'] : ''}`}
                    onClick={() => handleFilterGroup(key)}
                  >
                    <span className={styles['skills-filter-dot']} style={{ background: color }} />
                    {key}
                    <span className={styles['skills-filter-option-count']}>{GROUP_COUNTS[key]}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <button className={styles['skills-filter-clear']} onClick={clearAllFilters} aria-label="Reset filters">
              <FiX size={12} />
            </button>
          )}
        </div>

        <div className={styles['skills-layout']}>
          {/* Background decorative cards */}
          <div className={styles['skills-bg-cards']}>
            <div className={`${styles['skills-bg-card']} ${styles['skills-bg-card--1']}`}>
              <div className={styles['skills-bg-card-header']}>
                <span className={styles['skills-bg-card-dot']} style={{ background: 'var(--accent)' }} />
                <span className={styles['skills-bg-card-title']}>frontend</span>
              </div>
              <div className={styles['skills-bg-card-content']}>
                <span className={styles['skills-bg-card-value']}>9</span>
                <span className={styles['skills-bg-card-label']}>skills</span>
              </div>
            </div>
            <div className={`${styles['skills-bg-card']} ${styles['skills-bg-card--2']}`}>
              <div className={styles['skills-bg-card-header']}>
                <span className={styles['skills-bg-card-dot']} style={{ background: 'var(--accent-secondary)' }} />
                <span className={styles['skills-bg-card-title']}>backend</span>
              </div>
              <div className={styles['skills-bg-card-content']}>
                <span className={styles['skills-bg-card-value']}>8</span>
                <span className={styles['skills-bg-card-label']}>skills</span>
              </div>
            </div>
          </div>

          {/* Globe — centered, big */}
          <div className={styles['skills-globe-area']}>
            <Suspense fallback={<div className={styles['skills-globe']} />}>
              <Globe
                ref={globeRef}
                className={styles['skills-globe']}
                onMarkerClick={handleMarkerClick}
              />
            </Suspense>

            <aside className={styles['skills-guide']} aria-label="How to explore skills">
              <div className={styles['skills-tips-bar']}>
                <span className={`${styles['skills-tips-dot']} ${styles['skills-tips-dot--r']}`} />
                <span className={`${styles['skills-tips-dot']} ${styles['skills-tips-dot--y']}`} />
                <span className={`${styles['skills-tips-dot']} ${styles['skills-tips-dot--g']}`} />
                <span className={styles['skills-tips-title']}>explorer guide</span>
              </div>
              <div className={styles['skills-guide-list']}>
                {EXPLORER_GUIDE.map(({ step, icon: Icon, title, detail }) => (
                  <div key={step} className={styles['skills-guide-item']}>
                    <span className={styles['skills-guide-step']}>{step}</span>
                    <Icon className={styles['skills-guide-icon']} />
                    <span className={styles['skills-guide-copy']}>
                      <strong>{title}</strong>
                      <span>{detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>

          {/* Skill detail panel */}
          <div className={`${styles['skills-panel']} ${selectedSkill ? styles['is-open'] : ''}`}>
            {selectedSkill && (
              <>
                <div className={styles['skills-panel-toolbar']}>
                  <button className={styles['skills-panel-close']} onClick={closePanel} aria-label="Close panel">
                    <FiX />
                  </button>
                  <div className={styles['skills-panel-toolbar-actions']}>
                    {history.length > 1 && (
                      <div className={styles['skills-panel-history-nav']}>
                        <button className={styles['skills-panel-nav-btn']} onClick={() => navigateHistory('prev')} aria-label="Previous skill">
                          <FiChevronLeft />
                        </button>
                        <button className={styles['skills-panel-nav-btn']} onClick={() => navigateHistory('next')} aria-label="Next skill">
                          <FiChevronRight />
                        </button>
                      </div>
                    )}
                    <button
                      className={`${styles['skills-panel-compare-btn']} ${compareMode ? styles['is-active'] : ''}`}
                      onClick={toggleCompareMode}
                      aria-label="Compare skills"
                    >
                      <FiCopy />
                    </button>
                  </div>
                </div>

                {history.length > 0 && (
                  <div className={styles['skills-panel-history']}>
                    <FiClock className={styles['skills-panel-history-icon']} />
                    <div className={styles['skills-panel-history-list']}>
                      {history.map((h) => (
                        <button
                          key={h.name}
                          className={`${styles['skills-panel-history-item']} ${h.name === selectedSkill.name ? styles['is-active'] : ''}`}
                          onClick={() => {
                            setSelectedSkill(h);
                            globeRef.current?.select(h.name);
                          }}
                        >
                          {h.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {compareMode ? (
                  <div className={styles['skills-panel-compare']}>
                    <div className={styles['skills-panel-compare-slot']}>
                      {renderSkillPanel(selectedSkill)}
                    </div>
                    <div className={styles['skills-panel-compare-divider']}>
                      <span className={styles['skills-panel-compare-vs']}>vs</span>
                    </div>
                    <div className={`${styles['skills-panel-compare-slot']} ${styles['skills-panel-compare-slot--empty']}`}>
                      {compareSkill ? (
                        renderSkillPanel(compareSkill, true)
                      ) : (
                        <div className={styles['skills-panel-compare-placeholder']}>
                          <FiMousePointer />
                          <span>Click a skill on the globe</span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  renderSkillPanel(selectedSkill)
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
