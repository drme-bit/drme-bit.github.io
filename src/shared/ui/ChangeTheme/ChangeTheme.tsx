'use client';

import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { SettingsGear } from '@/shared/ui/Icon';
import { IconButton } from '@/shared/ui';

export default function ChangeTheme() {
  const { open, panel, openPanel } = useWorkspace();
  return (
    <IconButton
      size="icon-sm"
      aria-label="Open settings"
      title="Settings"
      aria-controls="assistant"
      aria-expanded={open && panel === 'settings'}
      className="text-muted-foreground hover:bg-secondary hover:text-foreground"
      onClick={() => openPanel('settings')}
    >
      <SettingsGear className="size-4" />
    </IconButton>
  );
}
