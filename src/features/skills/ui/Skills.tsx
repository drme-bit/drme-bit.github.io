'use client';

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { graph, GROUP_COLORS, EXPLORER_GUIDE, MAX_HISTORY } from '../lib';
import { useSkillHistory } from '../hooks/useSkillHistory';
import { useCompareMode } from '../hooks/useCompareMode';
import { GROUP_OPTIONS } from '../hooks/useSkillFilter';
import { SkillPanel } from './SkillPanel';
import { FiSearch, FiX, FiChevronDown } from '@/shared/ui/atoms/Icon';
import styles from './Skills.module.scss';
import type { Skill } from '../lib';

gsap.registerPlugin(ScrollTrigger);

const Globe = lazy(() => import('@/shared/ui/organisms/Globe/Globe'));

/*  Derived data ── */

const GROUP_COUNTS: Record<string, number> = {};
GROUP_OPTIONS.forEach(({ key }) => {
  GROUP_COUNTS[key] = graph.skillsByGroup(key as any).length;
});

/*  Skills ── */

export default function Skills() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<{ setDisabled: (v: boolean) => void; search: (v: string | null) => void; setFilter: (v: string | null) => void; reset: () => void; select: (v: string | null) => void } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const lenis = useLenis();

  const [filterGroup, setFilterGroup] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSkill, setCompareSkill] = useState<Skill | null>(null);

  const { history, addSkill } = useSkillHistory();

  // ── GSAP ScrollTrigger: rising world → centered explorer ──
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const vh = window.innerHeight;
    const endSize = window.innerWidth <= 900 ? Math.min(window.innerWidth * 0.82, 340) : 500;
    const startSize = vh * 1.6;
    const startTop = vh * 0.48;
    const startY = startTop - vh * 0.5 + startSize / 2;

    const setEnd = () => {
      const el = section;
      el.style.setProperty('--header-opacity', '0');
      el.style.setProperty('--header-ty', '-8vh');
      el.style.setProperty('--header-s', '0.95');
      el.style.setProperty('--globe-size', `${endSize}px`);
      el.style.setProperty('--globe-y', '0px');
      el.style.setProperty('--tips-opacity', '1');
      el.style.setProperty('--tips-x', '0rem');
      el.style.setProperty('--tips-y', '0rem');
      el.style.setProperty('--filters-opacity', '1');
      el.style.setProperty('--filters-y', '0rem');
      el.style.setProperty('--cards-opacity', '1');
      el.style.setProperty('--card-1-y', '0px');
      el.style.setProperty('--card-2-y', '0px');
      el.classList.add(styles['filters-visible']);
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setEnd();
      return;
    }

    ScrollTrigger.refresh();

    const apply = (p: number) => {
      const el = section;

      // header: looms above the rising world, then dissolves (gone by the end)
      const header = Math.min(p / 0.35, 1);
      // globe: giant world peeking from the bottom → reduced, centered
      const globe = Math.min(p / 0.55, 1);
      const tips = Math.min(Math.max((p - 0.3) / 0.2, 0), 1);
      const filters = Math.min(Math.max((p - 0.45) / 0.18, 0), 1);
      const cards = Math.min(Math.max((p - 0.12) / 0.32, 0), 1);

      el.style.setProperty('--header-opacity', String(1 - header));
      el.style.setProperty('--header-ty', `${-8 * header}vh`);
      el.style.setProperty('--header-s', String(1.25 - header * 0.3));

      el.style.setProperty('--globe-size', `${(startSize - endSize) * (1 - globe) + endSize}px`);
      el.style.setProperty('--globe-y', `${startY * (1 - globe)}px`);

      el.style.setProperty('--tips-opacity', String(tips));
      el.style.setProperty('--tips-x', `${(1 - tips) * 6}rem`);
      el.style.setProperty('--tips-y', `${(1 - tips) * 0.75}rem`);

      el.style.setProperty('--filters-opacity', String(filters));
      el.style.setProperty('--filters-y', `${(1 - filters) * -0.75}rem`);

      el.style.setProperty('--cards-opacity', String(cards));
      el.style.setProperty('--card-1-y', `${(1 - cards) * 40}px`);
      el.style.setProperty('--card-2-y', `${(1 - cards) * 60}px`);

      const filtersVisible = p > 0.45;
      el.classList.toggle(styles['filters-visible'], filtersVisible);
    };

    const ctx = gsap.context(() => {
      const st = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onRefresh: (self) => apply(self.progress),
        onUpdate: (self) => apply(self.progress),
      });

      apply(0);

      return () => st.kill();
    }, sectionRef);

    return () => ctx.revert();
  }, [lenis]);

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
    const skill = graph.getSkill(skillName);
    if (!skill) return;
    globeRef.current?.select(skillName);
    addSkill(skill);
    if (isCompareMode) {
      if (!selectedSkill) {
        setSelectedSkill(skill);
      } else if (!compareSkill) {
        setCompareSkill(skill);
      }
    } else {
      setSelectedSkill(skill);
    }
  }, [isCompareMode, selectedSkill, compareSkill, addSkill]);

  const closePanel = useCallback(() => {
    setSelectedSkill(null);
    setIsCompareMode(false);
    setCompareSkill(null);
    globeRef.current?.select(null);
  }, []);

  const navigateHistory = useCallback((direction: 'prev' | 'next') => {
    if (!selectedSkill || history.length === 0) return;
    const currentIndex = history.findIndex((s) => s.name === selectedSkill.name);
    let newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = history.length - 1;
    if (newIndex >= history.length) newIndex = 0;
    setSelectedSkill(history[newIndex]);
    globeRef.current?.select(history[newIndex].name);
  }, [selectedSkill, history]);

  const selectHistorySkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    globeRef.current?.select(skill.name);
  }, []);

  const selectRelatedSkill = useCallback((skill: Skill) => {
    setSelectedSkill(skill);
    addSkill(skill);
    globeRef.current?.select(skill.name);
  }, [addSkill]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCompareMode) {
          setIsCompareMode(false);
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
  }, [selectedSkill, closePanel, isCompareMode]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  const hasFilters = filterGroup || inputValue;

  return (
    <section
      id="skills"
      ref={sectionRef}
      className={`${styles.section} ${styles['section--skills']}`}
      aria-label="Skills explorer"
    >
      <div className={styles['skills-sticky']}>
        <div className={styles['skills-header']}>
          <span className={styles['skills-header-kicker']}>
            <span className={styles['skills-header-bracket']}>[</span>
            <span className={styles['skills-header-num']}>02</span>
            <span className={styles['skills-header-bracket']}>]</span>
            <span className={styles['skills-header-label']}>skills explorer</span>
          </span>
          <h2 className={styles['skills-header-title']}>
            skills<span className={styles['skills-header-accent']}>_</span>
            <span className={styles['skills-header-cursor']} aria-hidden="true" />
          </h2>
          <p className={styles['skills-header-desc']}>
            click any marker on the globe to explore a skill in detail
          </p>
          <div className={styles['skills-header-stats']}>
            <span className={styles['skills-header-stat']}>
              <i className={styles['skills-header-stat-dot']} style={{ background: GROUP_COLORS.frontend }} />
              {GROUP_COUNTS.frontend ?? 0} frontend
            </span>
            <span className={styles['skills-header-sep']}>/</span>
            <span className={styles['skills-header-stat']}>
              <i className={styles['skills-header-stat-dot']} style={{ background: GROUP_COLORS.backend }} />
              {GROUP_COUNTS.backend ?? 0} backend
            </span>
            <span className={styles['skills-header-sep']}>/</span>
            <span className={styles['skills-header-stat']}>
              <i className={styles['skills-header-stat-dot']} style={{ background: GROUP_COLORS.tools }} />
              {GROUP_COUNTS.tools ?? 0} tools
            </span>
            <span className={styles['skills-header-sep']}>/</span>
            <span className={styles['skills-header-stat']}>{graph.allSkills.length} nodes</span>
          </div>
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
                  <span className={styles['skills-filter-option-count']}>{graph.allSkills.length}</span>
                </button>
                {GROUP_OPTIONS.map(({ key, color }) => (
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
                <span className={styles['skills-bg-card-value']}>{graph.skillsByGroup('frontend').length}</span>
                <span className={styles['skills-bg-card-label']}>skills</span>
              </div>
            </div>
            <div className={`${styles['skills-bg-card']} ${styles['skills-bg-card--2']}`}>
              <div className={styles['skills-bg-card-header']}>
                <span className={styles['skills-bg-card-dot']} style={{ background: 'var(--accent-secondary)' }} />
                <span className={styles['skills-bg-card-title']}>backend</span>
              </div>
              <div className={styles['skills-bg-card-content']}>
                <span className={styles['skills-bg-card-value']}>{graph.skillsByGroup('backend').length}</span>
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

          {/* Skill detail panel — anchored to the sticky viewport, rides with the section */}
          </div>

          <SkillPanel
            skill={selectedSkill}
            history={history}
            compareMode={isCompareMode}
            compareSkill={compareSkill}
            onClose={closePanel}
            onToggleCompare={() => setIsCompareMode(!isCompareMode)}
            onNavigateHistory={navigateHistory}
            onSelectHistory={selectHistorySkill}
            onSelectRelated={selectRelatedSkill}
          />
        </div>
    </section>
  );
}
