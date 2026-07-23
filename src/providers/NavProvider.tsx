'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { GLOBAL_NAV } from '@/config/navConfig';
import type { NavItem, NavPageConfig, NavActiveState } from '@/config/navTypes';

/* ─── Route matching ─────────────────────────────────────── */

function matchRoute(
  pathname: string,
  href: string,
  match: 'exact' | 'prefix' = 'prefix',
): boolean {
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
  if (pathname.startsWith('/posts/')) return 'blog';

  return null;
}

/* ─── Context ────────────────────────────────────────────── */

interface NavContextValue {
  globalItems: NavItem[];
  pageConfig: NavPageConfig | null;
  active: NavActiveState;
  registerPage: (config: NavPageConfig) => void;
  clearPage: () => void;
  setActiveSection: (id: string) => void;
  setPageConfig: (config: NavPageConfig | null) => void;
}

const NavContext = createContext<NavContextValue>({
  globalItems: GLOBAL_NAV,
  pageConfig: null,
  active: { routeId: null, sectionId: null },
  registerPage: () => {},
  clearPage: () => {},
  setActiveSection: () => {},
  setPageConfig: () => {},
});

export function useNav() {
  return useContext(NavContext);
}

/* ─── Provider ───────────────────────────────────────────── */

export function NavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [pageConfig, setPageConfig] = useState<NavPageConfig | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

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
      registerPage,
      clearPage,
      setActiveSection,
      setPageConfig,
    }),
    [pageConfig, active, registerPage, clearPage, setActiveSection, setPageConfig],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

/* ─── Re-exports for convenience ─────────────────────────── */

export type { NavPageConfig, NavActiveState, NavLeaf, NavSectionLink } from '@/config/navTypes';
