import { useState, useCallback } from 'react';
import { MAX_HISTORY } from '../lib/constants';
import type { SkillItem } from '../types/skills';

export function useSkillHistory() {
  const [history, setHistory] = useState<SkillItem[]>([]);

  const addSkill = useCallback((skill: SkillItem) => {
    setHistory((prev) => {
      const filtered = prev.filter((s) => s.name !== skill.name);
      return [skill, ...filtered].slice(0, MAX_HISTORY);
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, addSkill, clearHistory };
}
