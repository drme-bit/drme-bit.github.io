'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNav } from '@/app/providers/NavProvider';
import { GLOBAL_NAV } from '@/shared/config/navConfig';
import type { NavGroup, NavRouteLink, NavLeaf } from '@/shared/config/navTypes';
import { cn } from '@/shared/lib/cn';
import { Separator } from '@/shared/ui';

import { ExpandableTab } from './ExpandableTab';
import { GroupDropdown } from './GroupDropdown';
import { MobileNav } from './MobileNav';
import { NavDropdown } from './NavDropdown';
import SearchBar, { type SearchItem } from '@/shared/ui/SearchBar/SearchBar';
import ChangeTheme from '@/shared/ui/ChangeTheme/ChangeTheme';
import { useChat } from '@/app/providers/ChatProvider';
import { PresenceStack } from '@/features/presence';
import { scrollToTarget, scrollToTop } from '@/widgets/smooth-scrolling/lenisStore';
import CompanionCube from '@/widgets/mascot/CompanionCube';

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
  const { open: chatOpen, toggle: toggleChat } = useChat();

  const groups = GLOBAL_NAV.filter((item): item is NavGroup => item.type === 'group');
  const routes = GLOBAL_NAV.filter((item): item is NavRouteLink => item.type === 'route');

  const handleTabSelect = useCallback((item: NavRouteLink) => {
    if (item.href === '/') {
      scrollToTop();
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
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const handleLeafNavigate = useCallback(
    (leaf: NavLeaf) => {
      if (leaf.type === 'section') {
        if (pathname === '/') {
          scrollToTarget(`#${leaf.targetId}`);
          setActiveSection(leaf.id);
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
          scrollToTarget(`#${item.sectionId}`);
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
      className="sticky top-0 z-[999] w-full px-4 transition-colors duration-300 sm:px-6"
      aria-label="Navigation"
    >
      <div className="grid h-11 w-full grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* Left edge: logo */}
        <div className="flex min-w-0 items-center justify-self-start">
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
        </div>

        {/* Center: nav pill + command palette trigger.
            The pill is always present (no pop-in): only its tint deepens. */}
        <div data-nav-pill className="flex min-w-0 items-center justify-center gap-2 justify-self-center">
          <ul
            className={cn(
              'hidden items-center gap-0.5 px-1.5 py-1 transition-colors duration-300 lg:flex',
              scrolled
                ? 'rounded-lg border border-border/60 bg-secondary/40 shadow-[0_4px_16px_-8px_rgba(0,0,0,0.5)] backdrop-blur-md'
                : 'rounded-lg border border-border/40 bg-secondary/20',
            )}
          >
            {groups.map((group) => {
              const groupActive = active.routeId === group.id;
              return (
                <GroupDropdown
                  key={group.id}
                  group={group}
                  isActive={groupActive}
                  isOpen={openGroupId === group.id}
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
                  <ExpandableTab
                    item={route}
                    isRouteActive={routeActive}
                    onSelect={() => handleTabSelect(route)}
                  />
                </li>
              );
            })}
          </ul>

          <Separator orientation="vertical" className="hidden h-5 lg:block" />
          <SearchBar items={searchItems} onSelect={handleSearchSelect} />
        </div>

        {/* Right edge: presence, ask AI + settings */}
        <div className="flex shrink-0 items-center gap-1.5 justify-self-end">
          <PresenceStack />
          <button
            type="button"
            onClick={toggleChat}
            aria-label={chatOpen ? 'Close AI chat' : 'Open AI chat'}
            aria-expanded={chatOpen}
            className={cn(
              'flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 font-mono text-[12px] font-medium lowercase tracking-[0.08em] transition-all active:scale-95',
              chatOpen
                ? 'border-[var(--accent-secondary)]/50 bg-[var(--accent-secondary)]/15 text-[var(--text)]'
                : 'border-border/40 bg-secondary/20 text-muted-foreground hover:border-[var(--accent-secondary)]/40 hover:text-foreground',
            )}
          >
            <CompanionCube size={15} />
            <span className="max-sm:hidden">ask</span>
          </button>
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