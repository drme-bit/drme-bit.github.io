import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const chipVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] font-medium tracking-wider uppercase',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-secondary text-muted-foreground',
        accent: 'border-primary/25 bg-primary/10 text-primary',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

export interface ChipProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {}

export function Chip({ className, tone, ...props }: ChipProps) {
  return <span className={cn(chipVariants({ tone }), className)} {...props} />;
}