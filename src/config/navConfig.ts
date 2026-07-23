import {
  FiHome,
  FiUser,
  FiZap,
  FiBriefcase,
  FiGrid,
  FiFileText,
  FiStar,
  FiMail,
  FiBarChart2,
  FiCalendar,
  FiDownload,
  FiMessageSquare,
  FiArrowRight,
  FiGlobe,
} from 'react-icons/fi';
import type { NavItem } from './navTypes';

/** Site-wide navigation — single source of truth */
export const GLOBAL_NAV: NavItem[] = [
  {
    id: 'home',
    type: 'group',
    label: 'home',
    icon: FiHome,
    href: '/',
    children: [
      // ── Featured cards (left column) ──
      {
        id: 'about',
        type: 'section',
        label: 'About Me',
        description: 'Background, education & what drives me to build.',
        targetId: 'about',
        icon: FiUser,
      },
      {
        id: 'skills',
        type: 'section',
        label: 'What I Do',
        description: 'Full-stack development, game servers & cloud infra.',
        targetId: 'skills',
        icon: FiZap,
      },
      {
        id: 'experience',
        type: 'section',
        label: 'My Journey',
        description: 'Career timeline, roles & key milestones.',
        targetId: 'experience',
        icon: FiBriefcase,
      },
      // ── Small items (right column) ──
      {
        id: 'contact-nav',
        type: 'section',
        label: 'Contact Me',
        targetId: 'contact',
        icon: FiMail,
      },
      {
        id: 'schedule',
        type: 'route',
        label: 'Schedule a Call',
        href: '/#contact',
        icon: FiCalendar,
      },
      {
        id: 'reviews-nav',
        type: 'section',
        label: 'Leave a Review',
        targetId: 'reviews',
        icon: FiMessageSquare,
      },
      {
        id: 'projects-nav',
        type: 'route',
        label: 'View Projects',
        href: '/projects',
        icon: FiGrid,
      },
      {
        id: 'blog-nav',
        type: 'route',
        label: 'Read Blog',
        href: '/posts',
        icon: FiFileText,
      },
    ],
  },
  {
    id: 'projects',
    type: 'group',
    label: 'projects',
    icon: FiGrid,
    href: '/projects',
    children: [
      // ── Featured cards (left column) ──
      {
        id: 'proj-nexagon',
        type: 'route',
        label: 'Nexagon',
        description: 'Game server monitoring — Rust, React, WebGPU, WASM.',
        href: '/projects/nexagon',
        icon: FiZap,
      },
      {
        id: 'proj-roblox',
        type: 'route',
        label: 'Freelance Dev',
        description: 'Custom mechanics & admin panels for Roblox/FiveM.',
        href: '/projects/fivem-roblox',
        icon: FiBriefcase,
      },
      // ── Small items (right column) ──
      {
        id: 'all-projects',
        type: 'route',
        label: 'All Projects',
        href: '/projects',
        icon: FiArrowRight,
      },
      {
        id: 'home-skills',
        type: 'section',
        label: 'Tech Stack',
        targetId: 'skills',
        icon: FiZap,
      },
      {
        id: 'home-stats',
        type: 'route',
        label: 'Stats & Activity',
        href: '/stats',
        icon: FiBarChart2,
      },
    ],
  },
  {
    id: 'blog',
    type: 'group',
    label: 'blog',
    icon: FiFileText,
    href: '/posts',
    children: [
      // ── Featured cards (left column) ──
      {
        id: 'post-portfolio',
        type: 'route',
        label: 'Building My Portfolio',
        description: 'Featured — how this site was built from scratch.',
        href: '/posts/building-my-portfolio',
        icon: FiStar,
      },
      {
        id: 'post-cobe',
        type: 'route',
        label: 'Replaced cobe with three-globe',
        description: 'Why I switched 3D globe libraries.',
        href: '/posts/why-i-replaced-cobe',
        icon: FiGlobe,
      },
      {
        id: 'post-nodejs',
        type: 'route',
        label: 'Node.js Backend',
        description: 'Integrating a Node.js backend into the stack.',
        href: '/posts/integrating-nodejs',
        icon: FiZap,
      },
      // ── Small items (right column) ──
      {
        id: 'all-posts',
        type: 'route',
        label: 'All Posts',
        href: '/posts',
        icon: FiArrowRight,
      },
      {
        id: 'blog-home',
        type: 'route',
        label: 'Back to Home',
        href: '/',
        icon: FiHome,
      },
    ],
  },
  {
    id: 'stats',
    type: 'route',
    label: 'stats',
    href: '/stats',
    icon: FiBarChart2,
    match: 'exact',
  },
];

/** Home section IDs — used for scroll observer on the landing page */
export const HOME_SECTION_IDS = [
  'about',
  'skills',
  'experience',
  'projects',
  'reviews',
  'contact',
] as const;
