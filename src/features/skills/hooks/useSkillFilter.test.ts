import { describe, it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSkillFilter } from './useSkillFilter';

describe('useSkillFilter', () => {
  it('returns all skills by default', () => {
    const { result } = renderHook(() => useSkillFilter());
    const all = result.current.filteredSkills;
    expect(all.length).toBeGreaterThan(0);
    expect(result.current.activeGroup).toBe('all');
    expect(result.current.searchQuery).toBe('');
  });

  it('filters by group', () => {
    const { result } = renderHook(() => useSkillFilter());
    act(() => result.current.setActiveGroup('frontend'));
    const names = result.current.filteredSkills.map(s => s.group);
    expect(names.length).toBeGreaterThan(0);
    expect(names.every(g => g === 'frontend')).toBe(true);
  });

  it('filters by search query (name or desc)', () => {
    const { result } = renderHook(() => useSkillFilter());
    act(() => result.current.setSearchQuery('rust'));
    const names = result.current.filteredSkills.map(s => s.name.toLowerCase());
    expect(names.length).toBeGreaterThan(0);
    expect(names.every(n => n.includes('rust'))).toBe(true);
  });

  it('resetFilters clears group and query', () => {
    const { result } = renderHook(() => useSkillFilter());
    const allCount = result.current.filteredSkills.length;
    act(() => {
      result.current.setActiveGroup('backend');
      result.current.setSearchQuery('zzzzzz');
    });
    expect(result.current.filteredSkills.length).toBe(0);
    act(() => result.current.resetFilters());
    expect(result.current.activeGroup).toBe('all');
    expect(result.current.searchQuery).toBe('');
    expect(result.current.filteredSkills.length).toBe(allCount);
  });
});
