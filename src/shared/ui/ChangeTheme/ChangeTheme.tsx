'use client';

import { useChat } from '@/app/providers/ChatProvider';
import { SettingsGear } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui';

export default function ChangeTheme() {
  const { open, panel, openPanel } = useChat();
  return (
    <IconButton
      size="icon-sm"
      aria-label="Open settings"
      title="Settings"
      aria-controls="chat"
      aria-expanded={open && panel === 'settings'}
      className="text-muted-foreground hover:bg-secondary hover:text-foreground"
      onClick={() => openPanel('settings')}
    >
      <SettingsGear className="size-4" />
    </IconButton>
  );
}
