'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
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
  FiChevronDown,
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

const HOME_SECTIONS: MenuItem[] = [
  { label: 'about', href: '/#about', icon: FiUser, hash: 'about' },
  { label: 'skills', href: '/#skills', icon: FiZap, hash: 'skills' },
  { label: 'experience', href: '/#experience', icon: FiBriefcase, hash: 'experience' },
  { label: 'reviews', href: '/#reviews', icon: FiStar, hash: 'reviews' },
  { label: 'contact', href: '/#contact', icon: FiMail, hash: 'contact' },
];

const DEFAULT_MENUS = [
  { label: 'projects', href: '/projects', icon: FiGrid },
  { label: 'blog', href: '/posts', icon: FiFileText },
  { label: 'stats', href: '/stats', icon: FiBarChart2 },
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

  const { pageConfig, setPageConfig, active, setActiveSection } = useNav();

  const hasContextSections = (pageConfig?.contextItems?.length ?? 0) > 0;

  // Reset nav config when leaving projects/post pages
  useEffect(() => {
    if (!pathname.includes('/projects/') && !pathname.includes('/posts/')) {
      setPageConfig(null);
    }
  }, [pathname, setPageConfig]);

  // Collapse on scroll
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

  // Close dropdown handlers (outside click + Escape)
  useEffect(() => {
    if (!openMenu) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenMenu(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openMenu]);

  const handleDropdownClick = (e: React.MouseEvent, item: MenuItem) => {
    e.preventDefault();
    setOpenMenu(null);

    if (item.hash && isHome) {
      const el = document.getElementById(item.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        setActiveSection(item.hash);
      }
    } else {
      window.location.href = item.href;
    }
  };

  return (
    <nav
      ref={ref}
      className={`${styles.nav}${collapsed ? ` ${styles['nav--collapsed']}` : ''}${
        hasContextSections ? ` ${styles['nav--context']}` : ''
      }`}
      aria-label="Navigation"
    >
      {/* Home + Dropdown */}
      <div className={styles.menuWrap}>
        <Link
          href="/"
          className={`${styles.trigger} ${styles['trigger--home']}${isHome ? ` ${styles['trigger--active']}` : ''}`}
        >
          <FiHome className={styles.triggerIcon} />
          <span className={styles.triggerLabel}>home</span>
          {isHome && <span className={styles.indicator} />}
        </Link>

        <button
          className={`${styles.trigger} ${styles['trigger--chevron']}${openMenu === 'home' ? ` ${styles['trigger--open']}` : ''}`}
          onClick={() => setOpenMenu(openMenu === 'home' ? null : 'home')}
        >
          <FiChevronDown
            className={`${styles.chevron}${openMenu === 'home' ? ` ${styles['chevron--open']}` : ''}`}
          />
        </button>

        <div
          className={`${styles.dropdown}${openMenu === 'home' ? ` ${styles['dropdown--open']}` : ''}`}
        >
          {HOME_SECTIONS.map((item) => {
            const ItemIcon = item.icon;
            const isActive = active.sectionId === item.hash;

            return (
              <a
                key={item.label}
                href={item.href}
                className={`${styles.dropdownLink}${isActive ? ` ${styles['dropdownLink--active']}` : ''}`}
                onClick={(e) => handleDropdownClick(e, item)}
              >
                <ItemIcon className={styles.dropdownIcon} />
                <span className={styles.dropdownLabel}>{item.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Default Menus */}
      {DEFAULT_MENUS.map((menu) => {
        const activeLink = pathname.startsWith(menu.href);
        const Icon = menu.icon;

        return (
          <Link
            key={menu.label}
            href={menu.href}
            className={`${styles.trigger}${activeLink ? ` ${styles['trigger--active']}` : ''}`}
          >
            <Icon className={styles.triggerIcon} />
            <span className={styles.triggerLabel}>{menu.label}</span>
            {activeLink && <span className={styles.indicator} />}
          </Link>
        );
      })}

      {/* Context Items (for projects/posts) */}
      {hasContextSections && pageConfig?.contextItems && (
        <>
          <div className={styles.divider} />
          {pageConfig.contextItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.sectionItem}${active.sectionId === item.id ? ` ${styles['sectionItem--active']}` : ''}`}
              onClick={() =>  {
                setActiveSection(item.id);
                pageConfig?.onSectionClick?.(item.id);
              }
              }
            >
              {item.label}
              {active.sectionId === item.id && <span className={styles.indicator} />}
            </button>
          ))}
        </>
      )}
    </nav>
  );
}
