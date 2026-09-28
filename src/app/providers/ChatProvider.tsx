'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface ChatContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/*  Global chat dock state: navbar trigger, mobile menu and the Mascot
    panel all talk to the same switch. The cube itself lives inside
    the chat window — nothing floats over the page anymore.  */

export function ChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
