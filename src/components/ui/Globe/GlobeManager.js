import { SKILLS_DATA } from '@/pages/Main/sections/Skills/skillsData';

export default class GlobeManager {
  constructor() {
    this._filter = null;
    this._search = null;
    this._selected = null;
    this._disabled = false;
    this._onChange = null;
  }

  onChange(cb) {
    this._onChange = cb;
    return () => { this._onChange = null; };
  }

  setFilter(groupName) {
    this._filter = groupName || null;
    this._emit();
  }

  search(query) {
    this._search = query || null;
    this._emit();
  }

  select(skillName) {
    this._selected = skillName;
    this._emit();
  }

  setDisabled(disabled) {
    this._disabled = disabled;
    this._emit();
  }

  reset() {
    this._filter = null;
    this._search = null;
    this._selected = null;
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

  _emit() {
    this._onChange?.();
  }
}
