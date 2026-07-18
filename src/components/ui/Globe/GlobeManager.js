import { SKILLS_DATA } from '@/pages/Main/sections/Skills/skillsData';

/**
 * GlobeManager — OOP controller for globe marker filtering, search, and selection.
 * Operates directly on DOM elements via CSS classes — no React re-renders needed.
 *
 * Usage:
 *   const manager = new GlobeManager();
 *   manager.init();                          // call after globe mounts
 *   manager.setFilter(['React', 'TypeScript']);
 *   manager.search('react');
 *   manager.select('React');
 *   manager.reset();
 */
export default class GlobeManager {
  constructor() {
    this._filter = null;      // Set<string> | null
    this._search = null;      // Set<string> | null
    this._selected = null;    // string | null
    this._disabled = false;   // bool
    this._labels = [];        // HTMLElement[]
    this._onChange = null;    // callback
  }

  /** Scan DOM for .globe__marker-label elements */
  init() {
    this._labels = Array.from(document.querySelectorAll('.globe__marker-label'));
    this._apply();
  }

  /** Subscribe to state changes — receives { filter, search, selected } */
  onChange(cb) {
    this._onChange = cb;
    return () => { this._onChange = null; };
  }

  /** Filter by group names: setFilter(['frontend']) or setFilter(null) for all */
  setFilter(groupNames) {
    if (!groupNames || groupNames.length === 0) {
      this._filter = null;
    } else {
      const names = new Set();
      SKILLS_DATA.forEach((s) => {
        if (groupNames.includes(s.group)) names.add(s.name);
      });
      this._filter = names;
    }
    this._apply();
    this._emit();
  }

  /** Search by substring: search('react') or search(null) to clear */
  search(query) {
    if (!query) {
      this._search = null;
    } else {
      const q = query.toLowerCase();
      const names = new Set();
      SKILLS_DATA.forEach((s) => {
        if (s.name.toLowerCase().includes(q)) names.add(s.name);
      });
      this._search = names;
    }
    this._apply();
    this._emit();
  }

  /** Select a skill: select('React') or select(null) */
  select(skillName) {
    this._selected = skillName;
    this._apply();
    this._emit();
  }

  /** Enable/disable marker interactions */
  setDisabled(disabled) {
    this._disabled = disabled;
    this._apply();
  }

  /** Clear all filters, search, selection */
  reset() {
    this._filter = null;
    this._search = null;
    this._selected = null;
    this._apply();
    this._emit();
  }

  /** Get matching names for current filter+search */
  getFilteredNames() {
    if (!this._filter && !this._search) return null;
    const result = new Set();
    SKILLS_DATA.forEach((s) => {
      const matchFilter = !this._filter || this._filter.has(s.name);
      const matchSearch = !this._search || this._search.has(s.name);
      if (matchFilter && matchSearch) result.add(s.name);
    });
    return result;
  }

  /** Get count of filtered skills */
  getFilteredCount() {
    const names = this.getFilteredNames();
    return names ? names.size : SKILLS_DATA.length;
  }

  /** Get total skill count */
  getTotalCount() {
    return SKILLS_DATA.length;
  }

  /** Current state snapshot */
  get state() {
    return {
      filter: this._filter,
      search: this._search,
      selected: this._selected,
      disabled: this._disabled,
    };
  }

  // ── Private ──

  _emit() {
    this._onChange?.({
      filter: this._filter,
      search: this._search,
      selected: this._selected,
      filteredNames: this.getFilteredNames(),
      filteredCount: this.getFilteredCount(),
      totalCount: this.getTotalCount(),
    });
  }

  _apply() {
    const filtered = this.getFilteredNames();
    for (const el of this._labels) {
      const name = el.getAttribute('data-tooltip');
      if (!name) continue;

      const isActive = this._selected === name;
      const isDimmed = filtered && !filtered.has(name);

      el.classList.toggle('is-active', isActive);
      el.classList.toggle('is-dimmed', isDimmed);
      el.classList.toggle('is-disabled', this._disabled);
    }
  }
}
