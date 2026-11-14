'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ASSISTANT_MODELS,
  DEFAULT_ASSISTANT_MODEL,
  pickFallbackResponse,
  type AssistantModelId,
} from '@/entities/assistant';
import { getRelatedSources } from '@/entities/knowledge';
import type { KnowledgeSource } from '@/entities/knowledge';
import { ASSISTANT_QUOTA_LIMIT, ASSISTANT_QUOTA_WINDOW_MS } from '@/app/api/assistant/quota';

export interface AssistantToolEvent {
  id: string;
  name: string;
  label: string;
  detail?: string;
  status: 'running' | 'done' | 'error';
}

export interface AssistantMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  offline?: boolean;
  sources?: KnowledgeSource[];
  streaming?: boolean;
  interrupted?: boolean;
  error?: boolean;
  tools?: AssistantToolEvent[];
}

export interface AssistantSession {
  id: string;
  title: string;
  updatedAt: number;
  messages: AssistantMessage[];
}

export interface AssistantQuota {
  remaining: number;
  blocked: boolean;
  resetAt: number;
  resetHours: number;
}

export interface AssistantPageContext {
  pathname?: string;
  sectionId?: string;
}

interface SendOptions {
  skipUser?: boolean;
}

/*  Historic storage keys are intentionally kept so existing saved chats and
    quota counters survive the rename from the old chat feature.  */
const MODEL_KEY = 'drme-chat-model';
const SESSIONS_KEY = 'drme-chat-sessions-v1';
const MAX_SESSIONS = 20;
const QUOTA_KEY = 'drme-chat-quota-v2';

let nextId = 1;

interface StoredQuota {
  used: number;
  reset: number;
  blocked: boolean;
}

function freshQuota(now: number): StoredQuota {
  return { used: 0, reset: now + ASSISTANT_QUOTA_WINDOW_MS, blocked: false };
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

function sessionTitle(messages: AssistantMessage[]): string {
  const firstQuestion = messages.find((message) => message.role === 'user')?.content.trim();
  if (!firstQuestion) return 'New chat';
  return firstQuestion.length > 48 ? `${firstQuestion.slice(0, 47).trimEnd()}…` : firstQuestion;
}

function readSessions(): { sessions: AssistantSession[]; activeId: string | null } {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (!raw) return { sessions: [], activeId: null };
    const parsed = JSON.parse(raw) as { sessions?: unknown; activeId?: unknown };
    if (!Array.isArray(parsed.sessions)) return { sessions: [], activeId: null };
    const sessions = parsed.sessions
      .filter((value): value is AssistantSession => Boolean(
        value && typeof value === 'object' &&
        typeof (value as AssistantSession).id === 'string' &&
        Array.isArray((value as AssistantSession).messages),
      ))
      .map((session) => ({
        id: session.id,
        title: typeof session.title === 'string' ? session.title : 'Saved chat',
        updatedAt: typeof session.updatedAt === 'number' ? session.updatedAt : Date.now(),
        messages: session.messages
          .filter((message) => message && (message.role === 'user' || message.role === 'assistant') && typeof message.content === 'string')
          .slice(-100)
          .map((message, index) => ({
            ...message,
            id: Number.isFinite(message.id) ? message.id : index + 1,
            streaming: false,
            tools: undefined,
          })),
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

function writeSessions(sessions: AssistantSession[], activeId: string | null): void {
  try {
    localStorage.setItem(SESSIONS_KEY, JSON.stringify({ sessions: sessions.slice(0, MAX_SESSIONS), activeId }));
  } catch {
    /* Private mode or storage quota: the current conversation remains usable. */
  }
}

function createSessionId(): string {
  const cryptoApi = typeof globalThis.crypto === 'undefined' ? undefined : globalThis.crypto;

  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  if (cryptoApi) {
    const bytes = new Uint8Array(16);
    cryptoApi.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  return `${Date.now()}`;
}

function upsertSession(sessions: AssistantSession[], id: string, messages: AssistantMessage[]): AssistantSession[] {
  const existing = sessions.find((session) => session.id === id);
  if (!existing && messages.length === 0) return sessions;
  const session: AssistantSession = {
    id,
    title: sessionTitle(messages),
    updatedAt: Date.now(),
    messages: messages
      .filter((message) => message.content.length > 0)
      .slice(-100)
      .map((message) => ({ ...message, streaming: false, tools: undefined })),
  };
  return [session, ...sessions.filter((item) => item.id !== id)].slice(0, MAX_SESSIONS);
}

function quotaNotice(reset: number, now: number): string {
  const hours = Math.max(1, Math.ceil((reset - now) / 3600000));
  return (
    `You have reached today's assistant limit of ${ASSISTANT_QUOTA_LIMIT} questions. ` +
    `New questions will be available in about ${hours}h, or you can reach Vyacheslav via the contact section.`
  );
}

function toQuota(stored: StoredQuota): AssistantQuota {
  return {
    remaining: Math.max(0, ASSISTANT_QUOTA_LIMIT - stored.used),
    blocked: stored.blocked,
    resetAt: stored.reset,
    resetHours: Math.max(1, Math.ceil((stored.reset - Date.now()) / 3600000)),
  };
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/*  Streaming state machine: talks to /api/assistant, renders typed SSE
    events (tool activity, token deltas, final sources) and keeps local
    session history. Local replies are opt-in via the server env flag.  */

export function useAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [sessions, setSessions] = useState<AssistantSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [historyReady, setHistoryReady] = useState(false);
  const [sending, setSending] = useState(false);
  const [offline, setOffline] = useState(false);
  const [quota, setQuota] = useState<AssistantQuota>({
    remaining: ASSISTANT_QUOTA_LIMIT,
    blocked: false,
    resetAt: 0,
    resetHours: 24,
  });
  const [model, setModelState] = useState<AssistantModelId>(DEFAULT_ASSISTANT_MODEL);
  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AssistantMessage[]>([]);
  const sessionsRef = useRef<AssistantSession[]>([]);
  const activeSessionRef = useRef<string | null>(null);
  const modelRef = useRef<AssistantModelId>(DEFAULT_ASSISTANT_MODEL);

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
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate local assistant history after mount
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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only sync of persisted state
    setQuota(toQuota(readStored(Date.now())));
    try {
      const saved = localStorage.getItem(MODEL_KEY);
      if (saved && ASSISTANT_MODELS.some((entry) => entry.id === saved)) {
        modelRef.current = saved as AssistantModelId;
        setModelState(modelRef.current);
      }
    } catch {
      /* private mode — default model stays */
    }
  }, []);

  const updateMessage = useCallback(
    (id: number, patch: Partial<AssistantMessage> | ((message: AssistantMessage) => AssistantMessage)) => {
      messagesRef.current = messagesRef.current.map((message) => {
        if (message.id !== id) return message;
        return typeof patch === 'function' ? patch(message) : { ...message, ...patch };
      });
      setMessages([...messagesRef.current]);
    },
    [],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    messagesRef.current = messagesRef.current
      .filter((message) => !message.streaming || message.content.length > 0)
      .map((message) =>
        message.streaming
          ? { ...message, streaming: false, interrupted: true, tools: undefined }
          : message,
      );
    setMessages([...messagesRef.current]);
    setSending(false);
  }, []);

  const setModel = useCallback((id: AssistantModelId) => {
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

  const push = useCallback((message: Omit<AssistantMessage, 'id'>) => {
    ensureActiveSession();
    const full = { ...message, id: nextId++ };
    messagesRef.current = [...messagesRef.current, full];
    setMessages(messagesRef.current);
  }, [ensureActiveSession]);

  const startAssistantMessage = useCallback(() => {
    ensureActiveSession();
    const id = nextId++;
    messagesRef.current = [
      ...messagesRef.current,
      { id, role: 'assistant', content: '', streaming: true, tools: [] },
    ];
    setMessages([...messagesRef.current]);
    return id;
  }, [ensureActiveSession]);

  const revealText = useCallback(
    async (
      message: Omit<AssistantMessage, 'id'>,
      signal: AbortSignal,
    ) => {
      if (signal.aborted) return;
      const id = startAssistantMessage();
      const chunkSize = Math.max(3, Math.ceil(message.content.length / 34));

      for (let end = chunkSize; end < message.content.length; end += chunkSize) {
        await wait(28);
        if (signal.aborted) return;
        updateMessage(id, { content: message.content.slice(0, end) });
      }

      updateMessage(id, {
        content: message.content,
        streaming: false,
        offline: message.offline,
        sources: message.sources,
        error: message.error,
        tools: undefined,
      });
    },
    [startAssistantMessage, updateMessage],
  );

  const consumeStream = useCallback(
    async (response: Response, assistantId: number) => {
      const reader = response.body?.getReader();
      if (!reader) throw new Error('The assistant returned no response body.');

      const decoder = new TextDecoder();
      let buffer = '';
      let pending = '';
      let flushTimer: number | null = null;

      const flush = () => {
        if (flushTimer !== null) {
          window.clearTimeout(flushTimer);
          flushTimer = null;
        }
        if (!pending) return;
        const text = pending;
        pending = '';
        updateMessage(assistantId, (message) => ({ ...message, content: message.content + text }));
      };

      const append = (text: string) => {
        pending += text;
        if (flushTimer === null) flushTimer = window.setTimeout(flush, 24);
      };

      const upsertTool = (tool: AssistantToolEvent) => {
        updateMessage(assistantId, (message) => ({
          ...message,
          tools: [
            ...(message.tools ?? []).filter((item) => item.id !== tool.id),
            tool,
          ],
        }));
      };

      const handleFrame = (frame: string) => {
        let event = 'message';
        const dataLines: string[] = [];
        for (const line of frame.split(/\r?\n/)) {
          if (line.startsWith('event:')) event = line.slice(6).trim();
          else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
        }
        if (dataLines.length === 0) return;

        let payload: unknown;
        try {
          payload = JSON.parse(dataLines.join('\n'));
        } catch {
          return;
        }

        const record = payload as Record<string, unknown>;

        if (event === 'delta' && typeof record.text === 'string') {
          append(record.text);
          return;
        }

        if (event === 'tool' && typeof record.id === 'string') {
          upsertTool({
            id: record.id,
            name: typeof record.name === 'string' ? record.name : 'tool',
            label: typeof record.label === 'string' ? record.label : 'Working',
            detail: typeof record.detail === 'string' ? record.detail : undefined,
            status: record.status === 'running' ? 'running' : record.status === 'error' ? 'error' : 'done',
          });
          return;
        }

        if (event === 'done') {
          flush();
          const reply = typeof record.reply === 'string' ? record.reply : undefined;
          const sources = Array.isArray(record.sources) ? (record.sources as KnowledgeSource[]) : undefined;
          updateMessage(assistantId, (message) => ({
            ...message,
            content: reply ?? message.content,
            sources,
            streaming: false,
            tools: undefined,
          }));
          return;
        }

        if (event === 'error') {
          flush();
          throw new Error(
            typeof record.message === 'string' ? record.message : 'The assistant could not answer.',
          );
        }
      };

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split(/\r?\n\r?\n/);
          buffer = frames.pop() ?? '';
          for (const frame of frames) handleFrame(frame);
        }
        if (buffer.trim()) handleFrame(buffer);
        flush();
      } finally {
        if (flushTimer !== null) window.clearTimeout(flushTimer);
      }
    },
    [updateMessage],
  );

  const send = useCallback(
    async (raw: string, context?: AssistantPageContext, options?: SendOptions) => {
      const content = raw.trim().slice(0, 2000);
      if (!content || abortRef.current) return;

      const now = Date.now();
      const stored = readStored(now);
      if (stored.blocked) {
        setQuota(toQuota(stored));
        push({ role: 'assistant', content: quotaNotice(stored.reset, now), error: true });
        return;
      }

      const controller = new AbortController();
      abortRef.current = controller;
      setSending(true);
      if (!options?.skipUser) push({ role: 'user', content });

      const failCurrent = (message: string) => {
        const last = messagesRef.current[messagesRef.current.length - 1];
        if (last?.role === 'assistant' && last.streaming) {
          updateMessage(last.id, (current) => ({
            ...current,
            content: current.content ? `${current.content}\n\n${message}` : message,
            streaming: false,
            error: true,
          }));
          return true;
        }
        return false;
      };

      try {
        const response = await fetch('/api/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: messagesRef.current.map(({ role, content: text }) => ({ role, content: text })),
            model: modelRef.current,
            context,
          }),
          signal: controller.signal,
        });

        const remainingHeader = Number(response.headers.get('X-Assistant-Remaining'));
        const resetHeader = Number(response.headers.get('X-Assistant-Reset'));
        if (Number.isFinite(remainingHeader) && Number.isFinite(resetHeader) && resetHeader > 0) {
          const synced: StoredQuota = {
            used: ASSISTANT_QUOTA_LIMIT - remainingHeader,
            reset: resetHeader,
            blocked: remainingHeader <= 0,
          };
          persist(synced);
          setQuota(toQuota(synced));
        }

        if (controller.signal.aborted) return;

        if (response.status === 429) {
          const data = await response.json().catch(() => ({}));
          push({
            role: 'assistant',
            content: String(data?.error ?? 'Daily limit reached. Try again tomorrow.'),
            error: true,
          });
          return;
        }

        if (response.status === 503) {
          const data = await response.json().catch(() => ({}));
          const code = String(data?.code ?? '');
          if (code === 'LOCAL_ASSISTANT_FALLBACK' || code === 'LOCAL_CHAT_FALLBACK') {
            setOffline(true);
            await revealText(
              {
                role: 'assistant',
                content: pickFallbackResponse(content),
                offline: true,
                sources: getRelatedSources(content),
              },
              controller.signal,
            );
            return;
          }
          throw new Error(String(data?.error ?? 'The assistant is not configured.'));
        }

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(String(data?.error ?? `Request failed with HTTP ${response.status}.`));
        }

        const contentType = response.headers.get('content-type') ?? '';

        if (contentType.includes('text/event-stream') && response.body) {
          setOffline(false);
          const assistantId = startAssistantMessage();
          await consumeStream(response, assistantId);
          return;
        }

        // Non-streaming fallback for older deployments and mocked responses.
        const data = await response.json();
        if (typeof data?.reply !== 'string') {
          throw new Error(String(data?.error ?? 'The assistant returned an empty reply.'));
        }
        setOffline(false);
        await revealText(
          {
            role: 'assistant',
            content: data.reply,
            sources: Array.isArray(data.sources) ? data.sources : getRelatedSources(content),
          },
          controller.signal,
        );
      } catch (error) {
        if (!controller.signal.aborted && (error as Error)?.name !== 'AbortError') {
          setOffline(false);
          const message =
            error instanceof Error
              ? `I couldn't reach the AI Gateway: ${error.message}. Please try again.`
              : 'I could not reach the AI Gateway. Please try again.';
          if (!failCurrent(message)) {
            push({ role: 'assistant', content: message, error: true });
          }
        }
      } finally {
        // A cancelled request must not reset a newer request's state.
        if (abortRef.current === controller) {
          abortRef.current = null;
          setSending(false);
        }
      }
    },
    [consumeStream, push, revealText, startAssistantMessage, updateMessage],
  );

  const regenerate = useCallback((context?: AssistantPageContext) => {
    if (abortRef.current) return;
    const current = messagesRef.current;
    const last = current[current.length - 1];
    if (!last || last.role !== 'assistant') return;

    const previousUser = [...current].reverse().find((message) => message.role === 'user');
    if (!previousUser) return;

    messagesRef.current = current.slice(0, -1);
    setMessages([...messagesRef.current]);
    void send(previousUser.content, context, { skipUser: true });
  }, [send]);

  const editMessage = useCallback((id: number) => {
    const index = messagesRef.current.findIndex((message) => message.id === id && message.role === 'user');
    if (index < 0) return null;
    const content = messagesRef.current[index].content;
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      setSending(false);
    }
    messagesRef.current = messagesRef.current.slice(0, index);
    setMessages([...messagesRef.current]);
    return content;
  }, []);

  return {
    messages,
    sending,
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
    regenerate,
    editMessage,
    clear: startNewSession,
  };
}
