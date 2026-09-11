import type { ComponentType } from 'react';
import { FiZap } from '@/shared/ui/atoms/Icon';
import { BsFillKanbanFill } from '@/shared/ui/atoms/Icon';
import { RiRobot2Fill } from '@/shared/ui/atoms/Icon';

export interface Highlight {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  desc: string;
  tags?: string[];
  image: string;
}

export const BIO = [
  "Full-stack developer from Odesa, Ukraine with ~5 years of hands-on experience across web applications, backend services and game-server tooling. I care about clean architecture, measurable performance and software that actually ships.",
  "I learn fastest by building — so I'm always prototyping and shipping small things, from Roblox experiences and moderation bots to full-stack web apps and backend APIs.",
];

export const HIGHLIGHTS: Highlight[] = [
  {
    icon: BsFillKanbanFill,
    title: 'Kanban Workflow',
    desc: 'I ship in small, frequent iterations — tasks move with intention from Backlog to Done.',
    tags: ['productivity'],
    image: '/images/demonstration/kanban-demo.png',
  },
  {
    icon: RiRobot2Fill,
    title: 'AI-Augmented',
    desc: 'Copilot, Cursor and agents as force multipliers for speed, refactoring and code quality.',
    tags: ['tooling'],
    image: '/images/demonstration/jetbrains-ai-use-demo.png',
  },
  {
    icon: FiZap,
    title: 'Deep Focus',
    desc: 'When something doesn\u2019t work, I don\u2019t stop — every bug is a puzzle that just needs more time.',
    tags: ['mindset'],
    image: '/images/demonstration/me-coding-demo.png',
  },
];

export const STATS: Array<{ value: number; suffix?: string; label: string }> = [
  { value: 5, suffix: '+', label: 'years coding' },
  { value: 9, label: 'languages' },
  { value: 6, label: 'projects' },
];

export const NOW_LIST = [
  'shipping a small prototype every week',
  'leveling up in Rust & WebGPU',
  'automating workflows with bots',
];

export const FUN_FACTS = ['coffee-first', 'pc builder since 2020', 'night owl', 'bot enthusiast'];

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