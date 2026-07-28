'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { FiGrid } from '@/shared/ui/atoms/Icon';
import styles from './Navbar.module.scss';
import type { NavGroup, NavLeaf, NavSectionLink } from '@/config/navTypes';

interface NavDropdownProps {
  groups: NavGroup[];
  activeGroupId: string | null;
  onClose: () => void;
  onCloseImmediate: () => void;
  onCancelClose: () => void;
  onLinkClick: (item: NavSectionLink) => void;
  router: ReturnType<typeof import('next/navigation').useRouter>;
}

function leafHref(leaf: NavLeaf): string {
  if (leaf.type === 'route') return leaf.href;
  if (leaf.type === 'section') return `/#${leaf.targetId}`;
  return '#';
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
  const activeGroup = useMemo(() => groups.find(g => g.id === activeGroupId) ?? null, [groups, activeGroupId]);

  useEffect(() => {
    if (activeGroupId) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [activeGroupId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onCloseImmediate();
    }
  }, [onCloseImmediate]);

  useEffect(() => {
    if (!activeGroupId) return;
    const handler = (e: KeyboardEvent) => handleKeyDown(e);
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [activeGroupId, handleKeyDown]);

  const handleMouseEnter = useCallback(() => {
    onCancelClose();
  }, [onCancelClose]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      onClose();
    }
  }, [onClose]);

  const handleItemClick = useCallback((leaf: NavLeaf) => {
    if (leaf.type === 'section') {
      onLinkClick(leaf);
    } else {
      router.push(leafHref(leaf));
    }
    onCloseImmediate();
  }, [onLinkClick, router, onCloseImmediate]);

  if (!activeGroupId || !activeGroup) return null;

  return createPortal(
    <>
      <div className={styles.dropdownBackdrop} />
      <div
        ref={panelRef}
        className={styles.dropdownPanel}
        role="menu"
        aria-label="Navigation"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.dropdownInner}>
          {activeGroup.children.map((child) => {
            const ChildIcon = child.icon ?? FiGrid;
            return (
              <a
                key={child.id}
                href={leafHref(child)}
                className={styles.dropdownItem}
                onClick={(e) => { e.preventDefault(); handleItemClick(child); }}
                role="menuitem"
              >
                <ChildIcon className={styles.dropdownItemIcon} />
                <div className={styles.dropdownItemText}>
                  <span className={styles.dropdownItemLabel}>{child.label}</span>
                  {child.description && (
                    <span className={styles.dropdownItemDesc}>{child.description}</span>
                  )}
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );
}
