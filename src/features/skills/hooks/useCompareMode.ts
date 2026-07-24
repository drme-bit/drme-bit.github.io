import { useState, useCallback } from 'react';
import type { SkillItem } from '../types/skills';

export function useCompareMode() {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSkill, setCompareSkill] = useState<SkillItem | null>(null);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => !prev);
    setCompareSkill(null);
  }, []);

  const selectCompareSkill = useCallback((skill: SkillItem) => {
    setCompareSkill(skill);
  }, []);

  const exitCompareMode = useCallback(() => {
    setIsCompareMode(false);
    setCompareSkill(null);
  }, []);

  return { isCompareMode, compareSkill, toggleCompareMode, selectCompareSkill, exitCompareMode };
}
