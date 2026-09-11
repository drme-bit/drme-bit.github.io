'use client';

import { useState, useCallback, useRef, useEffect, lazy, Suspense } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useLenis } from 'lenis/react';
import { graph, GROUP_COLORS, EXPLORER_GUIDE } from '../lib';
import { useSkillHistory } from '../hooks/useSkillHistory';
import { GROUP_OPTIONS } from '../hooks/useSkillFilter';
import { SkillPanel } from './SkillPanel';
import { FiSearch, FiX, FiChevronDown } from '@/shared/ui/atoms/Icon';
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
      el.classList.add('filters-visible');
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
      el.classList.toggle('filters-visible', filtersVisible);
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
    const normalized = group === 'all' ? null : group;
    const next = filterGroup === normalized ? null : normalized;
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
      className="relative mt-[15vh] flex h-[200vh] flex-col justify-start p-0 max-[900px]:mt-[5vh] max-[900px]:h-[160vh]"
      aria-label="Skills explorer"
    >
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-hidden px-[6vw] max-[900px]:h-[100svh] max-[900px]:min-h-[100svh] max-[900px]:flex-col max-[900px]:gap-3 max-[900px]:px-[var(--space-md)]">
        <div className="absolute left-1/2 top-[8vh] z-10 max-w-[520px] p-3 text-center opacity-[var(--header-opacity,1)] will-change-[transform,opacity] [scale:var(--header-s,1.25)] [translate:-50%_var(--header-ty,0)] before:pointer-events-none before:absolute before:-left-1 before:-top-3 before:size-3.5 before:border before:border-[color-mix(in_srgb,var(--accent-secondary)_50%,transparent)] before:border-b-0 before:border-r-0 before:opacity-60 before:content-[''] after:pointer-events-none after:absolute after:-bottom-3 after:-right-1 after:size-3.5 after:border after:border-[color-mix(in_srgb,var(--accent-secondary)_50%,transparent)] after:border-l-0 after:border-t-0 after:opacity-60 after:content-[''] max-[900px]:relative max-[900px]:left-auto max-[900px]:top-auto max-[900px]:max-w-full max-[900px]:p-0 max-[900px]:opacity-100 max-[900px]:[scale:none] max-[900px]:[translate:none] max-[900px]:after:hidden max-[900px]:before:hidden">
          <span className="mb-3 inline-flex items-center gap-[0.45rem] font-mono text-[0.6rem] uppercase tracking-[0.22em] text-[var(--text-ghost)]">
            <span className="font-bold text-[var(--accent-secondary)]">[</span>
            <span className="tracking-[0.1em] text-[var(--accent-secondary)]">02</span>
            <span className="font-bold text-[var(--accent-secondary)]">]</span>
            <span className="tracking-[0.28em] text-[var(--text-dim)]">skills explorer</span>
          </span>
          <h2 className="m-0 font-display text-[clamp(2.5rem,10vw,4.5rem)] leading-[1.1] text-[var(--text)] max-[900px]:text-[clamp(1.4rem,5vw,2rem)]">
            skills<span className="text-[var(--accent-secondary)]">_</span>
            <span
              className="ml-[0.06em] inline-block h-[0.85em] w-[0.14em] animate-[skills-cursor_1.1s_step-end_infinite] rounded-[1px] bg-[var(--accent-secondary)] align-baseline"
              aria-hidden="true"
            />
          </h2>
          <p className="mt-3 font-mono text-[0.75rem] leading-[1.6] text-[var(--text-dim)] max-[900px]:hidden">
            click any marker on the globe to explore a skill in detail
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-[0.55rem] font-mono text-[0.62rem] lowercase tracking-[0.08em] text-[var(--text-ghost)] max-[700px]:hidden">
            <span className="inline-flex items-center gap-[0.4rem] whitespace-nowrap">
              <i className="size-[7px] rounded-full" style={{ background: GROUP_COLORS.frontend }} />
              {GROUP_COUNTS.frontend ?? 0} frontend
            </span>
            <span className="opacity-45">/</span>
            <span className="inline-flex items-center gap-[0.4rem] whitespace-nowrap">
              <i className="size-[7px] rounded-full" style={{ background: GROUP_COLORS.backend }} />
              {GROUP_COUNTS.backend ?? 0} backend
            </span>
            <span className="opacity-45">/</span>
            <span className="inline-flex items-center gap-[0.4rem] whitespace-nowrap">
              <i className="size-[7px] rounded-full" style={{ background: GROUP_COLORS.tools }} />
              {GROUP_COUNTS.tools ?? 0} tools
            </span>
            <span className="opacity-45">/</span>
            <span className="inline-flex items-center gap-[0.4rem] whitespace-nowrap">{graph.allSkills.length} nodes</span>
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-[3vh] z-20 flex items-center gap-2 rounded-[var(--radius-full)] border border-[color-mix(in_srgb,var(--border)_40%,transparent)] bg-[color-mix(in_srgb,var(--bg)_80%,transparent)] p-[6px_8px] opacity-[var(--filters-opacity,0)] will-change-[opacity,transform] [backdrop-filter:blur(16px)] [-webkit-backdrop-filter:blur(16px)] [transform:translate(-50%,var(--filters-y,-0.75rem))] [.filters-visible_&]:pointer-events-auto max-[900px]:top-3 max-[900px]:max-w-[calc(100%-32px)]">
          <div className="relative flex min-w-[180px] items-center gap-1.5 rounded-[var(--radius-full)] border border-transparent p-[6px_10px] transition-[border-color,background] duration-[var(--duration-fast)] focus-within:border-[color-mix(in_srgb,var(--accent-secondary)_65%,transparent)] focus-within:bg-[var(--accent-secondary-glow)] max-[900px]:min-w-0 max-[900px]:flex-1">
            <FiSearch className="size-3.5 shrink-0 text-[var(--text-dim)]" />
            <input
              ref={searchRef}
              className="min-w-0 flex-1 border-0 bg-transparent font-mono text-[0.7rem] text-[var(--text)] outline-none placeholder:text-[var(--text-ghost)] focus-visible:outline-none"
              type="search"
              aria-label="Search skills"
              placeholder="Search skills..."
              value={inputValue}
              onChange={(e) => handleSearchInput(e.target.value)}
            />
            {inputValue && (
              <button
                className="flex size-[18px] items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--text-ghost)_30%,transparent)] p-0 text-[var(--text-dim)] transition-all duration-150 hover:bg-[var(--text-ghost)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--accent-secondary)] focus-visible:outline-offset-2"
                onClick={clearSearch}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-[var(--radius-full)] border border-[color-mix(in_srgb,var(--border)_30%,transparent)] p-[6px_10px] font-mono text-[0.65rem] capitalize text-[var(--text-dim)] transition-all duration-150 hover:border-[var(--accent-secondary)] hover:text-[var(--text)] focus-visible:outline-2 focus-visible:outline-[var(--accent-secondary)] focus-visible:outline-offset-2 ${
                filterGroup ? 'border-[var(--accent-secondary)] text-[var(--accent-secondary)]' : ''
              }`}
              onClick={() => setDropdownOpen((p) => !p)}
              aria-expanded={dropdownOpen}
              aria-haspopup="listbox"
            >
              <span
                className="size-[6px] shrink-0 rounded-full"
                style={{ background: filterGroup ? GROUP_COLORS[filterGroup] : 'var(--text-ghost)' }}
              />
              <span className="leading-none">{filterGroup || 'all'}</span>
              <FiChevronDown className={`size-3 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] z-30 min-w-[160px] animate-[filter-menu-in_0.15s_ease] rounded-[var(--radius-md)] border border-[var(--border)] bg-background p-1 shadow-[0_8px_32px_rgba(0,0,0,0.4)]" role="listbox" aria-label="Skill group">
                {GROUP_OPTIONS.map(({ key, color }) => (
                  <button
                    key={key}
                    className={`flex w-full items-center gap-2 rounded-[var(--radius-sm)] p-2 px-2.5 text-left font-mono text-[0.65rem] capitalize text-[var(--text-dim)] transition-all duration-100 hover:bg-[color-mix(in_srgb,var(--accent-secondary)_10%,transparent)] hover:text-[var(--text)] ${
                      (filterGroup ?? 'all') === key
                        ? 'bg-[color-mix(in_srgb,var(--accent-secondary)_15%,transparent)] text-[var(--accent-secondary)]'
                        : ''
                    }`}
                    onClick={() => handleFilterGroup(key)}
                  >
                    {key !== 'all' && <span className="size-[6px] shrink-0 rounded-full" style={{ background: color }} />}
                    {key}
                    <span className="ml-auto text-[0.55rem] text-[var(--text-ghost)]">
                      {key === 'all' ? graph.allSkills.length : GROUP_COUNTS[key]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasFilters && (
            <button
              className="flex size-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent-danger)_15%,transparent)] p-0 text-[var(--accent-danger)] transition-all duration-150 hover:bg-[color-mix(in_srgb,var(--accent-danger)_30%,transparent)]"
              onClick={clearAllFilters}
              aria-label="Reset filters"
            >
              <FiX size={12} />
            </button>
          )}
        </div>

        <div className="relative flex w-full items-center justify-center max-[900px]:flex-col">
          {/* Background decorative cards */}
          <div className="pointer-events-none absolute inset-0 z-0 opacity-[var(--cards-opacity,0)] will-change-[opacity,transform]">
            <div className="absolute left-[5%] top-[15%] min-w-[140px] animate-[card-float-1_3s_ease-in-out_infinite_alternate] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--glass)] p-[16px_20px] transition-transform duration-[400ms] [backdrop-filter:blur(20px)] [transform:translateY(var(--card-1-y,40px))_rotate(-3deg)] motion-reduce:animate-none max-[900px]:hidden">
              <div className="mb-2 flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: 'var(--accent)' }} />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.05em] text-[var(--text-dim)]">frontend</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[1.8rem] font-bold leading-none text-[var(--text)]">
                  {graph.skillsByGroup('frontend').length}
                </span>
                <span className="font-mono text-[0.6rem] text-[var(--text-ghost)]">skills</span>
              </div>
            </div>
            <div className="absolute bottom-[20%] right-[8%] min-w-[140px] animate-[card-float-2_4s_ease-in-out_infinite_alternate] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--glass)] p-[16px_20px] transition-transform duration-[400ms] [backdrop-filter:blur(20px)] [transform:translateY(var(--card-2-y,60px))_rotate(2deg)] motion-reduce:animate-none max-[900px]:hidden">
              <div className="mb-2 flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: 'var(--accent-secondary)' }} />
                <span className="font-mono text-[0.65rem] uppercase tracking-[0.05em] text-[var(--text-dim)]">backend</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-[1.8rem] font-bold leading-none text-[var(--text)]">
                  {graph.skillsByGroup('backend').length}
                </span>
                <span className="font-mono text-[0.6rem] text-[var(--text-ghost)]">skills</span>
              </div>
            </div>
          </div>

          {/* Globe — centered, big */}
          <div className="relative size-[var(--globe-size,385px)] shrink-0 overflow-hidden will-change-[width,height,transform] [transform:translateX(var(--globe-x,0))_translateY(var(--globe-y,0))] max-[900px]:size-[min(82vw,340px)] max-[900px]:[transform:none]">
            <Suspense fallback={<div className="relative z-[2] h-full w-full" />}>
              <Globe ref={globeRef} className="relative z-[2] h-full w-full" onMarkerClick={handleMarkerClick} />
            </Suspense>

            <aside className="absolute bottom-[4.5rem] right-[calc(100%+2rem)] z-[1] w-[260px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--terminal-border)] bg-[var(--terminal-bg)] opacity-[var(--tips-opacity,0)] will-change-[opacity,transform] [transform:translateX(var(--tips-x,6rem))_translateY(var(--tips-y,0.75rem))] max-[900px]:hidden max-[1180px]:bottom-6 max-[1180px]:left-[-3rem] max-[1180px]:right-auto" aria-label="How to explore skills">
              <div className="flex items-center gap-1.5 border-b border-[var(--terminal-bar-border)] bg-[var(--terminal-bar)] p-[0.55rem_0.75rem]">
                <span className="size-2 rounded-full opacity-70" style={{ background: 'var(--dot-r)' }} />
                <span className="size-2 rounded-full opacity-70" style={{ background: 'var(--dot-y)' }} />
                <span className="size-2 rounded-full opacity-70" style={{ background: 'var(--dot-g)' }} />
                <span className="ml-auto font-mono text-[0.55rem] tracking-[0.05em] text-[var(--terminal-title)]">explorer guide</span>
              </div>
              <div className="flex flex-col gap-1 p-[0.6rem]">
                {EXPLORER_GUIDE.map(({ step, icon: Icon, title, detail }) => (
                  <div key={step} className="grid grid-cols-[1.5rem_1.25rem_1fr] items-center gap-2 rounded-[var(--radius-sm)] p-[0.55rem_0.5rem] transition-colors duration-200 hover:bg-[var(--glass)]">
                    <span className="font-mono text-[0.5rem] text-[var(--accent-secondary)]">{step}</span>
                    <Icon className="size-[0.85rem] text-[var(--text-dim)]" />
                    <span className="flex flex-col gap-[0.1rem] font-mono">
                      <strong className="text-[0.6rem] font-semibold text-[var(--text-secondary)]">{title}</strong>
                      <span className="text-[0.5rem] text-[var(--text-ghost)]">{detail}</span>
                    </span>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </div>

        {/* Skill detail panel — anchored to the sticky viewport, rides with the section */}
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