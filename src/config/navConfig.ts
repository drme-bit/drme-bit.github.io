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
      { id: 'about', type: 'section', label: 'about', targetId: 'about', icon: FiUser },
      { id: 'skills', type: 'section', label: 'skills', targetId: 'skills', icon: FiZap },
      {
        id: 'experience',
        type: 'section',
        label: 'experience',
        targetId: 'experience',
        icon: FiBriefcase,
      },
      { id: 'projects', type: 'section', label: 'projects', targetId: 'projects', icon: FiGrid },
      { id: 'reviews', type: 'section', label: 'reviews', targetId: 'reviews', icon: FiStar },
      { id: 'contact', type: 'section', label: 'contact', targetId: 'contact', icon: FiMail },
    ],
  },
  {
    id: 'projects',
    type: 'route',
    label: 'projects',
    href: '/projects',
    icon: FiGrid,
    match: 'prefix',
  },
  {
    id: 'blog',
    type: 'route',
    label: 'blog',
    href: '/posts',
    icon: FiFileText,
    match: 'prefix',
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
