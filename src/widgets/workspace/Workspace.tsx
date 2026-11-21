'use client';

import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { ContentWindow } from '@/widgets/content-window';
import { WorkspaceSidebar } from '@/widgets/sidebar';
import Navbar from '@/widgets/navbar/Navbar';
import { MobileTabBar } from '@/widgets/navbar/MobileTabBar';

interface WorkspaceProps {
  children: ReactNode;
}

/**
 * Keeps the portfolio and its assistant as two neighbouring work areas on
 * wide screens. On phones the workspace chrome collapses to a single column
 * with a bottom tab bar: no fixed rail, no reserved gutter, no nested frame.
 */
export function Workspace({ children }: WorkspaceProps) {
  const { open: isWorkspaceOpen, panelWidth } = useWorkspace();
  const reservedRight = isWorkspaceOpen ? panelWidth + 72 : 56;

  useEffect(() => {
    if (
      !window.matchMedia('(min-width: 1280px)').matches ||
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }
    window.dispatchEvent(new Event('resize'));
  }, [isWorkspaceOpen]);

  return (
    <div
      className="relative min-h-dvh min-w-0 bg-[var(--bg)]"
      style={{ '--workspace-reserved-right': `${reservedRight}px` } as CSSProperties}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-1 top-[60px] bottom-2 z-[950] hidden rounded-[14px] border border-[var(--border)] transition-[right] duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none xl:block xl:left-2 xl:top-[70px]"
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
      <div className="ml-1 mr-[52px] min-w-0 pt-[60px] transition-[margin] duration-[360ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none max-[767px]:ml-0 max-[767px]:mr-0 max-[767px]:pt-[68px] max-[767px]:pb-[calc(76px+env(safe-area-inset-bottom))] xl:ml-2 xl:mr-[var(--workspace-reserved-right)] xl:pt-[70px]">
        <ContentWindow
          id="main"
          tone="quiet"
          className="min-w-0 overflow-clip rounded-[14px] max-[767px]:rounded-none max-[767px]:border-0"
        >
          {children}
        </ContentWindow>
      </div>
      <MobileTabBar />
      <WorkspaceSidebar />
    </div>
  );
}
