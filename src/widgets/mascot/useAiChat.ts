'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { pickResponse } from '@/entities/mascot';
import { getRelatedSources } from '@/entities/knowledge';
import type { KnowledgeSource } from '@/entities/knowledge';
import { CHAT_QUOTA_LIMIT, CHAT_QUOTA_WINDOW_MS } from '@/app/api/chat/quota';

export interface AiChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  offline?: boolean;
  sources?: KnowledgeSource[];
  streaming?: boolean;
  interrupted?: boolean;
}

export interface LocalChatSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: AiChatMessage[];
}

export interface ChatQuota {
  remaining: number;
  blocked: boolean;
  resetAt: number;
  resetHours: number;
}

/*  Must mirror the server allowlist in app/api/chat/route.ts — the server
    re-validates, this is only for the picker UI.  */

export const CHAT_MODELS = [
  { id: 'inclusionai/ling-3.0-flash-sante-free', label: 'Ling Flash' },
  { id: 'poolside/laguna-s-2.1-free', label: 'Laguna' },
  { id: 'openai/gpt-5-nano', label: 'GPT-5 nano' },
] as const;

export type ChatModelId = (typeof CHAT_MODELS)[number]['id'];

export const THINKING_STEPS = [
  'Thinking it through...',
  'Connecting the dots...',
  'A little more thought, a little less fluff...',
  'Letting the answer take shape...',
  'Still here. Good answers take a moment...',
] as const;

const MODEL_KEY = 'drme-chat-model';
const SESSIONS_KEY = 'drme-chat-sessions-v1';
const MAX_SESSIONS = 20;

let nextId = 1;

// Bumped so local manual testing starts from a fresh quota after the UX change.
const QUOTA_KEY = 'drme-chat-quota-v2';

interface StoredQuota {
  used: number;
  reset: number;
  blocked: boolean;
}

function freshQuota(now: number): StoredQuota {
  return { used: 0, reset: now + CHAT_QUOTA_WINDOW_MS, blocked: false };
}

/*  localStorage mirror of the server quota — display + pre-check only,
    the server (429) is authoritative. Static default first so SSR and
    the first client render match, real values sync on mount.  */

function readStored(now: number): StoredQuota {
  if (typeof window === 'undefined') return freshQuota(now);
  try {
    const raw = localStorage.getItem(QUOTA_KEY);
    if (!raw) return freshQuota(now);
    const parsed = JSON.parse(raw) as Partial<StoredQuota>;
    if (typeof parsed.used !== 'number' || typeof parsed.reset !== 'number') return freshQuota(now);
    if (now >= parsed.reset) return freshQuota(now);
    return { used: parsed.used, reset: parsed.reset, blocked: parsed.blocked === true };
  } catch {
    return freshQuota(now);
  }
}

function persist(stored: StoredQuota): void {
  try {
    localStorage.setItem(QUOTA_KEY, JSON.stringify(stored));
  } catch {
    /* private mode etc. — quota still enforced server-side */
  }
}

function sessionTitle(messages: AiChatMessage[]): string {
  const firstQuestion = messages.find((message) => message.role === 'user')?.content.trim();
  if (!firstQuestion) return 'New chat';
  return firstQuestion.length > 48 ? `${firstQuestion.slice(0, 47).trimEnd()}…` : firstQuestion;
}

function readSessions(): { sessions: LocalChatSession[]; activeId: string | null } {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return { sessions: [], activeId: null };
    const parsed = JSON.parse(raw) as { sessions?: unknown; activeId?: unknown };
    if (!Array.isArray(parsed.sessions)) return { sessions: [], activeId: null };
    const sessions = parsed.sessions
      .filter((value): value is LocalChatSession => Boolean(
        value && typeof value === 'object' &&
        typeof (value as LocalChatSession).id === 'string' &&
        Array.isArray((value as LocalChatSession).messages),
      ))
      .map((session) => ({
        id: session.id,
        title: typeof session.title === 'string' ? session.title : 'Saved chat',
        updatedAt: typeof session.updatedAt === 'number' ? session.updatedAt : Date.now(),
        messages: session.messages
          .filter((message) => message && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
          .slice(-100)
          .map((message, index) => ({ ...message, id: Number.isFinite(message.id) ? message.id : index + 1, streaming: false })),
      }))
      .filter((session) => session.messages.length > 0)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_SESSIONS);
    const activeId = typeof parsed.activeId === 'string' && sessions.some((session) => session.id === parsed.activeId)
      ? parsed.activeId
      : sessions[0]?.id ?? null;
    return { sessions, activeId };
  } catch {
    return { sessions: [], activeId: null };
  }
}

function writeSessions(sessions: LocalChatSession[], activeId: string | null): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify({ sessions: sessions.slice(0, MAX_SESSIONS), activeId }));
  } catch {
    /* Private mode or storage quota: the current conversation remains usable. */
  }
}

function createSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now()}`;
}

function upsertSession(sessions: LocalChatSession[], id: string, messages: AiChatMessage[]): LocalChatSession[] {
  const existing = sessions.find((session) => session.id === id);
  if (!existing && messages.length === 0) return sessions;
  const session: LocalChatSession = {
    id,
    title: sessionTitle(messages),
    updatedAt: Date.now(),
    messages: messages.filter((message) => message.content.length > 0).slice(-100).map((message) => ({ ...message, streaming: false })),
  };
  return [session, ...sessions.filter((item) => item.id !== id)].slice(0, MAX_SESSIONS);
}

function quotaNotice(reset: number, now: number): string {
  const hours = Math.max(1, Math.ceil((reset - now) / 3600000));
  return (
    `You have reached today's chat limit of ${CHAT_QUOTA_LIMIT} questions. ` +
    `New questions will be available in about ${hours}h, or you can reach Vyacheslav via the contact section.`
  );
}

function toQuota(stored: StoredQuota): ChatQuota {
  return {
    remaining: Math.max(0, CHAT_QUOTA_LIMIT - stored.used),
    blocked: stored.blocked,
    resetAt: stored.reset,
    resetHours: Math.max(1, Math.ceil((stored.reset - Date.now()) / 3600000)),
  };
}

/*  Chat state machine: talks to /api/chat. Local replies are available only
    when CHAT_LOCAL_FALLBACK is explicitly enabled by the server. */

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
  const [sessions, setSessions] = useState<LocalChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyReady, setHistoryReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [offline, setOffline] = useState(false);
  const [quota, setQuota] = useState<ChatQuota>({
    remaining: CHAT_QUOTA_LIMIT,
    blocked: false,
    resetAt: 0,
    resetHours: 24,
  });
  const [model, setModelState] = useState<ChatModelId>(CHAT_MODELS[0].id);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AiChatMessage[]>([]);
  const sessionsRef = useRef<LocalChatSession[]>([]);
  const activeSessionRef = useRef<string | null>(null);
  const modelRef = useRef<ChatModelId>(CHAT_MODELS[0].id);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

  useEffect(() => {
    const saved = readSessions();
    const activeSession = saved.sessions.find((session) => session.id === saved.activeId);
    sessionsRef.current = saved.sessions;
    activeSessionRef.current = activeSession?.id ?? null;
    messagesRef.current = activeSession?.messages ?? [];
    nextId = Math.max(1, ...saved.sessions.flatMap((session) => session.messages.map((message) => message.id + 1)));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate local chat history after mount
    setSessions(saved.sessions);
    setActiveSessionId(activeSession?.id ?? null);
    setMessages(messagesRef.current);
    setHistoryReady(true);
  }, []);

  useEffect(() => {
    if (!historyReady) return;
    const timer = window.setTimeout(() => {
      const id = activeSessionRef.current;
      const next = id ? upsertSession(sessionsRef.current, id, messagesRef.current) : sessionsRef.current;
      sessionsRef.current = next;
      setSessions(next);
      writeSessions(next, id);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [messages, activeSessionId, historyReady]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    messagesRef.current = messagesRef.current
      .filter((message) => !message.streaming || message.content.length > 0)
      .map((message) =>
        message.streaming ? { ...message, streaming: false, interrupted: true } : message,
      );
    setMessages([...messagesRef.current]);
    setSending(false);
  }, []);

  useEffect(() => {
    if (!sending) return;

    const timer = window.setInterval(() => {
      setThinkingStep((current) => (current + 1) % THINKING_STEPS.length);
    }, 2800);

    return () => window.clearInterval(timer);
  }, [sending]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only sync of persisted state
    setQuota(toQuota(readStored(Date.now())));
    try {
      const saved = localStorage.getItem(MODEL_KEY);
      if (saved && CHAT_MODELS.some((m) => m.id === saved)) {
        modelRef.current = saved as ChatModelId;
        setModelState(modelRef.current);
      }
    } catch {
      /* private mode — default model stays */
    }
  }, []);

  const setModel = useCallback((id: ChatModelId) => {
    modelRef.current = id;
    setModelState(id);
    try {
      localStorage.setItem(MODEL_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const ensureActiveSession = useCallback(() => {
    if (activeSessionRef.current) return activeSessionRef.current;
    const id = createSessionId();
    activeSessionRef.current = id;
    setActiveSessionId(id);
    return id;
  }, []);

  const startNewSession = useCallback(() => {
    stop();
    const previousId = activeSessionRef.current;
    const previous = previousId
      ? upsertSession(sessionsRef.current, previousId, messagesRef.current)
      : sessionsRef.current;
    sessionsRef.current = previous;
    activeSessionRef.current = null;
    messagesRef.current = [];
    setSessions(previous);
    setActiveSessionId(null);
    setMessages([]);
    writeSessions(previous, null);
  }, [stop]);

  const switchSession = useCallback((id: string) => {
    const selected = sessionsRef.current.find((session) => session.id === id);
    if (!selected || activeSessionRef.current === id) return;
    stop();
    const previousId = activeSessionRef.current;
    const saved = previousId
      ? upsertSession(sessionsRef.current, previousId, messagesRef.current)
      : sessionsRef.current;
    sessionsRef.current = saved;
    activeSessionRef.current = id;
    messagesRef.current = selected.messages;
    setSessions(saved);
    setActiveSessionId(id);
    setMessages(selected.messages);
    writeSessions(saved, id);
  }, [stop]);

  const deleteSession = useCallback((id: string) => {
    const remaining = sessionsRef.current.filter((session) => session.id !== id);
    sessionsRef.current = remaining;
    if (activeSessionRef.current === id) {
      stop();
      activeSessionRef.current = null;
      messagesRef.current = [];
      setActiveSessionId(null);
      setMessages([]);
    }
    setSessions(remaining);
    writeSessions(remaining, activeSessionRef.current);
  }, [stop]);

  const push = useCallback((msg: Omit<AiChatMessage, 'id'>) => {
    ensureActiveSession();
    const full = { ...msg, id: nextId++ };
    messagesRef.current = [...messagesRef.current, full];
    setMessages(messagesRef.current);
  }, [ensureActiveSession]);

  const pushStreaming = useCallback(async (msg: Omit<AiChatMessage, 'id'>, signal: AbortSignal) => {
    if (signal.aborted) return;
    ensureActiveSession();
    const full = {
      ...msg,
      id: nextId++,
      content: '',
      streaming: true,
    };
    messagesRef.current = [...messagesRef.current, full];
    setMessages([...messagesRef.current]);

    const chunkSize = Math.max(3, Math.ceil(msg.content.length / 34));
    for (let end = chunkSize; end < msg.content.length; end += chunkSize) {
      await new Promise((resolve) => window.setTimeout(resolve, 28));
      if (signal.aborted) return;
      full.content = msg.content.slice(0, end);
      messagesRef.current = messagesRef.current.map((message) =>
        message.id === full.id ? full : message,
      );
      setMessages([...messagesRef.current]);
    }

    full.content = msg.content;
    full.streaming = false;
    messagesRef.current = messagesRef.current.map((message) =>
      message.id === full.id ? full : message,
    );
    setMessages([...messagesRef.current]);
  }, [ensureActiveSession]);

  const send = useCallback(
    async (raw: string) => {
      const content = raw.trim().slice(0, 2000);
      if (!content || abortRef.current) return;

      const now = Date.now();
      const stored = readStored(now);
      if (stored.blocked) {
        setQuota(toQuota(stored));
        push({ role: 'assistant', content: quotaNotice(stored.reset, now) });
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setThinkingStep(0);
      setSending(true);
      push({ role: 'user', content });

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesRef.current.map(({ role, content: c }) => ({ role, content: c })),
            model: modelRef.current,
          }),
          signal: controller.signal,
        });
        const remainingHeader = Number(res.headers.get('X-Chat-Remaining'));
        const resetHeader = Number(res.headers.get('X-Chat-Reset'));
        if (Number.isFinite(remainingHeader) && Number.isFinite(resetHeader) && resetHeader > 0) {
          const synced: StoredQuota = {
            used: CHAT_QUOTA_LIMIT - remainingHeader,
            reset: resetHeader,
            blocked: remainingHeader <= 0,
          };
          persist(synced);
          setQuota(toQuota(synced));
        }
        const data = await res.json().catch(() => ({}));
        if (controller.signal.aborted) return;
        if (res.status === 429) {
          await pushStreaming(
            {
              role: 'assistant',
              content: String(data?.error ?? 'Daily quota reached. Try again tomorrow.'),
            },
            controller.signal,
          );
        } else if (res.status === 503 && data?.code === 'LOCAL_CHAT_FALLBACK') {
          // Local responses are opt-in via CHAT_LOCAL_FALLBACK=true.
          setOffline(true);
          await pushStreaming(
            {
              role: 'assistant',
              content: pickResponse(content),
              offline: true,
              sources: getRelatedSources(content),
            },
            controller.signal,
          );
        } else if (!res.ok || typeof data?.reply !== 'string') {
          throw new Error(data?.error ?? 'Request failed');
        } else {
          setOffline(false);
          await pushStreaming(
            {
              role: 'assistant',
              content: data.reply,
              sources: getRelatedSources(content),
            },
            controller.signal,
          );
        }
      } catch (e) {
        if (!controller.signal.aborted && (e as Error)?.name !== 'AbortError') {
          setOffline(false);
          await pushStreaming(
            {
              role: 'assistant',
              content: e instanceof Error
                ? `I couldn't reach the AI Gateway: ${e.message}. Please try again.`
                : 'I could not reach the AI Gateway. Please try again.',
            },
            controller.signal,
          );
        }
      } finally {
        // A cancelled request must not reset a newer request's state.
        if (abortRef.current === controller) {
          abortRef.current = null;
          setSending(false);
        }
      }
    },
    [push, pushStreaming],
  );

  const clear = startNewSession;

  return {
    messages,
    sending,
    thinkingStep,
    thinkingLabel: THINKING_STEPS[thinkingStep],
    offline,
    quota,
    model,
    setModel,
    sessions,
    activeSessionId,
    switchSession,
    deleteSession,
    send,
    stop,
    clear,
  };
}
