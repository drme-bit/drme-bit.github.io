'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { useNav } from '@/app/providers/NavProvider';
import { GLOBAL_NAV } from '@/shared/config/navConfig';
import type { NavGroup, NavRouteLink, NavLeaf } from '@/shared/config/navTypes';
import { cn } from '@/shared/lib/cn';
import { Separator } from '@/shared/ui/atoms';

import { ExpandableTab } from './ExpandableTab';
import { GroupDropdown } from './GroupDropdown';
import { MobileNav } from './MobileNav';
import { NavDropdown } from './NavDropdown';
import SearchBar, { type SearchItem } from '@/shared/ui/molecules/SearchBar/SearchBar';
import ChangeTheme from '@/shared/ui/molecules/ChangeTheme/ChangeTheme';

const pillSpring = { type: 'spring' as const, stiffness: 420, damping: 32, mass: 0.6 };

function LogoMark() {
  return (
    <svg
      data-nav-logo
      className="size-6 shrink-0 text-foreground transition-colors"
      viewBox="0 0 150 136.9"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="m125.6 94.2v14.8c0 2.4-1.8 4.3-4.3 4.3h-48.3c-4-0.1-7.4-3-7.4-7.3v-39.4c0-3.1-1.8-6.8-3.7-8.7l-29.4-30.8c-1.4-1.5-2.8-2.4-5.4-2.4h-14.6c-2.2 0-3.2 1.1-3.2 3.1v96.3c0 2.3 1.7 3.7 4 3.7h7.5c2.5 0.1 4.2-1.5 4.2-4.2v-82.8c0-1.4 1.5-2.6 3-1l21.1 22.5c0.2 2 1.3 2.1 1.3 4.1l0.1 57.9c0 2.1 1.2 3.5 3.4 3.5h81c3.5 0 5.8-2.4 5.8-6.1v-27.4c0-2.4-1.8-4.7-4.7-4.7h-5.8c-2.3-0.2-4.6 1.5-4.6 4.6zm-92.3-69.5v-12.6c0-1.5 0.9-2.8 2.8-2.8h96.1c4.2 0 6.9 2.9 6.9 6.8v31.2c0 1.7-0.5 3.2-2 4.3s-2.4 1-8.2 1c-1.9 0-4.9-1-4.9-5.1 0-3.2 0-16.3-0.1-18 0-2.9-2.2-5.1-5.5-5.1h-82.8-2.3v0.3zm58.6 69.2 8.8-2.9c3.5-1.1 3.7-3.6 3.7-5.2 0-7.4-0.2-39.4-0.2-40.5 0-2.5-1.8-4.7-4.5-4.7h-5.8c-1.7 0-3.4 0.7-4.9 2.3-2.5 2.7-8.2 9.8-13.2 16.1-2 2.4-2.2 4.9-2.2 8.1v5c0.1 3.9 4 6.1 6.4 3l7.9-9.7c1.1-1.2 2.6-2 2.6 0v27.4c0 1.1 0.6 1.5 1.4 1.1z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const closeGroupIdTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLElement>(null);

  const { pageConfig, setPageConfig, active, setActiveSection } = useNav();

  const groups = GLOBAL_NAV.filter((item): item is NavGroup => item.type === 'group');
  const routes = GLOBAL_NAV.filter((item): item is NavRouteLink => item.type === 'route');

  const handleTabSelect = useCallback((item: NavRouteLink) => {
    if (item.href === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.location.href = item.href;
    }
  }, []);

  const handleGroupOpen = useCallback((groupId: string) => {
    clearTimeout(closeGroupIdTimer.current!);
    setOpenGroupId(groupId);
  }, []);

  const scheduleGroupClose = useCallback(() => {
    closeGroupIdTimer.current = setTimeout(() => {
      setOpenGroupId(null);
    }, 180);
  }, []);

  const cancelGroupClose = useCallback(() => {
    clearTimeout(closeGroupIdTimer.current!);
  }, []);

  const closeGroupImmediate = useCallback(() => {
    clearTimeout(closeGroupIdTimer.current!);
    setOpenGroupId(null);
  }, []);

  useEffect(() => {
    if (!pathname.includes('/projects/') && !pathname.includes('/blog/')) {
      setPageConfig(null);
    }
  }, [pathname, setPageConfig]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLeafNavigate = useCallback(
    (leaf: NavLeaf) => {
      if (leaf.type === 'section') {
        if (pathname === '/') {
          const el = document.getElementById(leaf.targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(leaf.id);
          }
        } else {
          window.location.href = `/#${leaf.targetId}`;
        }
      } else if (leaf.type === 'route') {
        router.push(leaf.href);
      }
    },
    [pathname, router, setActiveSection],
  );

  const searchItems = useMemo(() => {
    const list: SearchItem[] = [];
    groups.forEach((g) =>
      g.children.forEach((c) => {
        const base: SearchItem = {
          id: c.id,
          label: c.label,
          hint: c.description,
          icon: c.icon,
          group: g.label,
        };
        if (c.type === 'route') base.href = c.href;
        else if (c.type === 'section') base.sectionId = c.targetId;
        list.push(base);
      }),
    );
    routes.forEach((r) => list.push({ id: r.id, label: r.label, icon: r.icon, href: r.href }));
    pageConfig?.contextItems?.forEach((c) => {
      if (c.type === 'section') {
        list.push({ id: c.id, label: c.label, sectionId: c.targetId });
      } else if (c.type === 'route') {
        list.push({ id: c.id, label: c.label, href: c.href });
      }
    });
    return list;
  }, [groups, routes, pageConfig]);

  const handleSearchSelect = useCallback(
    (item: SearchItem) => {
      if (item.sectionId) {
        if (pathname === '/') {
          const el = document.getElementById(item.sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(item.sectionId);
        } else {
          window.location.href = `/#${item.sectionId}`;
        }
      } else if (item.href) {
        window.location.href = item.href;
      }
    },
    [pathname, setActiveSection],
  );

  const dropdownPanel = (
    <NavDropdown
      key="nav-dropdown"
      groups={groups}
      routes={routes}
      activeGroupId={openGroupId}
      activeRouteId={active.routeId}
      onClose={scheduleGroupClose}
      onCloseImmediate={closeGroupImmediate}
      onCancelClose={cancelGroupClose}
      onNavigateLeaf={handleLeafNavigate}
      router={router}
    />
  );

  return (
    <nav
      ref={ref}
      data-section={active.sectionId || undefined}
      className={cn(
        'sticky top-0 z-[999] mx-auto w-full max-w-5xl px-4 transition-all duration-300 ease-out sm:px-6',
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-xl md:top-3 md:max-w-4xl md:rounded-2xl md:border md:border-border md:bg-popover/85 md:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] md:backdrop-blur-2xl'
          : 'border-b border-transparent',
      )}
      aria-label="Navigation"
    >
      <div
        className={cn(
          'mx-auto flex h-11 w-full items-center justify-between gap-3 transition-all duration-300 ease-out',
          scrolled && 'md:h-9',
        )}
      >
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 text-foreground transition-opacity hover:opacity-80"
          aria-label="Home"
        >
          <LogoMark />
          <span className="hidden font-mono text-[13px] font-semibold lowercase tracking-[0.14em] sm:inline">
            drme<span className="text-accent">_</span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-center lg:flex">
          <ul className="flex items-center gap-0.5">
            {groups.map((group) => {
              const groupActive = active.routeId === group.id;
              return (
                <GroupDropdown
                  key={group.id}
                  group={group}
                  isActive={groupActive}
                  isOpen={openGroupId === group.id}
                  pill={
                    groupActive ? (
                      <motion.span
                        layoutId="navActive"
                        className="absolute inset-0 rounded-lg bg-secondary"
                        transition={pillSpring}
                      />
                    ) : undefined
                  }
                  onOpen={() => handleGroupOpen(group.id)}
                  onScheduleClose={scheduleGroupClose}
                  onCancelClose={cancelGroupClose}
                />
              );
            })}

            {routes.map((route) => {
              const routeActive = active.routeId === route.id;
              return (
                <li key={route.id} className="relative flex">
                  {routeActive && (
                    <motion.span
                      layoutId="navActive"
                      className="absolute inset-0 rounded-lg bg-secondary"
                      transition={pillSpring}
                    />
                  )}
                  <ExpandableTab
                    item={route}
                    isRouteActive={routeActive}
                    onSelect={() => handleTabSelect(route)}
                  />
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <SearchBar items={searchItems} onSelect={handleSearchSelect} />
          <Separator orientation="vertical" className="hidden h-5 sm:block" />
          <div className="flex items-center gap-0.5">
            <div className="hidden sm:flex">
              <ChangeTheme />
            </div>
            <MobileNav />
          </div>
        </div>
      </div>

      {dropdownPanel}
    </nav>
  );
}