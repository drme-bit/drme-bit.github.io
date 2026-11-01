'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { useChat } from '@/app/providers/ChatProvider';
import { ContentWindow } from '@/widgets/content-window';
import { WorkspaceSidebar } from '@/widgets/sidebar';
import Navbar from '@/widgets/navbar/Navbar';

interface WorkspaceProps {
  children: ReactNode;
}

/**
 * Keeps the portfolio and its assistant as two neighbouring work areas on
 * wide screens. On smaller viewports the assistant keeps its drawer behaviour, so
 * reading the page never becomes a cramped two-column exercise.
 */
export function Workspace({ children }: WorkspaceProps) {
  const { open: isChatOpen, panelWidth } = useChat();
  const reservedRight = isChatOpen ? panelWidth + 72 : 56;

  useEffect(() => {
    if (
      !window.matchMedia('(min-width: 1280px)').matches ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    window.dispatchEvent(new Event('resize'));
  }, [isChatOpen]);

  return (
    <div
      className="relative min-h-dvh min-w-0 bg-[var(--bg)]"
      style={{ '--workspace-reserved-right': `${reservedRight}px` } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-2 top-[70px] bottom-2 z-[950] hidden rounded-[14px] border border-[var(--border)] transition-[right] duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none xl:block"
        style={{ boxShadow: '0 0 0 100vmax var(--bg)', right: 'var(--workspace-reserved-right)' }}
      />
      <div
        aria-hidden="true"
        onTransitionEnd={(event) => {
          if (event.propertyName === 'width') window.dispatchEvent(new Event('resize'));
        }}
        className="pointer-events-none fixed inset-y-0 right-0 z-[1] hidden bg-[var(--bg)] transition-[width] duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none xl:block"
        style={{ width: `var(--workspace-reserved-right)` }}
      />
      <Navbar />
      <div
        className="ml-1 mr-[52px] min-w-0 pt-[70px] transition-[margin] duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none xl:ml-2 xl:mr-[var(--workspace-reserved-right)]"
      >
        <ContentWindow
          id="main"
          tone="quiet"
          className="min-w-0 overflow-x-clip rounded-[14px]"
        >
          {children}
        </ContentWindow>
      </div>
      <WorkspaceSidebar />
    </div>
  );
}
