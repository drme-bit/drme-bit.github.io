'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FiMenu,
  FiChevronRight,
} from 'react-icons/fi';
import { useNav } from '@/providers/NavProvider';
import { GLOBAL_NAV } from '@/config/navConfig';
import type { NavGroup, NavRouteLink, NavSectionLink, NavLeaf } from '@/config/navTypes';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/shared/ui/organisms/Sheet/Sheet';

import { Button } from '@/shared/ui/organisms/Button/Button';
import { NavDropdown } from './NavDropdown';
import SearchBar from '@/shared/ui/molecules/SearchBar/SearchBar';
import ChangeTheme from '@/shared/ui/molecules/ChangeTheme/ChangeTheme';
import styles from './Navbar.module.scss';

/* ─── Expandable tab (like ExpandableTabs component) ────── */

const tabVariants = {
  initial: { gap: 0, paddingLeft: '.7rem', paddingRight: '.7rem' },
  animate: (isSelected: boolean) => ({
    gap: isSelected ? '.4rem' : 0,
    paddingLeft: isSelected ? '.85rem' : '.7rem',
    paddingRight: isSelected ? '.85rem' : '.7rem',
  }),
};

const labelVariants = {
  initial: { width: 0, opacity: 0 },
  animate: { width: 'auto', opacity: 1 },
  exit: { width: 0, opacity: 0 },
};

const springTransition = { delay: 0.1, type: 'spring' as const, bounce: 0, duration: 0.6 };

function ExpandableTab({
  item,
  isSelected,
  isRouteActive,
  onSelect,
}: {
  item: NavRouteLink;
  isSelected: boolean;
  isRouteActive: boolean;
  onSelect: () => void;
}) {
  const Icon = item.icon;

  return (
    <motion.button
      className={`${styles.expandTab}${
        isSelected || isRouteActive ? ` ${styles['expandTab--active']}` : ''
      }`}
      onClick={onSelect}
      variants={tabVariants}
      initial={false}
      animate="animate"
      custom={isSelected}
      transition={springTransition}
    >
      {Icon && <Icon className={styles.expandTabIcon} />}
      <AnimatePresence initial={false}>
        {isSelected && (
          <motion.span
            variants={labelVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springTransition}
            className={styles.expandTabLabel}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

/* ─── Group trigger ──────── */

function leafHref(leaf: NavLeaf): string {
  if (leaf.type === 'route') return leaf.href;
  if (leaf.type === 'section') return `/#${leaf.targetId}`;
  return '#';
}

function GroupDropdown({
  group,
  isActive,
  isOpen,
  onOpen,
  onScheduleClose,
  onCancelClose,
  router,
}: {
  group: NavGroup;
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
  router: ReturnType<typeof useRouter>;
}) {
  const Icon = group.icon;

  return (
    <li className={`${styles.dropdown}${isOpen ? ` ${styles['dropdown--open']}` : ''}`}>
      <button
        className={`${styles.navTrigger}${isOpen ? ` ${styles['navTrigger--open']}` : ''}${isActive ? ` ${styles['navTrigger--active']}` : ''}`}
        onClick={() => {
          if (isOpen) onCancelClose();
          else onOpen();
          router.push(group.href || '/');
        }}
        onMouseEnter={() => { onCancelClose(); onOpen(); }}
        onMouseLeave={() => onScheduleClose()}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`dropdown-${group.id}`}
        id={`trigger-${group.id}`}
      >
        {Icon && <Icon className={styles.navTriggerIcon} />}
        <span className={styles.navTriggerLabel}>{group.label}</span>
      </button>
    </li>
  );
}

/* ─── Mobile: Sheet nav ─────────────────────────────────── */

function MobileNav() {
  const groups = GLOBAL_NAV.filter((item): item is NavGroup => item.type === 'group');
  const routes = GLOBAL_NAV.filter((item): item is NavRouteLink => item.type === 'route');

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className={styles.menuBtn} aria-label="Open menu">
          <FiMenu className={styles.menuBtnIcon} />
        </button>
      </SheetTrigger>
      <SheetContent className={styles.sheetContent} showClose={false} side="right">
        <div className={styles.sheetHeader}>
          <span className={styles.sheetTitle}>menu</span>
          <SheetClose asChild>
            <button className={styles.sheetCloseBtn} aria-label="Close menu">
              <span className={styles.sheetCloseX}>✕</span>
            </button>
          </SheetClose>
        </div>
        <div className={styles.sheetBody}>
          {groups.map((group) => (
            <div key={group.id} className={styles.sheetGroup}>
              <span className={styles.sheetGroupLabel}>{group.label}</span>
              <ul className={styles.sheetLinkList}>
                {group.children.map((child) => {
                  const href = leafHref(child);
                  const ChildIcon = child.icon;
                  return (
                    <li key={child.id}>
                      <SheetClose asChild>
                        <a
                          href={href}
                          className={styles.sheetLink}
                          onClick={(e) => {
                            window.location.href = href;
                          }}
                        >
                          {ChildIcon && <ChildIcon className={styles.sheetLinkIcon} />}
                          <span className={styles.sheetLinkLabel}>{child.label}</span>
                        </a>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <div className={styles.sheetDivider} />

          {routes.map((route) => {
            const RouteIcon = route.icon;
            return (
              <SheetClose key={route.id} asChild>
                <Link href={route.href} className={styles.sheetRouteLink}>
                  {RouteIcon && <RouteIcon className={styles.sheetLinkIcon} />}
                  <span className={styles.sheetLinkLabel}>{route.label}</span>
                </Link>
              </SheetClose>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}

/* ─── Main Navbar ───────────────────────────────────────── */

export default function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [openGroupId, setOpenGroupId] = useState<string | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const prevGroupIndex = useRef<number>(-1);
  const closeGroupIdTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const pathname = usePathname();
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);
  const lastScrollY = useRef(0);

  const { pageConfig, setPageConfig, active, setActiveSection } = useNav();

  const groups = GLOBAL_NAV.filter((item): item is NavGroup => item.type === 'group');
  const routes = GLOBAL_NAV.filter((item): item is NavRouteLink => item.type === 'route');

  const hasContextSections = (pageConfig?.contextItems?.length ?? 0) > 0;

  const handleGroupOpen = useCallback((groupId: string) => {
    clearTimeout(closeGroupIdTimer.current!);
    const newIndex = groups.findIndex((g) => g.id === groupId);
    if (prevGroupIndex.current >= 0 && prevGroupIndex.current !== newIndex) {
      setDirection(newIndex > prevGroupIndex.current ? 'right' : 'left');
    } else {
      setDirection(null);
    }
    prevGroupIndex.current = newIndex;
    setOpenGroupId(groupId);
  }, [groups]);

  const scheduleGroupClose = useCallback(() => {
    closeGroupIdTimer.current = setTimeout(() => {
      setOpenGroupId(null);
      prevGroupIndex.current = -1;
    }, 200);
  }, []);

  const cancelGroupClose = useCallback(() => {
    clearTimeout(closeGroupIdTimer.current!);
  }, []);

  const closeGroupImmediate = useCallback(() => {
    clearTimeout(closeGroupIdTimer.current!);
    setOpenGroupId(null);
    prevGroupIndex.current = -1;
  }, []);

  // Reset nav config when leaving projects/post pages
  useEffect(() => {
    if (!pathname.includes('/projects/') && !pathname.includes('/posts/')) {
      setPageConfig(null);
    }
  }, [pathname, setPageConfig]);

  // Collapse on scroll — position-based thresholds with smooth hysteresis
  useEffect(() => {
    const HIDE_Y = 80;
    const SHOW_Y = 20;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      
      requestAnimationFrame(() => {
        const y = window.scrollY;

        if (y > HIDE_Y) {
          setCollapsed(true);
        } else if (y < SHOW_Y) {
          setCollapsed(false);
        }
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGroupLinkClick = useCallback(
    (item: NavSectionLink) => {
      if (item.type === 'section') {
        if (pathname === '/') {
          const el = document.getElementById(item.targetId);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            setActiveSection(item.id);
          }
        } else {
          window.location.href = `/#${item.targetId}`;
        }
      }
    },
    [pathname, setActiveSection],
  );

  const handleTabSelect = useCallback(
    (index: number, item: NavRouteLink) => {
      setSelectedTab(index);
      if (item.href === '/') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        window.location.href = item.href;
      }
    },
    [],
  );

  const handleContextClick = useCallback(
    (item: NavLeaf) => {
      setActiveSection(item.id);
      pageConfig?.onSectionClick?.(item.id);
    },
    [pageConfig, setActiveSection],
  );

  const activeGroup = groups.find((g) => g.id === openGroupId);

  // Render dropdown panel — always mounted, handles its own show/hide
  const dropdownPanel = (
    <NavDropdown
      key="nav-dropdown"
      groups={groups}
      activeGroupId={openGroupId}
      onClose={scheduleGroupClose}
      onCloseImmediate={closeGroupImmediate}
      onCancelClose={cancelGroupClose}
      onLinkClick={handleGroupLinkClick}
      router={router}
    />
  );

  return (
    <>
      {/* Logo — fixed left on desktop, in navbar on mobile */}
      <Link href="/" className={styles.logo} aria-label="Home">
        <svg
          className={styles.logoIcon}
          viewBox="0 0 150 136.9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="m125.6 94.2v14.8c0 2.4-1.8 4.3-4.3 4.3h-48.3c-4-0.1-7.4-3-7.4-7.3v-39.4c0-3.1-1.8-6.8-3.7-8.7l-29.4-30.8c-1.4-1.5-2.8-2.4-5.4-2.4h-14.6c-2.2 0-3.2 1.1-3.2 3.1v96.3c0 2.3 1.7 3.7 4 3.7h7.5c2.5 0.1 4.2-1.5 4.2-4.2v-82.8c0-1.4 1.5-2.6 3-1l21.1 22.5c0.2 2 1.3 2.1 1.3 4.1l0.1 57.9c0 2.1 1.2 3.5 3.4 3.5h81c3.5 0 5.8-2.4 5.8-6.1v-27.4c0-2.4-1.8-4.7-4.7-4.7h-5.8c-2.3-0.2-4.6 1.5-4.6 4.6zm-92.3-69.5v-12.6c0-1.5 0.9-2.8 2.8-2.8h96.1c4.2 0 6.9 2.9 6.9 6.8v31.2c0 1.7-0.5 3.2-2 4.3s-2.4 1-8.2 1c-1.9 0-4.9-1-4.9-5.1 0-3.2 0-16.3-0.1-18 0-2.9-2.2-5.1-5.5-5.1h-82.8-2.3v0.3zm58.6 69.2 8.8-2.9c3.5-1.1 3.7-3.6 3.7-5.2 0-7.4-0.2-39.4-0.2-40.5 0-2.5-1.8-4.7-4.5-4.7h-5.8c-1.7 0-3.4 0.7-4.9 2.3-2.5 2.7-8.2 9.8-13.2 16.1-2 2.4-2.2 4.9-2.2 8.1v5c0.1 3.9 4 6.1 6.4 3l7.9-9.7c1.1-1.2 2.6-2 2.6 0v27.4c0 1.1 0.6 1.5 1.4 1.1z"
            fill="currentColor"
          />
        </svg>
      </Link>

      {/* Search & Settings — fixed right on desktop */}
      <div className={styles.navActions}>
        <SearchBar />
        <ChangeTheme />
      </div>

      <nav
        ref={ref}
        className={`${styles.nav}${collapsed ? ` ${styles['nav--collapsed']}` : ''}${
          hasContextSections ? ` ${styles['nav--context']}` : ''
        }`}
        aria-label="Navigation"
        onMouseEnter={setCollapsed.bind(null, false)}
      >
        {/* Mobile logo */}
        <Link href="/" className={styles.mobileLogo} aria-label="Home">
          <svg
            className={styles.logoIcon}
            viewBox="0 0 150 136.9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="m125.6 94.2v14.8c0 2.4-1.8 4.3-4.3 4.3h-48.3c-4-0.1-7.4-3-7.4-7.3v-39.4c0-3.1-1.8-6.8-3.7-8.7l-29.4-30.8c-1.4-1.5-2.8-2.4-5.4-2.4h-14.6c-2.2 0-3.2 1.1-3.2 3.1v96.3c0 2.3 1.7 3.7 4 3.7h7.5c2.5 0.1 4.2-1.5 4.2-4.2v-82.8c0-1.4 1.5-2.6 3-1l21.1 22.5c0.2 2 1.3 2.1 1.3 4.1l0.1 57.9c0 2.1 1.2 3.5 3.4 3.5h81c3.5 0 5.8-2.4 5.8-6.1v-27.4c0-2.4-1.8-4.7-4.7-4.7h-5.8c-2.3-0.2-4.6 1.5-4.6 4.6zm-92.3-69.5v-12.6c0-1.5 0.9-2.8 2.8-2.8h96.1c4.2 0 6.9 2.9 6.9 6.8v31.2c0 1.7-0.5 3.2-2 4.3s-2.4 1-8.2 1c-1.9 0-4.9-1-4.9-5.1 0-3.2 0-16.3-0.1-18 0-2.9-2.2-5.1-5.5-5.1h-82.8-2.3v0.3zm58.6 69.2 8.8-2.9c3.5-1.1 3.7-3.6 3.7-5.2 0-7.4-0.2-39.4-0.2-40.5 0-2.5-1.8-4.7-4.5-4.7h-5.8c-1.7 0-3.4 0.7-4.9 2.3-2.5 2.7-8.2 9.8-13.2 16.1-2 2.4-2.2 4.9-2.2 8.1v5c0.1 3.9 4 6.1 6.4 3l7.9-9.7c1.1-1.2 2.6-2 2.6 0v27.4c0 1.1 0.6 1.5 1.4 1.1z"
              fill="currentColor"
            />
          </svg>
        </Link>

      {/* Desktop navigation */}
      <div className={styles.desktopNav}>
        <ul className={styles.navList}>
          {groups.map((group) => (
            <GroupDropdown
              key={group.id}
              group={group}
              isActive={active.routeId === group.id}
              isOpen={openGroupId === group.id}
              onOpen={() => handleGroupOpen(group.id)}
              onScheduleClose={scheduleGroupClose}
              onCancelClose={cancelGroupClose}
              router={router}
            />
          ))}

          {routes.map((route, index) => (
            <li key={route.id}>
              <ExpandableTab
                item={route}
                isSelected={selectedTab === index}
                isRouteActive={active.routeId === route.id}
                onSelect={() => handleTabSelect(index, route)}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* Context items (sections / page TOC) */}
      {hasContextSections && pageConfig?.contextItems && (
        <>
          <div className={styles.divider} />
          <div className={styles.contextItems}>
            {pageConfig.contextItems.map((item) => {
              const isActive = active.sectionId === item.id;
              return (
                <button
                  key={item.id}
                  className={`${styles.contextItem}${
                    isActive ? ` ${styles['contextItem--active']}` : ''
                  }`}
                  onClick={() => handleContextClick(item)}
                >
                  {item.label}
                  {isActive && <span className={styles.contextIndicator} />}
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* Mobile menu */}
      <MobileNav />

      {/* Dropdown panel */}
      {dropdownPanel}
    </nav>
    </>
  );
}
