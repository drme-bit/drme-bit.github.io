'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const DEFAULT_PANEL_WIDTH = 408;
const MIN_PANEL_WIDTH = 360;
const MAX_PANEL_WIDTH = 640;
const PANEL_WIDTH_KEY = 'drme-chat-panel-width-v1';

export type SidebarPanel = 'assistant' | 'notifications' | 'explore' | 'settings';

interface WorkspaceContextValue {
  open: boolean;
  panel: SidebarPanel;
  panelWidth: number;
  openPanel: (panel: SidebarPanel) => void;
  setPanelWidth: (width: number) => void;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/*  Global workspace dock state: navbar triggers, the mobile menu and the
    assistant panel all talk to the same switch. The assistant lives inside
    the workspace panel — nothing floats over the page.  */

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [open, setVisible] = useState(false);
  const [panel, setPanel] = useState<SidebarPanel>('assistant');
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
    if (next) setPanel('assistant');
    setVisible(next);
  }, []);

  const toggle = useCallback(() => {
    setPanel('assistant');
    setVisible((current) => !current);
  }, []);

  const value = useMemo(
    () => ({ open, panel, panelWidth, openPanel, setPanelWidth, setOpen, toggle }),
    [open, panel, panelWidth, openPanel, setPanelWidth, setOpen, toggle],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
}
