'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { FiArrowRight, FiGrid } from '@/shared/ui/atoms/Icon';
import { cn } from '@/shared/lib/cn';
import { Kbd, PanelSurface } from '@/shared/ui/atoms';
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

interface Action {
  label: string;
  run: () => void;
}

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
  const [rect, setRect] = useState<{ top: number; left: number; width: number } | null>(null);

  const activeGroup = useMemo(
    () => groups.find((g) => g.id === activeGroupId) ?? null,
    [groups, activeGroupId],
  );

  const actions = useMemo(() => {
    const list: Action[] = (activeGroup?.children ?? []).map((c) => ({
      label: c.label,
      run: () => {
        onNavigateLeaf(c);
        onCloseImmediate();
      },
    }));
    const href = activeGroup?.href;
    if (href) {
      list.push({
        label: `view all ${activeGroup.label}`,
        run: () => {
          onCloseImmediate();
          router.push(href);
        },
      });
    }
    return list;
  }, [activeGroup, onNavigateLeaf, onCloseImmediate, router]);

  useEffect(() => {
    setFocusIndex(0);

    const nav = document.querySelector<HTMLElement>('nav[aria-label="Navigation"]');
    if (!nav) return;

    const compute = () => {
      const r = nav.getBoundingClientRect();
      const gutter = 8;
      const width = Math.max(340, Math.min(r.width, window.innerWidth - gutter * 2, 760));
      const left = Math.max(gutter, Math.min(r.left, window.innerWidth - width - gutter));
      setRect({ top: r.bottom + 12, left, width });
    };
    compute();

    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, { passive: true });
    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute);
    };
  }, [activeGroupId]);

  /*  Click outside closes  */

  useEffect(() => {
    if (!activeGroupId) return;
    const onDown = (e: MouseEvent) => {
      const el = panelRef.current;
      if (el && e.target instanceof Node && !el.contains(e.target)) onCloseImmediate();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [activeGroupId, onCloseImmediate]);

  /*  Keyboard: ↑↓ cycle actions, ↵ run, esc close  */

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
        const next = (focusIndex + dir + actions.length) % Math.max(actions.length, 1);
        setFocusIndex(next);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        actions[focusIndex]?.run();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [activeGroupId, focusIndex, actions, onCloseImmediate]);

  useEffect(() => {
    panelRef.current
      ?.querySelector<HTMLElement>(`[data-drop-index="0"]`)
      ?.focus({ preventScroll: true });
  }, [activeGroupId]);

  if (!activeGroupId || !activeGroup || !rect) return null;

  return createPortal(
    <div
      className="pointer-events-none fixed z-[1005]"
      style={{ top: rect.top, left: rect.left, width: rect.width }}
    >
      <motion.div
        ref={panelRef}
        className="pointer-events-auto"
        initial={{ opacity: 0, y: -8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 420, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={onCancelClose}
        onMouseLeave={onClose}
      >
        <PanelSurface className="p-1.5">
          <div className="flex items-baseline justify-between gap-4 px-3 pt-1.5 pb-1">
            <div className="flex min-w-0 items-baseline gap-2.5">
              <span className="truncate font-mono text-[11px] font-semibold tracking-[0.18em] text-foreground uppercase">
                {activeGroup.label}
              </span>
              {activeGroup.description && (
                <span className="truncate text-xs text-muted-foreground/60">
                  {activeGroup.description}
                </span>
              )}
            </div>
            <span className="shrink-0 font-mono text-[10px] tracking-[0.08em] text-muted-foreground/50">
              {String(activeGroup.children.length).padStart(2, '0')}
            </span>
          </div>

          <div className="mx-3 h-px bg-border/60" />

          <div className="grid grid-cols-1 gap-0.5 p-1 pt-1.5 sm:grid-cols-2 xl:grid-cols-4">
            {activeGroup.children.map((child, i) => {
              const Icon = child.icon ?? FiGrid;
              const isActiveChild = child.type === 'route' && child.id === activeRouteId;
              return (
                <a
                  key={child.id}
                  href={leafHref(child)}
                  className={cn(
                    'group flex flex-col gap-1 rounded-lg p-2 pl-2.5 outline-none transition-colors',
                    isActiveChild
                      ? 'bg-secondary'
                      : i === focusIndex
                        ? 'bg-secondary/80'
                        : 'hover:bg-secondary/60 focus-visible:bg-secondary/80',
                  )}
                  data-drop-index={i}
                  style={
                    {
                      '--i': i,
                      animationDelay: `${i * 22}ms`,
                    } as React.CSSProperties
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    actions[i]?.run();
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground transition-colors group-hover:bg-secondary group-hover:text-foreground">
                      <Icon className="size-3.5" />
                    </span>
                    <span
                      className={cn(
                        'truncate text-[13px] font-medium text-foreground/90 transition-colors group-hover:text-foreground',
                      )}
                    >
                      {child.label}
                    </span>
                    <span
                      className={cn(
                        'size-1.5 shrink-0 rounded-full transition-colors',
                        isActiveChild ? 'bg-foreground/60' : 'bg-transparent',
                      )}
                    />
                  </span>
                  {child.description && (
                    <span className="ml-8 truncate text-[11px] leading-tight text-muted-foreground/55">
                      {child.description}
                    </span>
                  )}
                </a>
              );
            })}
          </div>

          <div className="mx-3 h-px bg-border/60" />

          <div className="flex items-center justify-between gap-4 px-3 pt-2 pb-1.5">
            <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              navigate
              <span className="hidden items-center gap-1 sm:flex">
                <Kbd>↵</Kbd>open
              </span>
            </span>
            {activeGroup.href && (
              <a
                href={activeGroup.href}
                data-drop-index={actions.length - 1}
                onClick={(e) => {
                  e.preventDefault();
                  actions[actions.length - 1]?.run();
                }}
                className="group -mx-2 flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[12px] font-medium text-muted-foreground transition-colors outline-none hover:bg-secondary/60 hover:text-foreground focus-visible:bg-secondary/80"
              >
                view all {activeGroup.label}
                <FiArrowRight className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5" />
              </a>
            )}
          </div>
        </PanelSurface>
      </motion.div>
    </div>,
    document.body,
  );
}