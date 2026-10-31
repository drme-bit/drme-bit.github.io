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

/*  Chat state machine: talks to /api/chat, falls back to the local
    mock brain when the gateway isn't configured (offline mode).  */

export function useAiChat() {
  const [messages, setMessages] = useState<AiChatMessage[]>([]);
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
  const modelRef = useRef<ChatModelId>(CHAT_MODELS[0].id);

  useEffect(
    () => () => {
      abortRef.current?.abort();
    },
    [],
  );

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

  const push = useCallback((msg: Omit<AiChatMessage, 'id'>) => {
    const full = { ...msg, id: nextId++ };
    messagesRef.current = [...messagesRef.current, full];
    setMessages(messagesRef.current);
  }, []);

  const pushStreaming = useCallback(async (msg: Omit<AiChatMessage, 'id'>, signal: AbortSignal) => {
    if (signal.aborted) return;
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
  }, []);

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
        } else if (res.status === 503) {
          // Gateway not configured → local mock brain, flagged as offline.
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

  const clear = useCallback(() => {
    stop();
    messagesRef.current = [];
    setMessages([]);
  }, [stop]);

  return {
    messages,
    sending,
    thinkingStep,
    thinkingLabel: THINKING_STEPS[thinkingStep],
    offline,
    quota,
    model,
    setModel,
    send,
    stop,
    clear,
  };
}
