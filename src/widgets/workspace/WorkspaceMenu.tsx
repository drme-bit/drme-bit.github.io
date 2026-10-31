'use client';

import * as Popover from '@radix-ui/react-popover';
import { useState } from 'react';
import { MoreHorizontal, FolderOpen, FileText, Mail, ArrowUpRight } from 'lucide-react';
import { useChat } from '@/app/providers/ChatProvider';
import styles from './WorkspaceMenu.module.scss';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';

/** Compact navigation to portfolio destinations outside the workspace panels. */
export default function WorkspaceMenu() {
  const [open, setOpen] = useState(false);
  const { setOpen: setSidebarOpen } = useChat();
  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          title="Portfolio links"
          aria-label="Portfolio links"
          className={styles.trigger}
        >
          <MoreHorizontal size={17} />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          data-workspace-menu=""
          side="top"
          align="end"
          sideOffset={10}
          className={styles.menu}
          aria-label="Portfolio links"
        >
          <p className={styles.heading}>Portfolio</p>
          {[
            { href: '/#projects', label: 'Selected projects', Icon: FolderOpen },
            { href: '/resume', label: 'Resume', Icon: FileText },
            { href: '/#contact', label: 'Get in touch', Icon: Mail },
          ].map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              className={styles.row}
              onClick={(event) => {
                setOpen(false);
                if (href.startsWith('/#') && window.location.pathname === '/') {
                  event.preventDefault();
                  scrollToTarget(href.slice(1));
                }
                if (!window.matchMedia('(min-width: 1280px)').matches) setSidebarOpen(false);
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
              <ArrowUpRight size={13} />
            </a>
          ))}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
