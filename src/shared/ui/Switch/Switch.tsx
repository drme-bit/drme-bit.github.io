import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
        checked ? 'bg-accent' : 'border border-border/70 bg-secondary',
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          'pointer-events-none absolute top-0.5 left-0.5 flex size-4 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-200',
          checked && 'translate-x-4',
        )}
      />
    </button>
  );
}