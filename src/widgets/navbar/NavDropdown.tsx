'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { FiChevronRight, FiGrid, FiGithub } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import styles from './Navbar.module.scss';
import type { NavGroup, NavLeaf, NavSectionLink } from '@/config/navTypes';
import { useNav } from '@/providers/NavProvider';

interface NavDropdownProps {
  groups: NavGroup[];
  activeGroupId: string | null;
  onClose: () => void;
  onCloseImmediate: () => void;
  onCancelClose: () => void;
  onLinkClick: (item: NavSectionLink) => void;
  router: ReturnType<typeof import('next/navigation').useRouter>;
}

const ICON_MAP: Record<string, IconType> = {
  home: FiGrid,
  about: FiGrid,
  skills: FiGrid,
  experience: FiGrid,
  projects: FiGrid,
  reviews: FiGrid,
  contact: FiGrid,
  blog: FiGrid,
  stats: FiGrid,
};

const GAP_REM = 0.5; // gap between carousel items in rem

function getIcon(id: string): IconType {
  return ICON_MAP[id] || FiGrid;
}

function leafHref(leaf: NavLeaf): string {
  if (leaf.type === 'route') return leaf.href;
  if (leaf.type === 'section') return `/#${leaf.targetId}`;
  return '#';
}

function GroupContent({ group, onLinkClick, onCloseImmediate, router, isActive, isFocused, onFocus, onBlur }: {
  group: NavGroup;
  onLinkClick: (item: NavSectionLink) => void;
  onCloseImmediate: () => void;
  router: ReturnType<typeof import('next/navigation').useRouter>;
  isActive: boolean;
  isFocused: boolean;
  onFocus: (type: 'featured' | 'secondary', index: number) => void;
  onBlur: () => void;
}) {
  const featured = group.children.slice(0, 3);
  const secondary = group.children.slice(3);

  const handleItemClick = (leaf: NavLeaf) => {
    if (leaf.type === 'section') {
      onLinkClick(leaf);
    } else {
      router.push(leafHref(leaf));
    }
    onCloseImmediate();
  };

  return (
    <div className={`${styles.dropdownInner} ${isActive ? styles['dropdownInner--active'] : ''}`} role="menu" aria-label={`${group.label} navigation`}>
      <ul className={styles.dropdownCards} role="none">
        {featured.map((child, index) => {
          const ChildIcon = child.icon || FiGrid;
          const focused = isFocused && isActive && index === 0;
          return (
            <li key={child.id} role="none">
              <motion.a
                href={leafHref(child)}
                className={`${styles.dropdownCard} ${focused ? styles['dropdownCard--focused'] : ''}`}
                onClick={(e) => { e.preventDefault(); handleItemClick(child); }}
                onFocus={() => onFocus('featured', index)}
                onBlur={onBlur}
                role="menuitem"
                tabIndex={isActive ? 0 : -1}
                whileTap={{ scale: 0.99 }}
                transition={{ duration: 0.2 }}
              >
                <ChildIcon className={styles.dropdownCardIcon} />
                <span className={styles.dropdownCardTitle}>{child.label}</span>
                {child.description && <span className={styles.dropdownCardDesc}>{child.description}</span>}
              </motion.a>
            </li>
          );
        })}
      </ul>
      {secondary.length > 0 && (
        <ul className={styles.dropdownSecondary} role="none">
          {secondary.map((child, index) => {
            const ChildIcon = child.icon || FiGithub;
            return (
              <li key={child.id} role="none">
                <motion.a
                  href={leafHref(child)}
                  className={styles.dropdownSmallItem}
                  onClick={(e) => { e.preventDefault(); handleItemClick(child); }}
                  onFocus={() => onFocus('secondary', index)}
                  onBlur={onBlur}
                  role="menuitem"
                  tabIndex={isActive ? 0 : -1}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.99 }}
                  transition={{ duration: 0.15 }}
                >
                  <ChildIcon />
                  <span className={styles.dropdownSmallItemLabel}>{child.label}</span>
                  <FiChevronRight className={styles.dropdownSmallItemArrow} />
                </motion.a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export function NavDropdown({
  groups,
  activeGroupId,
  onClose,
  onCloseImmediate,
  onCancelClose,
  onLinkClick,
  router,
}: NavDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [carouselX, setCarouselX] = useState(0);
  const [focusedGroupIndex, setFocusedGroupIndex] = useState(-1);
  const [focusedItemType, setFocusedItemType] = useState<'featured' | 'secondary' | null>(null);
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeGroupIndex = useMemo(() => groups.findIndex(g => g.id === activeGroupId), [groups, activeGroupId]);

  useEffect(() => {
    if (activeGroupId) {
      setCarouselX(-activeGroupIndex * 100);
    }
  }, [activeGroupIndex]);

  useEffect(() => {
    if (activeGroupId) {
      setIsMounted(true);
      clearTimeout(exitTimerRef.current!);
      const handler = (e: KeyboardEvent) => handleKeyDown(e);
      document.addEventListener('keydown', handler);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handler);
        document.body.style.overflow = '';
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [activeGroupId]);

  useEffect(() => {
    if (!activeGroupId && isMounted) {
      exitTimerRef.current = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(exitTimerRef.current!);
    }
  }, [activeGroupId, isMounted]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!activeGroupId) return;
    const activeGroup = groups[activeGroupIndex];
    const featured = activeGroup.children.slice(0, 3);
    const secondary = activeGroup.children.slice(3);
    const allItems = [...featured.map((_, i) => ({ type: 'featured', index: i })), ...secondary.map((_, i) => ({ type: 'secondary', index: i }))];

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onCloseImmediate();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (focusedItemType) {
          setFocusedItemIndex(prev => (prev + 1) % allItems.length);
        } else {
          setFocusedItemType('featured');
          setFocusedItemIndex(0);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (focusedItemType) {
          setFocusedItemIndex(prev => (prev - 1 + allItems.length) % allItems.length);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (!focusedItemType) {
          setFocusedItemType('featured');
          setFocusedItemIndex(0);
        } else if (focusedItemIndex < featured.length - 1) {
          setFocusedItemIndex(prev => prev + 1);
        } else if (secondary.length > 0) {
          setFocusedItemType('secondary');
          setFocusedItemIndex(0);
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (focusedItemType === 'secondary') {
          setFocusedItemType('featured');
          setFocusedItemIndex(Math.max(0, featured.length - 1));
        } else if (focusedItemIndex > 0) {
          setFocusedItemIndex(prev => prev - 1);
        }
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedItemType && focusedItemIndex >= 0) {
          const item = allItems[focusedItemIndex];
          const leaf = item.type === 'featured' ? featured[item.index] : secondary[item.index - featured.length];
          if (leaf.type === 'section') onLinkClick(leaf);
          else router.push(leafHref(leaf));
          onCloseImmediate();
        }
        break;
      case 'Tab':
        if (focusedGroupIndex >= 0 && focusedGroupIndex < groups.length - 1) {
          e.preventDefault();
          setFocusedGroupIndex(prev => prev + 1);
        }
        break;
    }
  }, [activeGroupId, activeGroupIndex, groups, focusedItemType, focusedItemIndex, onLinkClick, router, onCloseImmediate]);

  const handleMouseEnter = useCallback(() => {
    onCancelClose();
  }, [onCancelClose]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    // Only close if mouse actually leaves the panel (not moving between children)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      closeTimerRef.current = setTimeout(onClose, 150);
    }
  }, [onClose]);

  const handleFocus = useCallback((type: 'featured' | 'secondary', index: number) => {
    setFocusedItemType(type);
    setFocusedItemIndex(index);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedItemType(null);
    setFocusedItemIndex(-1);
  }, []);

  if (!isMounted) return null;

  const isOpen = !!activeGroupId;

  return createPortal(
    <>
      <div
        ref={panelRef}
        className={`${styles.dropdownPanel} ${isOpen ? styles['dropdownPanel--fade'] : styles['dropdownPanel--exit']}`}
        role="menu"
        aria-label="Navigation"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
<div className={styles.carouselContainer} style={{ 
    transform: `translateX(calc(${carouselX}% + ${carouselX / 100 * 0.5}rem))`
  }}>
          {groups.map((group, index) => (
            <GroupContent
              key={group.id}
              group={group}
              onLinkClick={onLinkClick}
              onCloseImmediate={onCloseImmediate}
              router={router}
              isActive={index === activeGroupIndex}
              isFocused={focusedGroupIndex === index}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
          ))}
        </div>
      </div>
      <div className={styles.dropdownBackdrop} 
           onMouseEnter={handleMouseEnter} 
           onMouseLeave={(e) => {
             if (!panelRef.current?.contains(e.relatedTarget as Node)) {
               handleMouseLeave(e);
             }
           }} 
         />
    </>,
    document.body
  );
}