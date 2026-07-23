'use client';

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import useReveal from '@/shared/hooks/useReveal';
import useScrollPhase from '@/shared/hooks/useScrollPhase';
import useMergedRef from '@/shared/hooks/useMergedRef';
import { useModal } from '@/providers/ModalProvider';
import { SKILLS_DATA, GROUP_COLORS, ICON_MAP } from './skillsData';
import type { SkillItem } from './skillsData';
import { FiSearch, FiX, FiChevronDown, FiMove, FiMousePointer, FiSliders } from 'react-icons/fi';
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

interface OpenModalFn {
  (config: { className: string; onClose?: () => void; content: React.JSX.Element }): void;
}

function openSkillModal(openModal: OpenModalFn, skill: SkillItem, onClose: () => void) {
  const Icon = ICON_MAP[skill.name];
  const related = SKILLS_DATA.find((s) => s.name === skill.name)?.related || [];
  const projects = SKILLS_DATA.find((s) => s.name === skill.name)?.projects || [];

  openModal({
    className: 'modal-panel--skills-sheet',
    onClose,
    content: (
      <div className={styles['skills-sheet-content']}>
        <div className={styles['skills-mobile-sheet-handle']} />

        <div className={styles['skills-mobile-sheet-header']}>
          <div className={styles['skills-mobile-sheet-icon-wrap']} style={{ '--card-color': GROUP_COLORS[skill.group] } as React.CSSProperties}>
            {Icon && <Icon className={styles['skills-mobile-sheet-icon']} />}
          </div>
          <div className={styles['skills-mobile-sheet-titles']}>
            <span className={styles['skills-mobile-sheet-name']} style={{ color: GROUP_COLORS[skill.group] }}>
              {skill.name}
            </span>
            <span className={styles['skills-mobile-sheet-group']}>{skill.group}</span>
          </div>
        </div>

        <div className={styles['skill-level']}>
          {[1, 2, 3, 4, 5].map((n) => (
            <span
              key={n}
              className={`${styles['skill-level-dot']}${n <= skill.level ? ` ${styles['is-filled']}` : ''}`}
              style={n <= skill.level ? { background: GROUP_COLORS[skill.group] } : {}}
            />
          ))}
          <span className={styles['skill-level-label']}>{skill.level}/5</span>
        </div>

        {skill.funLevel && (
          <p className={styles['skills-sheet-fun']}>&quot;{skill.funLevel}&quot;</p>
        )}

        {skill.desc && <p className={styles['skills-sheet-desc']}>{skill.desc}</p>}

        {related.length > 0 && (
          <div className={styles['skills-sheet-section']}>
            <h4 className={styles['skills-sheet-section-title']}>Related Skills</h4>
            <div className={styles['skills-sheet-tags']}>
              {related.map((r) => (
                <span key={r} className={styles['skills-sheet-tag']}>{r}</span>
              ))}
            </div>
          </div>
        )}

        {projects.length > 0 && (
          <div className={styles['skills-sheet-section']}>
            <h4 className={styles['skills-sheet-section-title']}>Used In Projects</h4>
            <div className={styles['skills-sheet-tags']}>
              {projects.map((p) => (
                <a
                  key={p}
                  href={`/projects#${p.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`${styles['skills-sheet-tag']} ${styles['skills-sheet-tag--project']}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(p.toLowerCase().replace(/\s+/g, '-'));
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {p}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    ),
  });
}

/* ─── Skills ─────────────────────────────────────────────── */

export default function Skills() {
  const [ref, visible] = useReveal();
  const [filterGroup, setFilterGroup] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<{ setDisabled: (v: boolean) => void; search: (v: string | null) => void; setFilter: (v: string | null) => void; reset: () => void; select: (v: string | null) => void } | null>(null);
  const sectionElRef = useRef<HTMLElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { openModal } = useModal();

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
    const skill = SKILLS_DATA.find((s) => s.name === skillName);
    if (!skill) return;
    globeRef.current?.select(skillName);
    openSkillModal(openModal, skill, () => globeRef.current?.select(null));
  }, [openModal]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
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
        </div>
      </div>
    </section>
  );
}
