'use client';

import type { NavRouteLink } from '@/shared/config/navTypes';
import { cn } from '@/shared/lib/cn';

export function ExpandableTab({
  item,
  isRouteActive,
  onSelect,
}: {
  item: NavRouteLink;
  isRouteActive: boolean;
  onSelect: () => void;
}) {
  const ItemIcon = item.icon;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
        isRouteActive
          ? 'text-foreground after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-px after:bg-foreground'
          : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
      )}
    >
      {ItemIcon && (
        <span className={cn(
          'flex transition-colors',
          isRouteActive ? 'text-foreground' : 'text-muted-foreground/70',
        )} aria-hidden="true">
          <ItemIcon size={14} />
        </span>
      )}
      {item.label}
    </button>
  );
}
