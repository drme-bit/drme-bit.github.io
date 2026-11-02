import {
  forwardRef,
  type HTMLAttributes,
  type InputHTMLAttributes,
} from 'react';
import { cn } from '@/shared/lib/cn';

/* Vercel/Linear palette: flat surface, 8px shell, 6px rows,
   hairline + stacked shadow, border-only glow on active. */

export function CommandOverlay({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-in fade-in-0 fixed inset-0 z-[1100] bg-black/60 backdrop-blur-[2px]',
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
        'animate-in fade-in-0 mx-auto mt-[14vh] w-[min(640px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-[color-mix(in_srgb,currentColor_9%,transparent)] bg-popover shadow-[0_16px_40px_-12px_rgba(0,0,0,0.6),0_4px_12px_rgba(0,0,0,0.4)]',
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
        'flex h-12 items-center gap-2.5 px-3.5 transition-colors focus-within:bg-secondary/30',
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
        'min-w-0 flex-1 bg-transparent text-[14px] font-normal text-foreground outline-none placeholder:text-muted-foreground/70',
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
      data-lenis-prevent
      className={cn(
        'max-h-[min(380px,56vh)] overflow-y-auto overscroll-contain p-1.5',
        className,
      )}
      {...props}
    />
  ),
);
CommandList.displayName = 'CommandList';

export function CommandGroupLabel({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-2.5 pb-1 pt-2.5 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground/70 first:pt-1.5',
        className,
      )}
      {...props}
    />
  );
}

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
        'flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] border border-transparent px-2.5 py-2 text-left text-[13px] outline-none transition-[background-color,border-color] duration-100',
        active
          ? 'border-[color-mix(in_srgb,currentColor_22%,transparent)] bg-secondary text-foreground'
          : 'text-muted-foreground hover:bg-secondary/70 hover:text-foreground focus-visible:border-[color-mix(in_srgb,currentColor_22%,transparent)] focus-visible:bg-secondary focus-visible:text-foreground',
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
        'flex flex-col items-center justify-center gap-2 px-4 py-10 text-[13px] text-muted-foreground',
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
        'flex items-center gap-4 border-t px-3.5 py-2 text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}
