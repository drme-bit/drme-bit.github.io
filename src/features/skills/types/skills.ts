import type { IconType } from 'react-icons';

export interface SkillItem {
  name: string;
  group: 'frontend' | 'backend' | 'tools';
  level: number;
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
