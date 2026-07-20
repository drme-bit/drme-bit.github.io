interface GlobeManagerState {
  selected: string | null;
  disabled: boolean;
}

export default class GlobeManager {
  state: GlobeManagerState = { selected: null, disabled: false };
  private filteredNames: Set<string> | null = null;

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

  reset(): void {
    this.state.selected = null;
    this.state.disabled = false;
    this.filteredNames = null;
  }
}
