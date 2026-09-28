'use client';

import { useEffect, useRef, useState } from 'react';
import { Cross, Trash, ArrowDown, ArrowUpRight, ArrowUp, LoaderCircle } from '@/shared/ui/Icon';
import { ContentWindow } from '@/widgets/content-window';
import { useChat } from '@/app/providers/ChatProvider';
import { MAQ } from '@/entities/mascot';
import { CHAT_QUOTA_LIMIT } from '@/app/api/chat/quota';
import CompanionCube from './CompanionCube';
import { useAiChat, CHAT_MODELS } from './useAiChat';
import type { ChatModelId } from './useAiChat';

/*  Geist-style chat: user messages are inverted pills, assistant replies
    are plain rows (no bubbles), composer sends with an arrow button.  */

export default function Mascot() {
  const { open, setOpen } = useChat();
  const [draft, setDraft] = useState('');
  const [showJump, setShowJump] = useState(false);
  const { messages, sending, offline, quota, model, setModel, send, clear } = useAiChat();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stickRef = useRef(true);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open ]);

  useEffect(() => {
    if (stickRef.current) {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, sending, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [setOpen]);

  const submit = (text: string) => {
    if (!text.trim() || sending) return;
    setDraft('');
    stickRef.current = true;
    setShowJump(false);
    void send(text);
  };

  const onListScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    stickRef.current = nearBottom;
    setShowJump(!nearBottom);
  };

  const jumpToLatest = () => {
    stickRef.current = true;
    setShowJump(false);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    inputRef.current?.focus({ preventScroll: true });
  };

  const statusDot = offline
    ? 'bg-amber-400'
    : sending
      ? 'animate-pulse bg-[var(--accent-secondary)]'
      : 'bg-[var(--accent-success)]';
  const statusText = offline ? 'offline · local brain' : sending ? 'thinking…' : 'online';
  const quotaHint = quota.blocked
    ? `Quota reached · back in ~${quota.resetHours}h`
    : `${quota.remaining} of ${CHAT_QUOTA_LIMIT} left today`;

  return (
    <>
      {/* Mobile backdrop — always mounted so Safari computes the blur once;
          desktop stays interactive like Railway. */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[1001] bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <ContentWindow
        id="chat"
        as="section"
        label="AI chat with Dr.ME's assistant"
        tone="raised"
        motion="slide-right"
        open={open}
        className="fixed top-3 right-3 bottom-3 z-[1002] flex w-[400px] flex-col max-lg:top-3 max-lg:right-3 max-lg:bottom-3 max-lg:left-3 max-lg:w-auto max-lg:rounded-[var(--radius-md)]"
      >
        <header className="flex shrink-0 items-center gap-2.5 border-b border-[var(--border)] px-4 py-2.5">
          <CompanionCube size={20} />
          <div className="flex min-w-0 flex-1 items-baseline gap-2">
            <span className="text-[13px] font-medium text-[var(--text)]">Ask Dr.ME</span>
            <span className="flex items-center gap-1.5 font-mono text-[0.6rem] text-[var(--text-ghost)]">
              <span className={`size-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
              {statusText}
            </span>
          </div>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as ChatModelId)}
            aria-label="AI model"
            tabIndex={open ? undefined : -1}
            className="h-7 max-w-[104px] shrink-0 cursor-pointer truncate rounded-[var(--radius-sm)] border border-[var(--border)] bg-transparent px-1.5 font-mono text-[11px] text-[var(--text-dim)] outline-none transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text)] [&>option]:bg-[var(--bg-elevated)]"
          >
            {CHAT_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={clear}
            aria-label="Clear chat"
            tabIndex={open ? undefined : -1}
            className="flex size-7 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-dim)] outline-none transition-colors hover:bg-[var(--glass-hover)] hover:text-[var(--text)] focus-visible:bg-[var(--glass-hover)] focus-visible:text-[var(--text)]"
          >
            <Trash size={14} />
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            tabIndex={open ? undefined : -1}
            className="flex size-7 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-dim)] outline-none transition-colors hover:bg-[var(--glass-hover)] hover:text-[var(--text)] focus-visible:bg-[var(--glass-hover)] focus-visible:text-[var(--text)]"
          >
            <Cross size={14} />
          </button>
        </header>

        <div
          ref={listRef}
          onScroll={onListScroll}
          data-lenis-prevent
          className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4"
        >
          {messages.length === 0 && !sending && (
            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-1 py-6 text-center">
              <span className="flex size-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--glass)] shadow-[var(--shadow-md)]">
                <CompanionCube size={30} />
              </span>
              <div className="flex flex-col gap-1">
                <p className="m-0 text-[14px] font-medium text-[var(--text)]">
                  Hey, I&apos;m the site assistant
                </p>
                <p className="m-0 text-[0.78rem] leading-[1.6] text-[var(--text-secondary)]">
                  Ask about the stack, projects,
                  <br />
                  or how to reach Vyacheslav.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                <p className="m-0 text-left font-mono text-[0.6rem] tracking-[0.14em] text-[var(--text-ghost)]">
                  MOST ASKED
                </p>
                {MAQ.map((item, i) => (
                  <button
                    key={item.q}
                    type="button"
                    onClick={() => submit(item.q)}
                    tabIndex={open ? undefined : -1}
                    className="group flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,currentColor_12%,transparent)] bg-transparent px-3 py-2 text-left text-[0.76rem] text-[var(--text-secondary)] outline-none transition-all hover:border-[color-mix(in_srgb,currentColor_25%,transparent)] hover:bg-[var(--glass-hover)] hover:text-[var(--text)] focus-visible:border-[color-mix(in_srgb,currentColor_25%,transparent)] focus-visible:bg-[var(--glass-hover)] focus-visible:text-[var(--text)] active:scale-[0.99]"
                  >
                    <span className="font-mono text-[0.62rem] text-[var(--text-ghost)] transition-colors group-hover:text-[var(--accent-secondary)]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">{item.q}</span>
                    <ArrowUpRight
                      size={13}
                      aria-hidden="true"
                      className="shrink-0 text-[var(--text-ghost)] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-[var(--accent-secondary)]"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) =>
            m.role === 'user' ? (
              <div key={m.id} className="animate-msg-in flex flex-col items-end">
                <div className="max-w-[85%] rounded-[14px] rounded-br-[5px] bg-[var(--text)] px-3.5 py-2.5 text-[0.82rem] leading-[1.55] whitespace-pre-wrap text-[var(--bg)]">
                  {m.content}
                </div>
              </div>
            ) : (
              <div key={m.id} className="animate-msg-in flex items-start gap-2.5 py-0.5">
                <CompanionCube size={16} />
                <div className="min-w-0 flex-1 pt-px text-[0.84rem] leading-[1.65] whitespace-pre-wrap text-[var(--text)]">
                  {m.content}
                  {m.offline && (
                    <span className="mt-1.5 inline-block rounded-full border border-[var(--border)] px-1.5 py-px font-mono text-[0.56rem] text-[var(--text-ghost)]">
                      offline mock
                    </span>
                  )}
                </div>
              </div>
            ),
          )}

          {sending && (
            <div className="animate-msg-in flex items-start gap-2.5 py-0.5" aria-label="Thinking">
              <CompanionCube size={16} />
              <div className="flex items-center gap-1.5 pt-1.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="animate-typing-dot size-1.5 rounded-full bg-[var(--text-dim)]"
                    style={{ animationDelay: `${i * 180}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={jumpToLatest}
          aria-label="Scroll to latest messages"
          tabIndex={open && showJump ? undefined : -1}
          className={`absolute bottom-24 left-1/2 flex size-8 -translate-x-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--text-dim)] shadow-[var(--shadow-md)] outline-none transition-all duration-200 hover:text-[var(--text)] focus-visible:text-[var(--text)] ${
            showJump ? 'scale-100 opacity-100' : 'pointer-events-none scale-75 opacity-0'
          }`}
        >
          <ArrowDown size={14} />
        </button>

        <div className="shrink-0 border-t border-[var(--border)] p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(draft);
            }}
            className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,currentColor_12%,transparent)] bg-transparent py-1.5 pr-1.5 pl-3 transition-colors focus-within:border-[color-mix(in_srgb,currentColor_28%,transparent)]"
          >
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={quota.blocked ? 'Daily quota reached — come back tomorrow' : 'Ask about stack, projects…'}
              aria-label="Chat message"
              maxLength={2000}
              autoComplete="off"
              disabled={quota.blocked}
              tabIndex={open ? undefined : -1}
              className="h-8 min-w-0 flex-1 bg-transparent text-[0.85rem] text-[var(--text)] outline-none placeholder:text-[var(--text-ghost)] disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={!draft.trim() || sending || quota.blocked}
              aria-label="Send message"
              tabIndex={open ? undefined : -1}
              className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] bg-[var(--text)] text-[var(--bg)] outline-none transition-all hover:opacity-85 focus-visible:opacity-85 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
            >
              {sending ? <LoaderCircle size={14} className="animate-spin" /> : <ArrowUp size={14} />}
            </button>
          </form>
          <p className="m-0 pt-1.5 text-center font-mono text-[0.58rem] text-[var(--text-ghost)]">
            {quotaHint} · Enter ↵ to send · Esc to close
          </p>
        </div>
      </ContentWindow>
    </>
  );
}
