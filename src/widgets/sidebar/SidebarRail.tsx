'use client';

import type { RefObject } from 'react';
import { Bell, Compass, Settings2 } from 'lucide-react';
import { FiAtSign, FiGithub, FiLinkedin, SiDiscord } from '@/shared/ui/Icon';
import type { SidebarPanel } from '@/app/providers/ChatProvider';
import { profile, socialLinks } from '@/entities/profile';
import { Separator } from '@/shared/ui';
import GuideCat from '@/widgets/mascot/GuideCat';
import WorkspaceMenu from '@/widgets/workspace/WorkspaceMenu';
import styles from './Sidebar.module.scss';

interface SidebarRailProps {
  open: boolean;
  panel: SidebarPanel;
  sending: boolean;
  unread: number;
  dockRef: RefObject<HTMLButtonElement | null>;
  openPanel: (panel: SidebarPanel) => void;
}

export default function SidebarRail({
  open,
  panel,
  sending,
  unread,
  dockRef,
  openPanel,
}: SidebarRailProps) {
  return (
    <aside className={styles.rail} data-open={open} aria-label="Portfolio guide dock">
      <button
        ref={dockRef}
        type="button"
        className={styles.launcher}
        onClick={() => openPanel('chat')}
        data-active={open && panel === 'chat'}
        aria-label={sending ? 'Open portfolio guide, response in progress' : 'Open portfolio guide'}
        aria-expanded={open}
        aria-controls="chat"
        aria-current={open && panel === 'chat' ? 'page' : undefined}
        aria-keyshortcuts="Control Shift 1 Meta Shift 1"
        data-tooltip="Portfolio guide"
        title="Portfolio guide · ⌘⇧1"
      >
        <span className={styles.portrait} data-busy={sending}>
          <GuideCat size={30} />
          <span className={styles.dot} data-busy={sending} />
        </span>
      </button>
      <Separator orientation="horizontal" className={styles.railSeparator} />
      <div className={styles.railTools}>
        <button
          type="button"
          className={styles.toolButton}
          data-tooltip="Inbox"
          data-active={open && panel === 'notifications'}
          aria-keyshortcuts="Control Shift 2 Meta Shift 2"
          title="Notifications · ⌘⇧2"
          aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
          aria-current={open && panel === 'notifications' ? 'page' : undefined}
          onClick={() => openPanel('notifications')}
        >
          <Bell size={18} />
          {unread > 0 && <span className={styles.badge}>{unread}</span>}
        </button>
        <button
          type="button"
          className={styles.toolButton}
          data-tooltip="Explore this page"
          data-active={open && panel === 'explore'}
          aria-keyshortcuts="Control Shift 3 Meta Shift 3"
          title="Explore · ⌘⇧3"
          aria-label="Explore page sections"
          aria-current={open && panel === 'explore' ? 'page' : undefined}
          onClick={() => openPanel('explore')}
        >
          <Compass size={18} />
        </button>
        <button
          type="button"
          className={styles.toolButton}
          data-tooltip="Settings"
          data-active={open && panel === 'settings'}
          aria-keyshortcuts="Control Shift 4 Meta Shift 4"
          title="Workspace settings · ⌘⇧4"
          aria-label="Workspace settings"
          aria-current={open && panel === 'settings' ? 'page' : undefined}
          onClick={() => openPanel('settings')}
        >
          <Settings2 size={18} />
        </button>
      </div>
      <div className={styles.railSpacer} aria-hidden="true" />
      <Separator
        orientation="horizontal"
        className={`${styles.railSeparator} ${styles.socialSeparator}`}
      />
      <nav className={styles.railSocials} aria-label="Social links">
        {socialLinks.map((link) => {
          const Icon =
            link.id === 'github' ? FiGithub : link.id === 'linkedin' ? FiLinkedin : SiDiscord;
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialButton}
              data-tooltip={link.label}
              aria-label={link.label}
            >
              <Icon size={16} />
            </a>
          );
        })}
        <a
          href={`mailto:${profile.email}`}
          className={styles.socialButton}
          data-tooltip="Email"
          aria-label="Email"
        >
          <FiAtSign size={16} />
        </a>
      </nav>
      <Separator
        orientation="horizontal"
        className={`${styles.railSeparator} ${styles.socialSeparator}`}
      />
      <div className={styles.railFooter}>
        <WorkspaceMenu />
      </div>
    </aside>
  );
}
