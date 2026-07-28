'use client';

import { useCallback, type MouseEvent, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { usePageTransition, type TransitionRect } from './PageTransitionContext';

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TransitionLink({
  href,
  children,
  className,
  onClick,
}: TransitionLinkProps) {
  const router = useRouter();
  const { setOrigin, setPhase } = usePageTransition();

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();

      if (onClick) onClick();

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const origin: TransitionRect = {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };

      setOrigin(origin);
      setPhase('closing');
      router.push(href);
    },
    [href, router, setOrigin, setPhase, onClick],
  );

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
