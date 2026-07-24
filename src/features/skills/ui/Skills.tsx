'use client';

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import useReveal from '@/shared/hooks/useReveal';
import useScrollPhase from '@/shared/hooks/useScrollPhase';
import useMergedRef from '@/shared/hooks/useMergedRef';
import { SKILLS_DATA, GROUP_COLORS } from '@/data/skillsData';
import { EXPLORER_GUIDE, MAX_HISTORY } from '../lib/constants';
import { useSkillHistory } from '../hooks/useSkillHistory';
import { useCompareMode } from '../hooks/useCompareMode';
import { GROUP_OPTIONS } from '../hooks/useSkillFilter';
import { SkillPanel } from '../components/SkillPanel';
import { FiSearch, FiX, FiChevronDown } from 'react-icons/fi';
import styles from './Skills.module.scss';
import type { SkillItem } from '../types/skills';

const Globe = lazy(() => import('@/shared/ui/organisms/Globe/Globe'));

/* ─── Derived data ───────────────────────────────────────── */

const GROUP_COUNTS: Record<string, number> = {};
GROUP_OPTIONS.forEach(({ key }) => {
  GROUP_COUNTS[key] = SKILLS_DATA.filter((s) => s.group === key).length;
});

/* ─── Skills ─────────────────────────────────────────────── */

export default function Skills() {
  const [ref, visible] = useReveal();
  const [filterGroup, setFilterGroup] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState<SkillItem | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<{ setDisabled: (v: boolean) => void; search: (v: string | null) => void; setFilter: (v: string | null) => void; reset: () => void; select: (v: string | null) => void } | null>(null);
  const sectionElRef = useRef<HTMLElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { history, addSkill } = useSkillHistory();
  const { isCompareMode, compareSkill, toggleCompareMode, selectCompareSkill, exitCompareMode } = useCompareMode();

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
    addSkill(skill);
    if (isCompareMode) {
      if (!selectedSkill) {
        setSelectedSkill(skill);
      } else if (!compareSkill) {
        selectCompareSkill(skill);
      }
    } else {
      setSelectedSkill(skill);
    }
  }, [getProgress, isCompareMode, selectedSkill, compareSkill, addSkill, selectCompareSkill]);

  const closePanel = useCallback(() => {
    setSelectedSkill(null);
    exitCompareMode();
    globeRef.current?.select(null);
  }, [exitCompareMode]);

  const navigateHistory = useCallback((direction: 'prev' | 'next') => {
    if (!selectedSkill || history.length === 0) return;
    const currentIndex = history.findIndex((s) => s.name === selectedSkill.name);
    let newIndex = direction === 'prev' ? currentIndex + 1 : currentIndex - 1;
    if (newIndex < 0) newIndex = history.length - 1;
    if (newIndex >= history.length) newIndex = 0;
    setSelectedSkill(history[newIndex]);
    globeRef.current?.select(history[newIndex].name);
  }, [selectedSkill, history]);

  const selectHistorySkill = useCallback((skill: SkillItem) => {
    setSelectedSkill(skill);
    globeRef.current?.select(skill.name);
  }, []);

  const selectRelatedSkill = useCallback((skill: SkillItem) => {
    setSelectedSkill(skill);
    addSkill(skill);
    globeRef.current?.select(skill.name);
  }, [addSkill]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCompareMode) {
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
  }, [selectedSkill, closePanel, isCompareMode, toggleCompareMode]);

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
          <SkillPanel
            skill={selectedSkill}
            history={history}
            compareMode={isCompareMode}
            compareSkill={compareSkill}
            onClose={closePanel}
            onToggleCompare={toggleCompareMode}
            onNavigateHistory={navigateHistory}
            onSelectHistory={selectHistorySkill}
            onSelectRelated={selectRelatedSkill}
          />
        </div>
      </div>
    </section>
  );
}
