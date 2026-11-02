import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export type SuggestionItem = {
  id: string;
  label: string;
  value?: string;
  icon?: ReactNode;
  className?: string;
};

export type SuggestionsProps = {
  items: SuggestionItem[];
  onSelect: (item: SuggestionItem) => void;
  disabled?: boolean;
  className?: string;
  itemClassName?: string;
};

export function Suggestions({
  items,
  onSelect,
  disabled,
  className,
  itemClassName,
}: SuggestionsProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          disabled={disabled}
          title={item.value ?? item.label}
          aria-label={item.value ?? item.label}
          onClick={() => onSelect(item)}
          className={cn(
            'inline-flex h-7 items-center gap-1 rounded-[4px] border border-transparent bg-transparent px-1.5 text-[0.7rem] text-[var(--text-secondary)] transition-colors hover:bg-transparent hover:text-[var(--text)] disabled:pointer-events-none disabled:opacity-50',
            itemClassName,
            item.className,
          )}
        >
          {item.icon && <span className="inline-flex shrink-0">{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </div>
  );
}
