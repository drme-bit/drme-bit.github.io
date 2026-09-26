import type { ComponentType } from 'react';
import { FiZap } from '@/shared/ui/Icon';
import { BsFillKanbanFill } from '@/shared/ui/Icon';
import { RiRobot2Fill } from '@/shared/ui/Icon';

export interface Highlight {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  tags?: string[];
  image: string;
}

export interface Principle {
  title: string;
  desc: string;
}

export const PRINCIPLES: Principle[] = [
  {
    title: 'Ship early, ship often',
    desc: 'Small iterations beat big reveals. Every prototype teaches something no plan can.',
  },
  {
    title: 'Measure, don\u2019t guess',
    desc: 'Performance budgets, real metrics, profiling before optimizing — feelings are not benchmarks.',
  },
  {
    title: 'Simple over clever',
    desc: 'Boring architecture the next person can understand wins over elegant puzzles.',
  },
  {
    title: 'Own the whole loop',
    desc: 'From idea and design to deploy and support — no handoff gaps, no “not my part”.',
  },
];

export const HIGHLIGHTS: Highlight[] = [
  {
    icon: BsFillKanbanFill,
    title: 'Kanban Workflow',
    desc: 'I ship in small, frequent iterations — tasks move with intention from Backlog to Done.',
    tags: ['productivity'],
    image: '/images/demonstration/kanban-demo.webp',
  },
  {
    icon: RiRobot2Fill,
    title: 'AI-Augmented',
    desc: 'Copilot, Cursor and agents as force multipliers for speed, refactoring and code quality.',
    tags: ['tooling'],
    image: '/images/demonstration/jetbrains-ai-use-demo.webp',
  },
  {
    icon: FiZap,
    title: 'Deep Focus',
    desc: 'When something doesn\u2019t work, I don\u2019t stop — every bug is a puzzle that just needs more time.',
    tags: ['mindset'],
    image: '/images/demonstration/me-coding-demo.webp',
  },
];

export const STATS: Array<{ value: string; label: string }> = [
  { value: '5+', label: 'years coding' },
  { value: '9', label: 'languages' },
  { value: '6', label: 'projects shipped' },
];

export const QUOTES: Array<{ text: string; game: string }> = [
  { text: 'The factory must grow.', game: 'Factorio' },
  { text: 'We do what we must because we can.', game: 'Portal' },
  { text: 'You can do this.', game: 'Celeste' },
];

export const BOARD_MESSAGES = [
  '5+ YEARS\nSHIPPING\nFULL-STACK APPS',
  '12 TOOLS\nIN DAILY\nROTATION',
  '6 PROJECTS\nLIVE IN\nPRODUCTION',
  'REPLY WITHIN\n24 HOURS',
];

export const MARQUEE = [
  'full-stack developer',
  'react',
  'typescript',
  'rust',
  'three.js',
  'node.js',
  'open source',
  'available for work',
  'from odesa, ukraine',
  'drme-bit',
];