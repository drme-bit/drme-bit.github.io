'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion } from 'motion/react';
import { ArrowRight } from '@/shared/ui/Icon';
import { cn } from '@/shared/lib/cn';
import type { NavGroup, NavLeaf, NavRouteLink } from '@/shared/config/navTypes';

interface NavDropdownProps {
  groups: NavGroup[];
  routes: NavRouteLink[];
  activeGroupId: string | null;
  activeRouteId: string | null;
  onClose: () => void;
  onCloseImmediate: () => void;
  onCancelClose: () => void;
  onNavigateLeaf: (leaf: NavLeaf) => void;
  router: ReturnType<typeof import('next/navigation').useRouter>;
}

function leafHref(leaf: NavLeaf): string {
  if (leaf.type === 'route') return leaf.href;
  if (leaf.type === 'section') return `/#${leaf.targetId}`;
  return '#';
}

/*
 * Linear/Vercel command surface: monochrome 16px glyphs, no tiles,
 * no color accents. Featured rows carry a second description line,
 * plain links are single-line. Tiny captions carry the hierarchy.
 */
export function NavDropdown({
  groups,
  activeGroupId,
  activeRouteId,
  onClose,
  onCloseImmediate,
  onCancelClose,
  onNavigateLeaf,
  router,
}: NavDropdownProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [focusIndex, setFocusIndex] = useState(0);
  const [prevGroupId, setPrevGroupId] = useState(activeGroupId);
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  /* Reset keyboard focus when a different group opens (render-phase
     adjustment: no cascading effect render). */
  if (prevGroupId !== activeGroupId) {
    setPrevGroupId(activeGroupId);
    setFocusIndex(0);
  }

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  const featured = useMemo(() => activeGroup?.children.filter((c) => c.featured) ?? [], [activeGroup]);
  const links = useMemo(() => activeGroup?.children.filter((c) => !c.featured) ?? [], [activeGroup]);
  const rows = useMemo(() => [...featured, ...links], [featured, links]);

  /* Span the full center pill; follow scroll/resize while open. */
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>('nav[aria-label="Navigation"]');
    if (!nav) return;

    const compute = () => {
      const gutter = 8;
      const pill = document.querySelector<HTMLElement>('[data-nav-pill]');
      const pillRect = pill?.getBoundingClientRect();
      // Panel stretches across the whole pill, clamped to the viewport.
      const width = pillRect
        ? Math.min(pillRect.width, window.innerWidth - gutter * 2)
        : Math.min(nav.getBoundingClientRect().width, window.innerWidth - gutter * 2, 460);
      const left = pillRect
        ? Math.max(gutter, Math.min(pillRect.left, window.innerWidth - width - gutter))
        : gutter;
      const top = (pillRect ?? nav.getBoundingClientRect()).bottom + 8;
      setRect({ top, left, width });
    };
    compute();

    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, { passive: true });
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute);
    };
  }, [activeGroupId]);

  /* Click outside closes. */
  useEffect(() => {
    if (!activeGroupId) return;
    const onDown = (e: MouseEvent) => {
      const el = panelRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) onCloseImmediate();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [activeGroupId, onCloseImmediate]);

  const runLeaf = (leaf: NavLeaf) => {
    onNavigateLeaf(leaf);
    onCloseImmediate();
  };

  /* Keyboard: ↑↓ cycle, ↵ run, esc close. */
  useEffect(() => {
    if (!activeGroupId || !panelRef.current) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseImmediate();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        setFocusIndex((i) => (i + dir + rows.length) % Math.max(rows.length, 1));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const leaf = rows[focusIndex];
        if (leaf) runLeaf(leaf);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId, focusIndex, rows, onCloseImmediate]);

  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLElement>('[data-drop-index="0"]')
      ?.focus({ preventScroll: true });
  }, [activeGroupId]);

  if (!activeGroupId || !activeGroup || !rect) return null;

  const rowClass = (focused: boolean, active = false) =>
    cn(
      'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left outline-none transition-colors duration-100',
      active || focused
        ? 'bg-secondary text-foreground'
        : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground',
    );

  const renderFeatured = (child: NavLeaf, dropIndex: number) => {
    return (
      <a
        key={child.id}
        href={leafHref(child)}
        role="menuitem"
        data-drop-index={dropIndex}
        onMouseEnter={() => setFocusIndex(dropIndex)}
        onClick={(e) => {
          e.preventDefault();
          runLeaf(child);
        }}
        className={rowClass(dropIndex === focusIndex)}
      >
        {child.image ? (
          <span className="relative block h-[72px] w-[112px] shrink-0 self-start overflow-hidden rounded-md border border-border" aria-hidden="true">
            <Image
              src={child.image}
              alt=""
              width={224}
              height={144}
              sizes="224px"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </span>
        ) : child.tint ? (
          <span
            aria-hidden="true"
            style={{
              backgroundColor: `color-mix(in srgb, ${child.tint} 13%, transparent)`,
              borderColor: `color-mix(in srgb, ${child.tint} 30%, transparent)`,
            }}
            className="flex h-[72px] w-[112px] shrink-0 items-center justify-center self-start overflow-hidden rounded-md border"
          >
            <span
              className="font-mono text-[13px] font-semibold tracking-tight"
              style={{ color: child.tint }}
            >
              {child.glyph ?? child.label.slice(0, 2).toUpperCase()}
            </span>
          </span>
        ) : null}
        <span className="min-w-0 flex-1 self-center">
          <span className="block truncate text-[13px] text-foreground">{child.label}</span>
          {child.description && (
            <span className="mt-px line-clamp-2 block text-[12px] leading-snug text-muted-foreground">
              {child.description}
            </span>
          )}
        </span>
      </a>
    );
  };

  const renderLink = (child: NavLeaf, dropIndex: number) => {
    const Icon = child.icon;
    const isActiveChild = child.type === 'route' && child.id === activeRouteId;
    return (
      <a
        key={child.id}
        href={leafHref(child)}
        role="menuitem"
        data-drop-index={dropIndex}
        onMouseEnter={() => setFocusIndex(dropIndex)}
        onClick={(e) => {
          e.preventDefault();
          runLeaf(child);
        }}
        className={rowClass(dropIndex === focusIndex, isActiveChild)}
      >
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        <span className="min-w-0 flex-1 truncate text-[13px]">{child.label}</span>
      </a>
    );
  };

  return createPortal(
    <div
      className="pointer-events-none fixed z-[1005]"
      style={{ top: rect.top, left: rect.left, width: rect.width }}
    >
      <motion.div
        ref={panelRef}
        className="pointer-events-auto overflow-hidden rounded-lg border border-border bg-popover shadow-lg shadow-black/10"
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.14, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={onCancelClose}
        onMouseLeave={onClose}
        role="menu"
        aria-label={activeGroup.label}
      >
        <div role="none" className="max-h-[min(380px,56vh)] overflow-y-auto overscroll-contain p-1.5">
          <p className="m-0 px-2.5 pb-1 pt-1.5 text-[11px] font-medium text-muted-foreground/70">
            {activeGroup.label}
          </p>
          <div
            role="none"
            className={cn(
              featured.length > 0 && links.length > 0 && 'grid grid-cols-[1.25fr_1fr] gap-1',
            )}
          >
            {featured.length > 0 && (
              <div role="none" className="flex min-w-0 flex-col gap-0.5">
                {featured.map((child) => renderFeatured(child, rows.indexOf(child)))}
              </div>
            )}
            {links.length > 0 && (
              <div
                role="none"
                className={cn(
                  'flex min-w-0 flex-col gap-0.5',
                  featured.length > 0 && 'border-l border-border pl-1',
                )}
              >
                {links.map((child) => renderLink(child, rows.indexOf(child)))}
              </div>
            )}
          </div>
          {activeGroup.href && (
            <a
              href={activeGroup.href}
              onClick={(e) => {
                e.preventDefault();
                onCloseImmediate();
                router.push(activeGroup.href as string);
              }}
              className="mt-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left outline-none transition-colors duration-100 text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
            >
              <ArrowRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span className="min-w-0 flex-1 truncate text-[13px]">
                View all {activeGroup.label.toLowerCase()}
              </span>
            </a>
          )}
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
