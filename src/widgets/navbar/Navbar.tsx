'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
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
  FiMenu,
  FiChevronRight,
  FiGithub,
} from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { useNav } from '@/providers/NavProvider';
import { GLOBAL_NAV } from '@/config/navConfig';
import type { NavGroup, NavRouteLink, NavSectionLink, NavLeaf } from '@/config/navTypes';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/shared/ui/organisms/Sheet/Sheet';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/ui/organisms/Accordion/Accordion';
import { Button } from '@/shared/ui/organisms/Button/Button';
import styles from './Navbar.module.scss';

/* ─── Icon map ──────────────────────────────────────────── */

const ICON_MAP: Record<string, IconType> = {
  home: FiHome,
  about: FiUser,
  skills: FiZap,
  experience: FiBriefcase,
  projects: FiGrid,
  reviews: FiStar,
  contact: FiMail,
  blog: FiFileText,
  stats: FiBarChart2,
};

function getIcon(id: string): IconType {
  return ICON_MAP[id] || FiGrid;
}

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
  const Icon = getIcon(item.id);

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
      <Icon className={styles.expandTabIcon} />
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

/* ─── Dropdown content (shared, renders inside one panel) ── */

function DropdownContent({
  group,
  onCloseImmediate,
  onLinkClick,
  slideKey,
  slideDirection,
}: {
  group: NavGroup;
  onCloseImmediate: () => void;
  onLinkClick: (item: NavSectionLink) => void;
  slideKey: string;
  slideDirection: 'left' | 'right' | null;
}) {
  const router = useRouter();
  const featured = group.children.slice(0, 3);
  const secondary = group.children.slice(3);

  const handleClick = (e: React.MouseEvent, child: NavLeaf) => {
    if (child.type === 'section') onLinkClick(child);
    else router.push(leafHref(child));
    e.preventDefault();
    onCloseImmediate();
  };

  return (
    <div
      key={slideKey}
      className={`${styles.dropdownInner} ${
        slideDirection === 'left' ? styles['dropdownInner--slideLeft']
        : slideDirection === 'right' ? styles['dropdownInner--slideRight']
        : ''
      }`}
    >
      <ul className={styles.dropdownCards}>
        {featured.map((child) => {
          const ChildIcon = child.icon || FiGrid;
          return (
            <li key={child.id}>
              <a
                href={leafHref(child)}
                className={styles['dropdownCard']}
                onClick={(e) => handleClick(e, child)}
              >
                <ChildIcon className={styles['dropdownCardIcon']} />
                <span className={styles['dropdownCardTitle']}>{child.label}</span>
                {child.description && (
                  <span className={styles['dropdownCardDesc']}>{child.description}</span>
                )}
              </a>
            </li>
          );
        })}
      </ul>
      {secondary.length > 0 && (
        <ul className={styles['dropdownSecondary']}>
          {secondary.map((child) => {
            const ChildIcon = child.icon || FiGithub;
            return(
            <li key={child.id}>
              <a
                href={leafHref(child)}
                className={styles['dropdownSmallItem']}
                onClick={(e) => handleClick(e, child)}
              >
                <ChildIcon/>
                <span className={styles['dropdownSmallItemLabel']}>{child.label}</span>
                <FiChevronRight className={styles['dropdownSmallItemArrow']} />
              </a>
            </li>
            )
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── Group trigger ──────── */

function leafHref(leaf: NavLeaf): string {
  if (leaf.type === 'route') return leaf.href;
  if (leaf.type === 'section') return `#${leaf.targetId}`;
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
  const Icon = getIcon(group.id);

  return (
    <li
      className={`${styles['dropdown']}${isOpen ? ` ${styles['dropdown--open']}` : ''}`}
      onMouseEnter={() => { onCancelClose(); onOpen(); }}
      onMouseLeave={() => onScheduleClose()}
    >
      <button
        className={`${styles.navTrigger}${isOpen ? ` ${styles['navTrigger--open']}` : ''}${isActive ? ` ${styles['navTrigger--active']}` : ''}`}
        onClick={() => {
          if (isOpen) onCancelClose();
          else onOpen();
          router.push(group.href || '/');
        }}
        aria-expanded={isOpen}
      >
        <Icon className={styles.navTriggerIcon} />
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
        <Button size="icon" variant="ghost" className={styles.menuBtn}>
          <FiMenu className={styles.menuBtnIcon} />
        </Button>
      </SheetTrigger>
      <SheetContent className={styles.sheetContent} showClose={false}>
        <div className={styles.sheetHeader}>
          <SheetClose asChild>
            <Button size="icon" variant="ghost" className={styles.sheetCloseBtn}>
              <span className={styles.sheetCloseX}>✕</span>
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>
        <div className={styles.sheetBody}>
          <Accordion type="single" collapsible>
            {groups.map((group) => (
              <AccordionItem key={group.id} value={group.id}>
                <AccordionTrigger className={styles.sheetAccordionTrigger}>
                  {group.label}
                </AccordionTrigger>
                <AccordionContent className={styles.sheetAccordionContent}>
                  <ul className={styles.sheetLinkList}>
                    {group.children.map((child) => {
                      const LinkIcon = getIcon(child.id);
                      const href = leafHref(child);
                      return (
                        <li key={child.id}>
                          <SheetClose asChild>
                            <a
                              href={href}
                              className={styles.sheetLink}
                              onClick={(e) => {
                                e.preventDefault();
                                if (child.type === 'section') {
                                  const el = document.getElementById(child.targetId);
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                } else {
                                  window.location.href = href;
                                }
                              }}
                            >
                              <LinkIcon className={styles.sheetLinkIcon} />
                              <span>{child.label}</span>
                            </a>
                          </SheetClose>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className={styles.sheetDivider} />

          {routes.map((route) => {
            const RouteIcon = getIcon(route.id);
            return (
              <SheetClose key={route.id} asChild>
                <Link href={route.href} className={styles.sheetRouteLink}>
                  <RouteIcon className={styles.sheetLinkIcon} />
                  <span>{route.label}</span>
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

  // Shared backdrop + panel container — visible when any dropdown is open
  const activeGroup = groups.find((g) => g.id === openGroupId);
  const [panelMounted, setPanelMounted] = useState(false);
  const [panelAnimState, setPanelAnimState] = useState<string | null>(null);
  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (openGroupId && !prevOpenRef.current) {
      // Opening first time — mount first, animate second
      clearTimeout(exitTimerRef.current!);
      setPanelMounted(true);
      setPanelAnimState(null);
      // Apply animation after paint
      const id = requestAnimationFrame(() => {
        setPanelAnimState(direction ? (direction === 'left' ? 'enter-left' : 'enter-right') : 'enter');
      });
      prevOpenRef.current = true;
      return () => cancelAnimationFrame(id);
    } else if (!openGroupId && prevOpenRef.current) {
      // Closing — animate out, then unmount
      setPanelAnimState('exit');
      exitTimerRef.current = setTimeout(() => {
        setPanelMounted(false);
        setPanelAnimState(null);
      }, 300);
      prevOpenRef.current = false;
    } else if (openGroupId && prevOpenRef.current) {
      // Switching — just change content direction
      setPanelAnimState(direction ? (direction === 'left' ? 'slide-left' : 'slide-right') : null);
    }
  }, [openGroupId, direction]);

  const exitTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  useEffect(() => () => clearTimeout(exitTimerRef.current!), []);

  // Reset nav config when leaving projects/post pages
  useEffect(() => {
    if (!pathname.includes('/projects/') && !pathname.includes('/posts/')) {
      setPageConfig(null);
    }
  }, [pathname, setPageConfig]);

  // Collapse on scroll — position-based thresholds
  useEffect(() => {
    const HIDE_Y = 80;
    const SHOW_Y = 20;

    const handleScroll = () => {
      const y = window.scrollY;

      if (y > HIDE_Y) {
        setCollapsed(true);
      } else if (y < SHOW_Y) {
        setCollapsed(false);
      }
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

  const sharedPanel = panelMounted && activeGroup
    ? createPortal(
        <>
          <div className={styles.dropdownBackdrop} />
          <div className={`${styles.dropdownPanel} ${
            panelAnimState === 'enter' ? styles['dropdownPanel--fade']
            : panelAnimState === 'enter-left' ? styles['dropdownPanel--fromLeft']
            : panelAnimState === 'enter-right' ? styles['dropdownPanel--fromRight']
            : panelAnimState === 'exit' ? styles['dropdownPanel--exit']
            : ''
          }`}
          onMouseEnter={cancelGroupClose}
          onMouseLeave={scheduleGroupClose}
          >
            <DropdownContent
              group={activeGroup}
              onCloseImmediate={closeGroupImmediate}
              onLinkClick={handleGroupLinkClick}
              slideKey={openGroupId!}
              slideDirection={panelAnimState?.startsWith('slide-') ? panelAnimState.replace('slide-', '') as 'left' | 'right' : null}
            />
          </div>
        </>,
        document.body,
      )
    : null;

  return (
    <nav
      ref={ref}
      className={`${styles.nav}${collapsed ? ` ${styles['nav--collapsed']}` : ''}${
        hasContextSections ? ` ${styles['nav--context']}` : ''
      }`}
      aria-label="Navigation"
      onMouseEnter={setCollapsed.bind(null, false)}
    >
      {/* Logo */}
      <Link href="/" className={styles.logo}>
        <span className={styles.logoText}>DrME</span>
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

      {/* Shared dropdown panel */}
      {sharedPanel}
    </nav>
  );
}
