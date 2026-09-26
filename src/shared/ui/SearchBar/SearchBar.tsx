'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { NavIcon } from '@/shared/config/navTypes';
import { Lens, ArrowRight } from '@/shared/ui/Icon';
import { cn } from '@/shared/lib/cn';
import {
  IconButton,
  Kbd,
  CommandOverlay,
  Command,
  CommandInputRow,
  CommandInput,
  CommandList,
  CommandGroupLabel,
  CommandItem,
  CommandEmpty,
  CommandFooter,
} from '@/shared/ui';

export interface SearchItem {
  id: string;
  label: string;
  hint?: string;
  icon?: NavIcon;
  group?: string;
  href?: string;
  sectionId?: string;
}

interface SearchBarProps {
  items?: SearchItem[];
  onSelect?: (item: SearchItem) => void;
}

function isEditable(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export default function SearchBar({ items = [], onSelect }: SearchBarProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focusIndex, setFocusIndex] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.label.toLowerCase().includes(q) ||
        (it.hint?.toLowerCase().includes(q) ?? false) ||
        (it.group?.toLowerCase().includes(q) ?? false),
    );
  }, [items, query]);

  const MAX_RESULTS = 16;
  const truncated = results.length > MAX_RESULTS;
  const visible = truncated ? results.slice(0, MAX_RESULTS) : results;

  /* Group consecutive items by `group` — Vercel/Linear style sections. */
  const grouped = useMemo(() => {
    const out: { label: string | null; items: { item: SearchItem; index: number }[] }[] = [];
    visible.forEach((item, index) => {
      const label = item.group ?? null;
      const last = out[out.length - 1];
      if (last && last.label === label) last.items.push({ item, index });
      else out.push({ label, items: [{ item, index }] });
    });
    return out;
  }, [visible]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    setFocusIndex(0);
    triggerRef.current?.focus({ preventScroll: true });
  }, []);

  const run = useCallback(
    (item: SearchItem) => {
      onSelect?.(item);
      close();
    },
    [onSelect, close],
  );

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  /*  ⌘K global shortcut  */

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isEditable(e.target)) return;
        setOpen((o) => !o);
        return;
      }
      if (!open) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const dir = e.key === 'ArrowDown' ? 1 : -1;
        setFocusIndex((i) => (i + dir + visible.length) % Math.max(visible.length, 1));
      }
      if (e.key === 'Enter' && visible.length > 0) {
        e.preventDefault();
        run(visible[Math.min(focusIndex, visible.length - 1)]);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, visible, focusIndex, close, run]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-search-index="${focusIndex}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [focusIndex]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  const toggle = useCallback(() => {
    setOpen((o) => !o);
    setQuery('');
    setFocusIndex(0);
  }, []);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label="Search"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          'group hidden h-8 w-44 items-center gap-2 rounded-[var(--radius-sm)] border bg-secondary/40 px-2.5 transition-colors duration-150 outline-none focus-visible:border-[color-mix(in_srgb,currentColor_25%,transparent)] hover:bg-secondary/70 md:flex',
          open ? 'border-[color-mix(in_srgb,currentColor_25%,transparent)] text-foreground' : 'border-border/70',
        )}
      >
        <Lens className="size-3.5 shrink-0 text-muted-foreground transition-colors duration-150 group-hover:text-foreground" />
        <span className="min-w-0 flex-1 truncate text-left text-[13px] text-muted-foreground">
          Search…
        </span>
        <Kbd>⌘K</Kbd>
      </button>
      <IconButton
        size="icon-sm"
        aria-label="Search"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={toggle}
        className={cn(
          'text-muted-foreground hover:bg-secondary hover:text-foreground md:hidden',
          open && 'bg-secondary text-foreground',
        )}
      >
        <Lens className="size-4" />
      </IconButton>

      {open &&
        createPortal(
          <CommandOverlay
            onClick={(e) => {
              if (e.target === e.currentTarget) close();
            }}
          >
            <Command aria-label="Search">
              <CommandInputRow>
                <Lens className="size-3.5 shrink-0 text-muted-foreground" />
                <CommandInput
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setFocusIndex(0);
                  }}
                  placeholder="Type a section, page or skill…"
                  autoComplete="off"
                  spellCheck={false}
                />
                <Kbd>esc</Kbd>
              </CommandInputRow>
              <div
                aria-hidden="true"
                className="mx-3.5 h-px bg-[color-mix(in_srgb,currentColor_9%,transparent)]"
              />

              <CommandList ref={listRef}>
                {results.length === 0 && (
                  <CommandEmpty>
                    <Lens className="size-4 text-muted-foreground/50" />
                    <span>
                      No results for &quot;
                      {query.trim()}
                      &quot;.
                    </span>
                  </CommandEmpty>
                )}

                {grouped.map((section) => (
                  <div key={section.label ?? '__ungrouped'}>
                    {section.label && (
                      <CommandGroupLabel>{section.label}</CommandGroupLabel>
                    )}
                    {section.items.map(({ item, index: i }) => {
                      const Icon = item.icon ?? Lens;
                      return (
                        <CommandItem
                          key={item.id}
                          active={i === focusIndex}
                          data-search-index={i}
                          onMouseEnter={() => setFocusIndex(i)}
                          onClick={() => run(item)}
                        >
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate font-medium">
                            {item.label}
                          </span>
                          {item.hint && (
                            <span className="hidden max-w-[220px] shrink-0 truncate text-xs text-muted-foreground/60 sm:inline">
                              {item.hint}
                            </span>
                          )}
                          <ArrowRight
                            className={cn(
                              'size-3.5 shrink-0 transition-transform duration-150',
                              i === focusIndex
                                ? 'translate-x-0 text-foreground'
                                : 'text-muted-foreground/40',
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </div>
                ))}
              </CommandList>

              <CommandFooter>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  <span className="text-muted-foreground/70">navigate</span>
                </span>
                <span className="flex items-center gap-1.5 text-[11px]">
                  <Kbd>↵</Kbd>
                  <span className="text-muted-foreground/70">open</span>
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
                  {String(results.length).padStart(2, '0')}
                  {truncated ? '+' : ''} results
                </span>
              </CommandFooter>
            </Command>
          </CommandOverlay>,
          document.body,
        )}
    </>
  );
}