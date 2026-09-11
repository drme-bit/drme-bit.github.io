import {
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '@/shared/lib/cn';

export function CommandOverlay({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-in fade-in-0 fixed inset-0 z-[1100] bg-black/50 backdrop-blur-sm',
        className,
      )}
      {...props}
    />
  );
}

export function Command({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      className={cn(
        'animate-in zoom-in-95 fade-in-0 mx-auto mt-[12vh] w-[min(600px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border/90 bg-popover/95 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_25px_50px_-12px_rgba(0,0,0,0.5)] backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}

export function CommandInputRow({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-border px-4',
        className,
      )}
      {...props}
    />
  );
}

export const CommandInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-14 min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground',
        className,
      )}
      {...props}
    />
  ),
);
CommandInput.displayName = 'CommandInput';

export const CommandList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="listbox"
      className={cn(
        'max-h-[min(420px,60vh)] overflow-y-auto overscroll-contain p-1.5',
        className,
      )}
      {...props}
    />
  ),
);
CommandList.displayName = 'CommandList';

export function CommandItem({
  className,
  active,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      className={cn(
        'flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm text-muted-foreground transition-colors',
        active && 'bg-secondary text-foreground',
        'cursor-pointer outline-none hover:bg-secondary hover:text-foreground focus-visible:bg-secondary focus-visible:text-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function CommandEmpty({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 px-4 py-10 text-sm text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export function CommandFooter({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-t border-border px-4 py-2.5 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}