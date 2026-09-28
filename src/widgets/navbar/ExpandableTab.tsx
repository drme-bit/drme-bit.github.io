'use client';

import { motion } from 'motion/react';
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
        'relative flex cursor-pointer items-center gap-1.5 px-2.5 py-1 text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
        isRouteActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
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
      {isRouteActive && (
        <motion.span
          layoutId="navUnderline"
          className="absolute inset-x-2 -bottom-[9px] h-[2px] rounded-full bg-foreground"
          transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.5 }}
        />
      )}
    </button>
  );
}