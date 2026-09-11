'use client';

import type { ReactNode } from 'react';
import { FiChevronDown } from '@/shared/ui/atoms/Icon';
import type { NavGroup } from '@/shared/config/navTypes';
import { cn } from '@/shared/lib/cn';

export function GroupDropdown({
  group,
  isActive,
  isOpen,
  pill,
  onOpen,
  onScheduleClose,
  onCancelClose,
}: {
  group: NavGroup;
  isActive: boolean;
  isOpen: boolean;
  pill?: ReactNode;
  onOpen: () => void;
  onScheduleClose: () => void;
  onCancelClose: () => void;
}) {
  return (
    <li className="relative flex">
      {pill}
      <button
        className={cn(
          'relative z-[1] flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
          isOpen || isActive
            ? 'text-foreground'
            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground',
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
        <span>{group.label}</span>
        <FiChevronDown
          className={cn(
            'size-3.5 text-muted-foreground/60 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
    </li>
  );
}