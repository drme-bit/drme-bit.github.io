'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const DEFAULT_PANEL_WIDTH = 408;
const MIN_PANEL_WIDTH = 360;
const MAX_PANEL_WIDTH = 640;
const PANEL_WIDTH_KEY = 'drme-chat-panel-width-v1';

export type SidebarPanel = 'chat' | 'notifications' | 'explore' | 'settings';

interface ChatContextValue {
  open: boolean;
  panel: SidebarPanel;
  panelWidth: number;
  openPanel: (panel: SidebarPanel) => void;
  setPanelWidth: (width: number) => void;
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
  const [panelWidth, setPanelWidthState] = useState(DEFAULT_PANEL_WIDTH);
  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(PANEL_WIDTH_KEY));
      if (Number.isFinite(saved) && saved >= MIN_PANEL_WIDTH && saved <= MAX_PANEL_WIDTH) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- restore the user's saved split size after hydration.
        setPanelWidthState(saved);
      }
    } catch {
      // Use the default width when storage is unavailable.
    }
  }, []);
  const setPanelWidth = useCallback((width: number) => {
    const next = Math.min(MAX_PANEL_WIDTH, Math.max(MIN_PANEL_WIDTH, Math.round(width)));
    setPanelWidthState(next);
    try {
      window.localStorage.setItem(PANEL_WIDTH_KEY, String(next));
    } catch {
      // The panel remains resizable when persistent storage is unavailable.
    }
  }, []);
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
    () => ({ open, panel, panelWidth, openPanel, setPanelWidth, setOpen, toggle }),
    [open, panel, panelWidth, openPanel, setPanelWidth, setOpen, toggle],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
