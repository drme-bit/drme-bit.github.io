import { useState, useCallback } from 'react';
import type { Skill } from '../lib';

export function useCompareMode() {
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [compareSkill, setCompareSkill] = useState<Skill | null>(null);

  const toggleCompareMode = useCallback(() => {
    setIsCompareMode((prev) => !prev);
    setCompareSkill(null);
  }, []);

  const selectCompareSkill = useCallback((skill: Skill) => {
    setCompareSkill(skill);
  }, []);

  const exitCompareMode = useCallback(() => {
    setIsCompareMode(false);
    setCompareSkill(null);
  }, []);

  return { isCompareMode, compareSkill, toggleCompareMode, selectCompareSkill, exitCompareMode };
}
