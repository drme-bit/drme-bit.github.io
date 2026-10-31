import type { HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export function PanelSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/90 bg-popover/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}

export function PanelLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'font-mono text-[10px] font-medium uppercase tracking-[0.1em] text-muted-foreground/60',
        className,
      )}
      {...props}
    />
  );
}