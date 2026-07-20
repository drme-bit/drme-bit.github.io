'use client';

import { useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiUser, FiZap, FiBriefcase, FiGrid, FiUsers, FiStar, FiMail, FiFileText } from 'react-icons/fi';
import styles from './DrawerMenu.module.scss';

const SECTIONS = [
  { id: 'hero', label: 'Home', Icon: FiHome },
  { id: 'about', label: 'About', Icon: FiUser },
  { id: 'skills', label: 'Skills', Icon: FiZap },
  { id: 'experience', label: 'Experience', Icon: FiBriefcase },
  { id: 'projects', label: 'Projects', Icon: FiGrid },
  { id: 'blog', label: 'Blog', Icon: FiUsers },
  { id: 'reviews', label: 'Reviews', Icon: FiStar },
  { id: 'contact', label: 'Contact', Icon: FiMail },
];

const PAGES = [
  { path: '/', label: 'Home', Icon: FiHome },
  { path: '/posts', label: 'Posts', Icon: FiFileText },
];

interface DrawerMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export default function DrawerMenu({ open, onToggle, onClose }: DrawerMenuProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const isMainPage = pathname === '/';

  const handleSectionClick = (id: string) => {
    onClose();
    if (isMainPage) {
      document.getElementById(id)?.scrollIntoView();
    } else {
      router.push(`/?scrollTo=${id}`);
    }
  };

  const handlePageClick = (path: string) => {
    onClose();
    router.push(path);
  };

  return (
    <>
      <button
        className={`${styles['drawer-trigger']} ${open ? styles['is-open'] : ''}`}
        onClick={onToggle}
        aria-label="Toggle navigation"
      >
        <span className={styles['drawer-trigger-line']} />
        <span className={styles['drawer-trigger-line']} />
        <span className={styles['drawer-trigger-line']} />
      </button>

      <div
        className={`${styles['drawer-overlay']} ${open ? styles['is-open'] : ''}`}
        onClick={onClose}
      />

      <div ref={panelRef} className={`${styles['drawer-panel']} ${open ? styles['is-open'] : ''}`}>
        <div className={styles['drawer-header']}>
          <span className={styles['drawer-header-cursor']}>{'>'}</span> navigation
        </div>

        <div className={styles['drawer-section']}>
          <div className={styles['drawer-section-label']}>// pages</div>
          <nav className={styles['drawer-nav']}>
            {PAGES.map(({ path, label, Icon }) => {
              const isActive = pathname === path;
              return (
                <button
                  key={path}
                  className={`${styles['drawer-link']} ${isActive ? styles['is-active'] : ''}`}
                  onClick={() => handlePageClick(path)}
                >
                  <Icon className={styles['drawer-link-icon']} />
                  <span className={styles['drawer-link-label']}>{label}</span>
                  {isActive && <span className={styles['drawer-link-cursor']}>_</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {isMainPage && (
          <div className={styles['drawer-section']}>
            <div className={styles['drawer-section-label']}>// sections</div>
            <nav className={styles['drawer-nav']}>
              {SECTIONS.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={styles['drawer-link']}
                  onClick={() => handleSectionClick(id)}
                >
                  <Icon className={styles['drawer-link-icon']} />
                  <span className={styles['drawer-link-label']}>{label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        <div className={styles['drawer-footer']}>
          <span className={styles['drawer-footer-text']}>esc to close</span>
        </div>
      </div>
    </>
  );
}
