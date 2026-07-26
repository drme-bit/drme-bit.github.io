import type { IconType } from 'react-icons';

export interface SkillItem {
  name: string;
  group: 'frontend' | 'backend' | 'tools';
  category: 'language' | 'framework' | 'runtime' | 'database' | 'DevOps' | 'graphics' | 'other';
  level: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  desc: string;
  funLevel: string;
  related: string[];
  projects: string[];
}

export interface GroupOption {
  key: string;
  color: string;
}

export interface SkillLevel {
  value: number;
  label: string;
}
