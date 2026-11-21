'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { BookOpen, Cross, FolderClosed, Home, Menu, Message } from '@/shared/ui/Icon';
import { TransitionLink } from '@/features/transitions';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { scrollToTop } from '@/widgets/smooth-scrolling/lenisStore';
import styles from './MobileTabBar.module.scss';

const ROUTES = [
  { id: 'projects', label: 'Projects', href: '/projects', Icon: FolderClosed },
  { id: 'blog', label: 'Blog', href: '/blog', Icon: BookOpen },
] as const;

/**
 * Floating navigation for phones. A single round button sits in the bottom
 * right corner and slides a compact panel out to the left. The collapsed
 * button takes no horizontal space in the page layout.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { open, panel, openPanel } = useWorkspace();
  const [expanded, setExpanded] = useState(false);
  const barRef = useRef<HTMLElement>(null);

  const assistantActive = open && panel === 'assistant';
  const homeActive = pathname === '/';

  const collapse = useCallback(() => setExpanded(false), []);

  useEffect(() => {
    collapse();
  }, [pathname, collapse]);

  useEffect(() => {
    if (!expanded) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') collapse();
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!barRef.current?.contains(event.target as Node)) collapse();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [expanded, collapse]);

  const openAssistant = () => {
    collapse();
    openPanel('assistant');
  };

  return (
    <nav
      ref={barRef}
      className={styles.tabBar}
      data-expanded={expanded}
      aria-label="Primary navigation"
    >
      <div className={styles.panel} id="mobile-primary-tabs">
        {homeActive ? (
          <button
            type="button"
            className={`${styles.tab} ${styles.active}`}
            aria-label="Home"
            aria-current="page"
            onClick={() => {
              collapse();
              scrollToTop();
            }}
          >
            <Home className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>Home</span>
          </button>
        ) : (
          <TransitionLink href="/" className={styles.tab} onClick={collapse} aria-label="Home">
            <Home className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>Home</span>
          </TransitionLink>
        )}

        {ROUTES.map(({ id, label, href, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <TransitionLink
              key={id}
              href={href}
              className={`${styles.tab} ${active ? styles.active : ''}`}
              aria-label={label}
              onClick={collapse}
              {...(active ? { 'aria-current': 'page' } : {})}
            >
              <Icon className={styles.icon} aria-hidden="true" />
              <span className={styles.label}>{label}</span>
            </TransitionLink>
          );
        })}

        <button
          type="button"
          className={`${styles.tab} ${assistantActive ? styles.active : ''}`}
          onClick={openAssistant}
          aria-label="Ask the assistant"
          aria-expanded={assistantActive}
          aria-controls="assistant"
          data-active={assistantActive}
        >
          <Message className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>Ask</span>
        </button>
      </div>

      <button
        type="button"
        className={styles.toggle}
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        aria-controls="mobile-primary-tabs"
        aria-label={expanded ? 'Collapse navigation' : 'Expand navigation'}
      >
        {expanded ? (
          <Cross className={styles.toggleIcon} aria-hidden="true" />
        ) : (
          <Menu className={styles.toggleIcon} aria-hidden="true" />
        )}
      </button>
    </nav>
  );
}
