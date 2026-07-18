import { SKILLS_DATA } from '@/pages/Main/sections/Skills/skillsData';

/**
 * GlobeManager — OOP controller for globe marker filtering, search, and selection.
 * Operates directly on DOM via a single data attribute on the container — no React re-renders.
 *
 * State is stored as a single `data-filter` attribute on the globe container:
 *   data-filter="all" | data-filter="frontend" | data-filter="backend" | ...
 *   data-search="react" | data-search="" (empty = no search)
 *   data-selected="React" | data-selected="" (empty = no selection)
 *
 * CSS handles all visual states via attribute selectors — zero per-marker JS.
 */
export default class GlobeManager {
  constructor() {
    this._filter = null;      // string | null (group name)
    this._search = null;      // string | null (query)
    this._selected = null;    // string | null
    this._disabled = false;
    this._labels = [];        // cached HTMLElement[]
    this._nameMap = new Map();// name → HTMLElement
    this._container = null;   // .globe container element
    this._onChange = null;
  }

  /** Scan DOM once, cache everything */
  init() {
    this._labels = Array.from(document.querySelectorAll('.globe__marker-label'));
    this._nameMap.clear();
    for (const el of this._labels) {
      const name = el.getAttribute('data-tooltip');
      if (name) this._nameMap.set(name, el);
    }
    this._container = this._labels[0]?.closest('.globe') || null;
  }

  onChange(cb) {
    this._onChange = cb;
    return () => { this._onChange = null; };
  }

  setFilter(groupName) {
    this._filter = groupName || null;
    this._apply();
    this._emit();
  }

  search(query) {
    this._search = query || null;
    this._apply();
    this._emit();
  }

  select(skillName) {
    this._selected = skillName;
    this._apply();
    this._emit();
  }

  setDisabled(disabled) {
    this._disabled = disabled;
    this._apply();
  }

  reset() {
    this._filter = null;
    this._search = null;
    this._selected = null;
    this._apply();
    this._emit();
  }

  getFilteredNames() {
    const filterSet = this._filter
      ? new Set(SKILLS_DATA.filter((s) => s.group === this._filter).map((s) => s.name))
      : null;
    const searchSet = this._search
      ? new Set(SKILLS_DATA.filter((s) => s.name.toLowerCase().includes(this._search.toLowerCase())).map((s) => s.name))
      : null;

    if (!filterSet && !searchSet) return null;

    return new Set(
      SKILLS_DATA.filter((s) => {
        const matchFilter = !filterSet || filterSet.has(s.name);
        const matchSearch = !searchSet || searchSet.has(s.name);
        return matchFilter && matchSearch;
      }).map((s) => s.name),
    );
  }

  getFilteredCount() {
    const names = this.getFilteredNames();
    return names ? names.size : SKILLS_DATA.length;
  }

  getTotalCount() {
    return SKILLS_DATA.length;
  }

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
    const hasFilter = filtered !== null;

    // Fast path: no filter, no selection — clear everything
    if (!hasFilter && !this._selected && !this._disabled) {
      for (const el of this._labels) {
        el.classList.remove('is-active', 'is-dimmed', 'is-disabled');
      }
      return;
    }

    for (const el of this._labels) {
      const name = el.getAttribute('data-tooltip');
      if (!name) continue;

      const isMatch = hasFilter ? filtered.has(name) : true;
      const isActive = this._selected === name;
      const isDimmed = hasFilter && !isMatch;

      // Only toggle if state actually changed — avoids forced reflow
      const wasActive = el.classList.contains('is-active');
      const wasDimmed = el.classList.contains('is-dimmed');
      const wasDisabled = el.classList.contains('is-disabled');

      if (isActive !== wasActive) el.classList.toggle('is-active', isActive);
      if (isDimmed !== wasDimmed) el.classList.toggle('is-dimmed', isDimmed);
      if (this._disabled !== wasDisabled) el.classList.toggle('is-disabled', this._disabled);
    }
  }
}
