import { useState, useMemo, useCallback } from 'react';
import { SKILLS_DATA } from '@/data/skillsData';
import type { SkillItem } from '../types/skills';

export const GROUP_OPTIONS = [
  { key: 'all' as const, color: 'var(--text-secondary)' },
  { key: 'frontend' as const, color: 'var(--accent)' },
  { key: 'backend' as const, color: 'var(--accent-secondary)' },
  { key: 'tools' as const, color: 'var(--accent-tertiary)' },
];

export function useSkillFilter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState('all');

  const filteredSkills = useMemo(() => {
    return SKILLS_DATA.filter((skill) => {
      const matchesGroup = activeGroup === 'all' || skill.group === activeGroup;
      const matchesSearch =
        !searchQuery ||
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.desc.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [searchQuery, activeGroup]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setActiveGroup('all');
  }, []);

  return { searchQuery, setSearchQuery, activeGroup, setActiveGroup, filteredSkills, resetFilters };
}
