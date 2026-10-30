'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export type SidebarPanel = 'chat' | 'notifications' | 'explore' | 'settings';

interface ChatContextValue {
  open: boolean;
  panel: SidebarPanel;
  openPanel: (panel: SidebarPanel) => void;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/*  Global chat dock state: navbar trigger, mobile menu and the guide
    panel all talk to the same switch. The mascot itself lives inside
    the chat window — nothing floats over the page anymore.  */

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setVisible] = useState(false);
  const [panel, setPanel] = useState<SidebarPanel>('chat');
  const openPanel = useCallback((next: SidebarPanel) => {
    setPanel(next);
    setVisible(true);
  }, []);
  const setOpen = useCallback((next: boolean) => {
    if (next) setPanel('chat');
    setVisible(next);
  }, []);
  const toggle = useCallback(() => {
    setPanel('chat');
    setVisible((o) => !o);
  }, []);
  const value = useMemo(
    () => ({ open, panel, openPanel, setOpen, toggle }),
    [open, panel, openPanel, setOpen, toggle],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
