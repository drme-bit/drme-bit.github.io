import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,currentColor_30%,transparent)] focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        ghost:
          'bg-transparent text-muted-foreground hover:bg-secondary hover:text-foreground',
        outline:
          'border border-border bg-transparent text-muted-foreground hover:border-border-hover hover:text-foreground',
        soft: 'bg-primary/10 text-primary hover:bg-primary/15 hover:text-foreground',
        // ── Geist set ──
        primary:
          'bg-[var(--text)] text-[var(--bg)] hover:opacity-90',
        secondary:
          'border border-border bg-[var(--bg-elevated)] text-foreground hover:bg-[var(--glass-hover)]',
        success:
          'bg-[var(--geist-success)] text-black hover:opacity-90 [.light_&]:text-white',
        error:
          'bg-[var(--geist-error)] text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 gap-1.5 px-2.5 text-[13px]',
        md: 'h-9 gap-2 px-3 text-sm',
        icon: 'size-9',
        'icon-sm': 'size-8',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

export interface IconButtonProps extends Omit<ButtonProps, 'size'> {
  size?: VariantProps<typeof buttonVariants>['size'];
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, size = 'icon', variant, ...props }, ref) => (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      className={cn('shrink-0', className)}
      {...props}
    />
  ),
);
IconButton.displayName = 'IconButton';

export { Button, IconButton, buttonVariants };