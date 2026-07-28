import { useState, useCallback } from 'react';
import { MAX_HISTORY } from '../lib';
import type { Skill } from '../lib';

export function useSkillHistory() {
  const [history, setHistory] = useState<Skill[]>([]);

  const addSkill = useCallback((skill: Skill) => {
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
