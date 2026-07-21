'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  FiHome, FiUser, FiZap, FiBriefcase, FiGrid,
  FiFileText, FiStar, FiMail, FiBarChart2, FiChevronDown,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { useNav } from '@/providers/NavProvider';
import styles from './GlobalNav.module.scss';

/* ─── Default menus ──────────────────────────────────────── */

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  hash?: string;
}

interface Menu {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  items?: MenuItem[];
}

const HOME_SECTIONS: MenuItem[] = [
  { label: 'about', href: '/#about', icon: FiUser, hash: 'about' },
  { label: 'skills', href: '/#skills', icon: FiZap, hash: 'skills' },
  { label: 'experience', href: '/#experience', icon: FiBriefcase, hash: 'experience' },
  { label: 'reviews', href: '/#reviews', icon: FiStar, hash: 'reviews' },
  { label: 'contact', href: '/#contact', icon: FiMail, hash: 'contact' },
];

const DEFAULT_MENUS: Menu[] = [
  {
    label: 'projects',
    href: '/projects',
    icon: FiGrid,
  },
  {
    label: 'blog',
    href: '/posts',
    icon: FiFileText,
  },
  {
    label: 'stats',
    href: '/stats',
    icon: FiBarChart2,
  },
];

/* ─── Component ──────────────────────────────────────────── */

export default function GlobalNav() {
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastScrollY = useRef(0);

  const { config, setConfig } = useNav();
  const hasContextSections = config.sections.length > 0;

  // Reset nav config when leaving project/post pages
  useEffect(() => {
    if (!pathname.includes('/project/') && !pathname.includes('/posts/')) {
      setConfig({ sections: [] });
    }
  }, [pathname, setConfig]);

  // Collapse on scroll down, expand on scroll up
  useEffect(() => {
    const SCROLL_THRESHOLD = 60;

    const handleScroll = () => {
      const y = window.scrollY;
      const delta = y - lastScrollY.current;

      if (delta > SCROLL_THRESHOLD) {
        setCollapsed(true);
        setOpenMenu(null);
      } else if (delta < -SCROLL_THRESHOLD) {
        setCollapsed(false);
      }

      lastScrollY.current = y;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [openMenu]);

  // Close dropdown on Escape
  useEffect(() => {
    if (!openMenu) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenMenu(null); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [openMenu]);

  /** Handle dropdown item click — hash links scroll, page links navigate */
  const handleDropdownClick = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    setOpenMenu(null);

    if (item.hash && (isHome || pathname.includes('/project/'))) {
      const el = document.getElementById(item.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        config.onSectionClick?.(item.hash);
      }
    } else {
      window.location.href = item.href;
    }
  };

  const isActive = useCallback(
    (href: string) => {
      if (href === '/') return pathname === '/';
      return pathname.startsWith(href);
    },
    [pathname],
  );

  return (
    <nav
      ref={ref}
      className={`${styles.nav}${collapsed ? ` ${styles['nav--collapsed']}` : ''}${hasContextSections ? ` ${styles['nav--context']}` : ''}`}
      aria-label="Navigation"
    >
      {/* Home — direct link + dropdown */}
      <div className={styles.menuWrap}>
        <Link
          href="/"
          className={`${styles.trigger} ${styles['trigger--home']}${isHome ? ` ${styles['trigger--active']}` : ''}`}
          onClick={() => setOpenMenu(null)}
        >
          <FiHome className={styles.triggerIcon} />
          <span className={styles.triggerLabel}>home</span>
          {isHome && <span className={styles.indicator} />}
        </Link>
        <button
          className={`${styles.trigger} ${styles['trigger--chevron']}${openMenu === 'home' ? ` ${styles['trigger--open']}` : ''}`}
          onClick={() => setOpenMenu(openMenu === 'home' ? null : 'home')}
          onMouseEnter={() => {
            clearTimeout(closeTimer.current);
            setOpenMenu('home');
          }}
          onMouseLeave={() => {
            closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
          }}
          aria-label="Sections"
        >
          <FiChevronDown className={`${styles.chevron}${openMenu === 'home' ? ` ${styles['chevron--open']}` : ''}`} />
        </button>

        <div
          className={`${styles.dropdown}${openMenu === 'home' ? ` ${styles['dropdown--open']}` : ''}`}
          onMouseEnter={() => clearTimeout(closeTimer.current)}
          onMouseLeave={() => setOpenMenu(null)}
        >
          {HOME_SECTIONS.map((item) => {
            const ItemIcon = item.icon;
            const itemActive = config.activeSection === item.hash;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`${styles.dropdownLink}${itemActive ? ` ${styles['dropdownLink--active']}` : ''}`}
                onClick={(e) => handleDropdownClick(e, item)}
              >
                <ItemIcon className={styles.dropdownIcon} />
                <span className={styles.dropdownLabel}>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Main page links */}
      {DEFAULT_MENUS.map((menu) => {
        const active = isActive(menu.href!);
        const Icon = menu.icon;
        return (
          <Link
            key={menu.label}
            href={menu.href!}
            className={`${styles.trigger}${active ? ` ${styles['trigger--active']}` : ''}`}
            onClick={() => setOpenMenu(null)}
          >
            <Icon className={styles.triggerIcon} />
            <span className={styles.triggerLabel}>{menu.label}</span>
            {active && <span className={styles.indicator} />}
          </Link>
        );
      })}

      {/* Context sections (right side, separated by divider) */}
      {hasContextSections && (
        <>
          <div className={styles.divider} />
          {config.sections.map((section) => {
            const active = config.activeSection === section.id;
            return (
              <button
                key={section.id}
                className={`${styles.sectionItem}${active ? ` ${styles['sectionItem--active']}` : ''}`}
                onClick={() => config.onSectionClick?.(section.id)}
              >
                {section.label}
                {active && <span className={styles.indicator} />}
              </button>
            );
          })}
          {config.arrows?.prev && (
            <button
              className={styles.arrow}
              onClick={config.arrows.onPrev}
              aria-label="Previous"
            >
              <FiChevronLeft className={styles.arrowIcon} />
            </button>
          )}
          {config.arrows?.next && (
            <button
              className={styles.arrow}
              onClick={config.arrows.onNext}
              aria-label="Next"
            >
              <FiChevronRight className={styles.arrowIcon} />
            </button>
          )}
        </>
      )}
    </nav>
  );
}
