import type { IconType } from 'react-icons';

/* ─── Nav item types ─────────────────────────────────────── */

export type NavLinkBase = {
  id: string;
  label: string;
  icon?: IconType;
};

/** Navigates to another page */
export type NavRouteLink = NavLinkBase & {
  type: 'route';
  href: string;
  match?: 'exact' | 'prefix';
};

/** Scrolls to an element on the current page */
export type NavSectionLink = NavLinkBase & {
  type: 'section';
  targetId: string;
};

/** Runs a custom handler */
export type NavActionLink = NavLinkBase & {
  type: 'action';
  onClick: () => void;
};

export type NavLeaf = NavRouteLink | NavSectionLink | NavActionLink;

/** Item with a dropdown of section links */
export type NavGroup = NavLinkBase & {
  type: 'group';
  href?: string;
  children: NavSectionLink[];
};

export type NavItem = NavRouteLink | NavGroup;

/* ─── Page overlay (registered per route) ────────────────── */

export type NavPagination = {
  prev?: { label?: string; href: string; onClick?: () => void };
  next?: { label?: string; href: string; onClick?: () => void };
};

export type NavPageConfig = {
  /** Extra pills shown after a divider (projects TOC, etc.) */
  contextItems?: NavLeaf[];
  /** Custom scroll handler; defaults to scrollIntoView on targetId */
  onSectionClick?: (id: string) => void;
  /** Prev/next navigation (posts, projects) */
  pagination?: NavPagination;
  /** Override auto-detected active route */
  activeRouteId?: string;
};

export type NavActiveState = {
  routeId: string | null;
  sectionId: string | null;
};
