import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SegmentedProps<T extends string>
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  className,
  ...props
}: SegmentedProps<T>) {
  return (
    <div
      className={cn('flex gap-1 rounded-lg bg-secondary p-1', className)}
      {...props}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={cn(
            'flex-1 cursor-pointer rounded-md px-2 py-1 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring',
            value === option
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}