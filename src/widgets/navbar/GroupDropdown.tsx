'use client';

import { ChevronDown } from '@/shared/ui/Icon';
import type { NavGroup } from '@/shared/config/navTypes';
import { cn } from '@/shared/lib/cn';

export function GroupDropdown({
  group,
  isActive,
  isOpen,
  onOpen,
  onScheduleClose,
  onCancelClose,
}: {
  group: NavGroup;
  isActive: boolean;
  isOpen: boolean;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
}) {
  const GroupIcon = group.icon;
  return (
    <li className="relative flex">
      <button
        className={cn(
          'relative flex h-8 cursor-pointer items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
          isOpen || isActive
            ? 'text-foreground after:absolute after:bottom-0 after:left-2.5 after:right-2.5 after:h-px after:bg-foreground'
            : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground',
        )}
        onClick={() => {
          if (isOpen) onCancelClose();
          else onOpen();
        }}
        onMouseEnter={() => {
          onCancelClose();
          onOpen();
        }}
        onMouseLeave={() => onScheduleClose()}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={`dropdown-${group.id}`}
        id={`trigger-${group.id}`}
      >
        {GroupIcon && (
          <span className={cn(
            'flex transition-colors',
            isOpen || isActive ? 'text-foreground' : 'text-muted-foreground/70',
          )} aria-hidden="true">
            <GroupIcon size={14} />
          </span>
        )}
        <span>{group.label}</span>
        <ChevronDown
          className={cn(
            'size-3.5 text-muted-foreground/60 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
    </li>
  );
}
