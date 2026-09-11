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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative z-[1] cursor-pointer rounded-lg px-2.5 py-1 text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
        isRouteActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
      )}
    >
      {item.label}
    </button>
  );
}