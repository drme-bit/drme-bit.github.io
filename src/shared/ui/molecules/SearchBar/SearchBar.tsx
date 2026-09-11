'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import type { IconType } from 'react-icons';
import { FiSearch, FiX, FiArrowRight } from '@/shared/ui/atoms/Icon';
import { cn } from '@/shared/lib/cn';
import {
  IconButton,
  Kbd,
  Chip,
  CommandOverlay,
  Command,
  CommandInputRow,
  CommandInput,
  CommandList,
  CommandItem,
  CommandEmpty,
  CommandFooter,
} from '@/shared/ui/atoms';

export interface SearchItem {
  id: string;
  label: string;
  hint?: string;
  icon?: IconType;
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
          'group hidden h-8 w-40 items-center gap-2.5 rounded-lg border border-border/70 bg-secondary/40 px-3 transition-all duration-200 outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring hover:border-border-hover hover:bg-secondary/70 lg:w-[200px] md:flex',
          open && 'border-border-hover bg-secondary text-foreground',
        )}
      >
        <FiSearch className="size-4 shrink-0 text-muted-foreground transition-colors duration-200 group-hover:text-foreground" />
        <span className="min-w-0 flex-1 truncate text-left text-[13px] text-muted-foreground">
          Search
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
        <FiSearch className="size-4" />
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
                <FiSearch className="size-4 shrink-0 text-muted-foreground" />
                <CommandInput
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setFocusIndex(0);
                  }}
                  placeholder="Search sections, pages, skills…"
                  autoComplete="off"
                  spellCheck={false}
                />
                <IconButton size="icon-sm" aria-label="Close search" onClick={close}>
                  <FiX className="size-4" />
                </IconButton>
              </CommandInputRow>

              <CommandList ref={listRef}>
                {results.length === 0 && (
                  <CommandEmpty>
                    <FiSearch className="size-5 text-muted-foreground/50" />
                    <span>
                      nothing found for &quot;
                      {query.trim()}
                      &quot;.
                    </span>
                  </CommandEmpty>
                )}

                {visible.map((item, i) => {
                  const Icon = item.icon ?? FiSearch;
                  return (
                    <CommandItem
                      key={item.id}
                      active={i === focusIndex}
                      data-search-index={i}
                      className="group animate-in fade-in-0 zoom-in-95"
                      style={{ animationDelay: `${i * 20}ms` }}
                      onMouseEnter={() => setFocusIndex(i)}
                      onClick={() => run(item)}
                    >
                      <span className="shrink-0 font-mono text-[10px] text-muted-foreground/40">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {item.group && <Chip className="shrink-0">{item.group}</Chip>}
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-accent">
                        <Icon className="size-3.5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {item.label}
                      </span>
                      {item.hint && (
                        <span className="hidden shrink-0 truncate text-xs text-muted-foreground/60 sm:inline">
                          {item.hint}
                        </span>
                      )}
                      <FiArrowRight
                        className={cn(
                          'size-3.5 shrink-0 text-muted-foreground/50 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-accent',
                          i === focusIndex && 'translate-x-0.5 text-accent',
                        )}
                      />
                    </CommandItem>
                  );
                })}
              </CommandList>

              <CommandFooter>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Kbd>↑</Kbd>
                  <Kbd>↓</Kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <Kbd>↵</Kbd>
                  open
                </span>
                <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
                  {String(results.length).padStart(2, '0')}
                  {truncated ? '+' : ''} results
                  {truncated && (
                    <span className="text-muted-foreground/40">
                      {' '}
                      — {results.length - visible.length} more
                    </span>
                  )}
                </span>
              </CommandFooter>
            </Command>
          </CommandOverlay>,
          document.body,
        )}
    </>
  );
}