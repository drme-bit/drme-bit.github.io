import { SKILLS_DATA } from '@/features/skills/ui/skillsData';

interface GlobeManagerState {
  selected: string | null;
  disabled: boolean;
}

export default class GlobeManager {
  state: GlobeManagerState = { selected: null, disabled: false };
  private filteredNames: Set<string> | null = null;
  private searchQuery: string | null = null;
  private filterGroup: string | null = null;

  select(name: string | null): void {
    this.state.selected = name;
  }

  setDisabled(disabled: boolean): void {
    this.state.disabled = disabled;
  }

  setFiltered(names: string[] | null): void {
    this.filteredNames = names ? new Set(names) : null;
  }

  getFilteredNames(): Set<string> | null {
    return this.filteredNames;
  }

  setFilter(group: string | null): void {
    this.filterGroup = group;
    this.applyFilters();
  }

  search(query: string | null): void {
    this.searchQuery = query;
    this.applyFilters();
  }

  private applyFilters(): void {
    const q = this.searchQuery?.toLowerCase() || null;
    const g = this.filterGroup;

    if (!q && !g) {
      this.filteredNames = null;
      return;
    }

    const filtered = SKILLS_DATA.filter((s) => {
      const matchesGroup = !g || s.group === g;
      const matchesSearch = !q || s.name.toLowerCase().includes(q);
      return matchesGroup && matchesSearch;
    });

    this.filteredNames = new Set(filtered.map((s) => s.name));
  }

  reset(): void {
    this.state.selected = null;
    this.state.disabled = false;
    this.filteredNames = null;
    this.searchQuery = null;
    this.filterGroup = null;
  }
}
