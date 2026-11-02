'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { GLOBAL_NAV } from '@/shared/config/navConfig';
import type {
  NavItem,
  NavPageConfig,
  NavActiveState,
  NavSectionLink,
} from '@/shared/config/navTypes';

/*  Route matching  */

function matchRoute(pathname: string, href: string, match: 'exact' | 'prefix' = 'prefix'): boolean {
  if (href === '/') return pathname === '/';
  return match === 'exact' ? pathname === href : pathname.startsWith(href);
}

function resolveActiveRouteId(
  pathname: string,
  items: NavItem[],
  override?: string,
): string | null {
  if (override) return override;

  for (const item of items) {
    if (item.type === 'route') {
      if (matchRoute(pathname, item.href, item.match ?? 'prefix')) {
        return item.id;
      }
    }
    if (item.type === 'group' && item.href === '/' && pathname === '/') {
      return item.id;
    }
  }

  if (pathname.startsWith('/projects/')) return 'projects';
  if (pathname.startsWith('/blog/')) return 'blog';

  return null;
}

/*  Context ─ */

interface NavContextValue {
  globalItems: NavItem[];
  pageConfig: NavPageConfig | null;
  active: NavActiveState;
  visitedSectionIds: string[];
  registerPage: (config: NavPageConfig) => void;
  clearPage: () => void;
  setActiveSection: (id: string) => void;
  markSectionVisited: (id: string) => void;
  setPageConfig: (config: NavPageConfig | null) => void;
}

const NavContext = createContext<NavContextValue>({
  globalItems: GLOBAL_NAV,
  pageConfig: null,
  active: { routeId: null, sectionId: null },
  visitedSectionIds: [],
  registerPage: () => {},
  clearPage: () => {},
  setActiveSection: () => {},
  markSectionVisited: () => {},
  setPageConfig: () => {},
});

export function useNav() {
  return useContext(NavContext);
}

/*  Provider  */

export function NavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pageConfig, setPageConfig] = useState<NavPageConfig | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [visitedSectionIds, setVisitedSectionIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(localStorage.getItem('drme_explored_sections') ?? '[]');
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });

  const registerPage = useCallback((config: NavPageConfig) => {
    setPageConfig(config);
  }, []);

  const clearPage = useCallback(() => {
    setPageConfig(null);
    setActiveSectionId(null);
  }, []);

  const setActiveSection = useCallback((id: string) => {
    setActiveSectionId((prev) => (prev === id ? prev : id));
  }, []);
  const markSectionVisited = useCallback((id: string) => {
    setVisitedSectionIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('drme_explored_sections', JSON.stringify(visitedSectionIds));
    } catch {}
  }, [visitedSectionIds]);

  useEffect(() => {
    const sectionLinks = pageConfig?.contextItems?.filter(
      (item): item is NavSectionLink => item.type === 'section',
    );
    if (!sectionLinks?.length || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const section = sectionLinks.find(
            (item) => item.targetId === (entry.target as HTMLElement).id,
          );
          if (section) markSectionVisited(section.id);
        });
      },
      { threshold: 0.12 },
    );
    sectionLinks.forEach((section) => {
      const element = document.getElementById(section.targetId);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [pageConfig, markSectionVisited]);

  const active = useMemo<NavActiveState>(
    () => ({
      routeId: resolveActiveRouteId(pathname, GLOBAL_NAV, pageConfig?.activeRouteId),
      sectionId: activeSectionId,
    }),
    [pathname, pageConfig?.activeRouteId, activeSectionId],
  );

  const value = useMemo(
    () => ({
      globalItems: GLOBAL_NAV,
      pageConfig,
      active,
      visitedSectionIds,
      registerPage,
      clearPage,
      setActiveSection,
      markSectionVisited,
      setPageConfig,
    }),
    [
      pageConfig,
      active,
      visitedSectionIds,
      registerPage,
      clearPage,
      setActiveSection,
      markSectionVisited,
      setPageConfig,
    ],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

/*  Re-exports for convenience  */

export type {
  NavPageConfig,
  NavActiveState,
  NavLeaf,
  NavSectionLink,
} from '@/shared/config/navTypes';
