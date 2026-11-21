'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Bell,
  Briefcase,
  CheckCheck,
  Code2,
  Compass,
  Copy,
  FolderOpen,
  History,
  Mail,
  MessageCircle,
  MessageSquarePlus,
  Pencil,
  PanelRightClose,
  RotateCcw,
  Settings2,
  Square,
  Terminal,
} from 'lucide-react';
import { ArrowDown, ArrowUp, Trash, Warning } from '@/shared/ui/Icon';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useNav } from '@/app/providers/NavProvider';
import { ASSISTANT_QUOTA_LIMIT } from '@/app/api/assistant/quota';
import {
  ASSISTANT_COMMANDS,
  ASSISTANT_MODELS,
  filterAssistantCommands,
  type AssistantCommand,
  type AssistantModelId,
} from '@/entities/assistant';
import { profile } from '@/entities/profile';
import { scrollToTarget, setScrollLocked } from '@/widgets/smooth-scrolling/lenisStore';
import { Suggestions } from '@/shared/ui/agent-elements/Suggestions';
import type { SuggestionItem } from '@/shared/ui/agent-elements/Suggestions';
import { ThinkingTool } from '@/shared/ui/agent-elements/ThinkingTool';
import AssistantAvatar from '@/widgets/assistant/AssistantAvatar';
import AssistantMarkdown from '@/widgets/assistant/AssistantMarkdown';
import { useAssistant } from '@/widgets/assistant/useAssistant';
import styles from './Sidebar.module.scss';
import WorkspaceSettings from '@/widgets/workspace/WorkspaceSettings';
import ExplorePanel from '@/widgets/workspace/ExplorePanel';
import { Separator } from '@/shared/ui';
import SidebarRail from './SidebarRail';

/*  Geist-style assistant: user messages are inverted pills, answers are
    plain rows (no bubbles), and the composer sends with an arrow button.
    Slash commands navigate the portfolio or control the conversation.  */

const STARTER_PROMPTS = [
  {
    label: 'Backend',
    prompt: 'Which projects best show backend and systems work?',
    icon: <Code2 size={13} />,
  },
  {
    label: 'Nexagon',
    prompt: 'Tell me about Nexagon and the technical decisions behind it.',
    icon: <FolderOpen size={13} />,
  },
  {
    label: 'Experience',
    prompt: 'What experience is most relevant for a product team?',
    icon: <Briefcase size={13} />,
  },
] as const;

export default function WorkspaceSidebar() {
  const { open, setOpen, panel, panelWidth, setPanelWidth, openPanel } = useWorkspace();
  const { active } = useNav();
  const pathname = usePathname();
  const router = useRouter();
  const [readIds, setReadIds] = useState<number[]>([]);
  const [draft, setDraft] = useState('');
  const [showJump, setShowJump] = useState(false);
  const [commandIndex, setCommandIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const {
    messages,
    sending,
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
    clear,
  } = useAssistant();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const stickRef = useRef(true);
  const dockRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<HTMLDetailsElement>(null);
  const copyTimer = useRef<number | null>(null);

  const suggestionItems = useMemo<SuggestionItem[]>(
    () =>
      STARTER_PROMPTS.map((starter) => ({
        id: starter.prompt,
        label: starter.label,
        value: starter.prompt,
        icon: starter.icon,
      })),
    [],
  );

  const assistantVisible = open && panel === 'assistant';
  const streamingMessage = messages.find((message) => message.streaming);
  const hasAnswerContent = messages.some(
    (message) => message.streaming && message.content.length > 0,
  );
  const thinkingLabel =
    streamingMessage && streamingMessage.tools && streamingMessage.tools.length > 0
      ? streamingMessage.tools[streamingMessage.tools.length - 1].label
      : 'Thinking…';
  const completed = messages.filter(
    (message) => message.role === 'assistant' && !message.streaming && !message.interrupted,
  );
  const completedKey = completed.map((message) => message.id).join(',');
  const unread = completed.filter((message) => !readIds.includes(message.id)).length;
  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === 'assistant' && !message.streaming)?.id;
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const commandQuery = draft.startsWith('/') && !/\s/.test(draft) ? draft : '';
  const commandMatches = useMemo(
    () => (commandQuery ? filterAssistantCommands(commandQuery) : []),
    [commandQuery],
  );
  const showCommands = commandMatches.length > 0;
  const quotaHint = quota.blocked
    ? `Quota reached · back in ~${quota.resetHours}h`
    : `${quota.remaining} of ${ASSISTANT_QUOTA_LIMIT} left today`;
  const quotaPercent = Math.round((quota.remaining / ASSISTANT_QUOTA_LIMIT) * 100);
  const panelTitle =
    panel === 'notifications'
      ? 'Notifications'
      : panel === 'explore'
        ? 'On this page'
        : 'Appearance';

  useEffect(() => {
    if (!assistantVisible) return;
    // Mark replies as seen only when their conversation is actually visible.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReadIds(completedKey ? completedKey.split(',').map(Number) : []);
  }, [assistantVisible, completedKey]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(144, input.scrollHeight)}px`;
  }, [draft]);

  useEffect(() => {
    if (assistantVisible) inputRef.current?.focus({ preventScroll: true });
    else if (!open && document.activeElement?.closest('#assistant')) dockRef.current?.focus();
  }, [open, assistantVisible]);

  useEffect(() => {
    if (stickRef.current) {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: sending ? 'instant' : 'smooth',
      });
    }
  }, [messages, sending, open]);

  useEffect(
    () => () => {
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
    },
    [],
  );

  // On phones the panel is a bottom sheet, so the page behind it must not scroll.
  useEffect(() => {
    if (!open || !window.matchMedia('(max-width: 767px)').matches) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setScrollLocked(true);
    return () => {
      document.body.style.overflow = previous;
      setScrollLocked(false);
    };
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        ['1', '2', '3', '4'].includes(event.key)
      ) {
        event.preventDefault();
        if (event.key === '1') openPanel('assistant');
        if (event.key === '2') openPanel('notifications');
        if (event.key === '3') openPanel('explore');
        if (event.key === '4') openPanel('settings');
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'Backspace') {
        event.preventDefault();
        clear();
        setDraft('');
        inputRef.current?.focus({ preventScroll: true });
        return;
      }
      if (
        event.key === 'Escape' &&
        open &&
        !event.defaultPrevented &&
        !document.querySelector('[data-workspace-menu]')
      ) {
        setOpen(false);
        dockRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [clear, open, openPanel, setOpen]);

  const navigate = (rawHref: string) => {
    const href = rawHref.startsWith('#') ? `/${rawHref}` : rawHref;
    if (!window.matchMedia('(min-width: 1280px)').matches) setOpen(false);
    const hash = href.startsWith('/#') ? href.slice(1) : null;
    if (hash && window.location.pathname === '/') {
      scrollToTarget(hash === '#hero' ? 0 : hash);
      return;
    }
    router.push(href);
  };

  const handlePortfolioLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    event.preventDefault();
    navigate(href);
  };

  const copyText = async (text: string, id: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      if (copyTimer.current !== null) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopiedId(null), 1600);
    } catch {
      /* Clipboard permissions are optional; the message stays selectable. */
    }
  };

  const copyLatest = () => {
    const latest = [...messages].reverse().find((message) => message.role === 'assistant');
    if (latest) void copyText(latest.content, latest.id);
  };

  const startNewConversation = () => {
    clear();
    setDraft('');
    setReadIds([]);
    inputRef.current?.focus({ preventScroll: true });
  };

  const runCommand = (command: AssistantCommand) => {
    setDraft('');
    setCommandIndex(0);
    if (command.kind === 'navigate' && command.target) {
      navigate(command.target);
      return;
    }
    if (command.kind === 'prompt' && command.prompt) {
      setDraft(command.prompt);
      requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
      return;
    }
    if (command.action === 'new') startNewConversation();
    else if (command.action === 'stop') stop();
    else if (command.action === 'copy') copyLatest();
  };

  const submit = (raw: string) => {
    const text = raw.trim();
    if (!text || sending) return;

    if (text.startsWith('/')) {
      const token = text.split(/\s+/)[0];
      const command = ASSISTANT_COMMANDS.find((entry) => entry.name === token);
      if (command) {
        runCommand(command);
        return;
      }
    }

    setDraft('');
    stickRef.current = true;
    setShowJump(false);
    void send(text, { pathname, sectionId: active.sectionId ?? undefined });
  };

  const editCurrentMessage = (id: number) => {
    const content = editMessage(id);
    if (content === null) return;
    setDraft(content);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
  };

  const onListScroll = () => {
    const element = listRef.current;
    if (!element) return;
    const nearBottom = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
    stickRef.current = nearBottom;
    setShowJump(!nearBottom);
  };

  const jumpToLatest = () => {
    stickRef.current = true;
    setShowJump(false);
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    inputRef.current?.focus({ preventScroll: true });
  };

  return (
    <>
      <SidebarRail
        open={open}
        panel={panel}
        unread={unread}
        dockRef={dockRef}
        openPanel={openPanel}
      />
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={-1}
        data-open={open}
        className={styles.sheetBackdrop}
        onClick={() => setOpen(false)}
      />
      <section
        id="assistant"
        aria-label="Portfolio workspace"
        aria-hidden={!open}
        inert={!open}
        data-open={open}
        className={styles.sidebar}
        style={{ '--assistant-panel-width': `${panelWidth}px` } as CSSProperties}
      >
        <span className={styles.sheetGrabber} aria-hidden="true" />
        <div
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          aria-valuemin={360}
          aria-valuemax={640}
          aria-valuenow={panelWidth}
          tabIndex={open ? 0 : -1}
          className={styles.resizeHandle}
          onPointerDown={(event) => {
            event.preventDefault();
            event.currentTarget.setPointerCapture(event.pointerId);
            event.currentTarget.dataset.dragging = 'true';
          }}
          onPointerMove={(event) => {
            if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
            setPanelWidth(window.innerWidth - 56 - event.clientX);
          }}
          onPointerUp={(event) => {
            event.currentTarget.releasePointerCapture(event.pointerId);
            delete event.currentTarget.dataset.dragging;
          }}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault();
              setPanelWidth(panelWidth + 16);
            } else if (event.key === 'ArrowRight') {
              event.preventDefault();
              setPanelWidth(panelWidth - 16);
            }
          }}
        />
        <header className={styles.sidebarHeader}>
          <div className={styles.identity}>
            <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-[var(--text)]">
              {panel === 'assistant' ? 'Assistant' : panelTitle}
            </span>
            {panel === 'assistant' && (
              <span className={styles.headerSubtitle}>
                {activeSession?.title ?? 'Portfolio helper'}
              </span>
            )}
          </div>
          <div className={styles.headerActions}>
            <details
              ref={historyRef}
              className={styles.historyMenu}
              style={panel !== 'assistant' ? { display: 'none' } : undefined}
            >
              <summary
                aria-label="Conversation history"
                title="Saved conversations"
                tabIndex={open ? undefined : -1}
                className={styles.headerAction}
              >
                <History size={14} />
              </summary>
              <div className={styles.historyPopover}>
                <div className={styles.historyHeading}>
                  <span>Saved conversations</span>
                  <span>{sessions.length}</span>
                </div>
                {sessions.length === 0 ? (
                  <p className={styles.historyEmpty}>Your conversations will appear here.</p>
                ) : (
                  <ul className={styles.historyList}>
                    {sessions.map((session) => (
                      <li key={session.id} className={styles.historyRow}>
                        <button
                          type="button"
                          data-active={session.id === activeSessionId}
                          className={styles.historySelect}
                          onClick={() => {
                            switchSession(session.id);
                            if (historyRef.current) historyRef.current.open = false;
                          }}
                        >
                          <span>{session.title}</span>
                          <time dateTime={new Date(session.updatedAt).toISOString()}>
                            {new Intl.DateTimeFormat(undefined, {
                              month: 'short',
                              day: 'numeric',
                            }).format(session.updatedAt)}
                          </time>
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${session.title}`}
                          title="Delete conversation"
                          className={styles.historyDelete}
                          onClick={() => deleteSession(session.id)}
                        >
                          <Trash size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
            <button
              type="button"
              onClick={startNewConversation}
              style={panel !== 'assistant' ? { display: 'none' } : undefined}
              aria-label="Start a new conversation"
              aria-keyshortcuts="Control Shift Backspace"
              title="New conversation · Ctrl+Shift+Backspace"
              tabIndex={open ? undefined : -1}
              className={styles.headerAction}
            >
              <MessageSquarePlus size={15} />
            </button>
            <Separator
              orientation="vertical"
              className={styles.headerSeparator}
              style={panel !== 'assistant' ? { display: 'none' } : undefined}
            />
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close sidebar panel"
              aria-keyshortcuts="Escape"
              title="Close panel · Esc"
              tabIndex={open ? undefined : -1}
              className={styles.headerAction}
            >
              <PanelRightClose size={17} />
            </button>
          </div>
        </header>

        <div className={styles.panelTabs} aria-label="Workspace panels">
          {(
            [
              ['assistant', 'Assistant', MessageCircle],
              ['notifications', 'Inbox', Bell],
              ['explore', 'On this page', Compass],
              ['settings', 'Appearance', Settings2],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              aria-pressed={panel === id}
              data-active={panel === id}
              className={styles.panelTab}
              onClick={() => openPanel(id)}
            >
              <Icon size={15} aria-hidden="true" />
              <span>{label}</span>
              {id === 'notifications' && unread > 0 && (
                <span className={styles.panelTabBadge}>{unread}</span>
              )}
            </button>
          ))}
        </div>

        {panel === 'settings' && (
          <div className={styles.utilityBody} data-lenis-prevent>
            <WorkspaceSettings />
          </div>
        )}
        {panel === 'explore' && (
          <ExplorePanel
            onNavigate={() => {
              if (!window.matchMedia('(min-width: 1280px)').matches) setOpen(false);
            }}
          />
        )}
        {panel === 'notifications' && (
          <div className={styles.utilityBody} data-lenis-prevent>
            <div className={styles.inboxHeading}>
              <span>{unread ? `${unread} unread` : 'All caught up'}</span>
              <button
                type="button"
                title="Mark all as read"
                aria-label="Mark all as read"
                disabled={!unread}
                onClick={() => setReadIds(completed.map((message) => message.id))}
              >
                <CheckCheck size={16} />
              </button>
            </div>
            {quota.blocked && (
              <div role="status" className={styles.notice}>
                <Warning size={16} />
                <div>
                  <strong>Daily limit reached</strong>
                  <p>New questions available in about {quota.resetHours}h.</p>
                </div>
              </div>
            )}
            {completed.length === 0 ? (
              <div className={styles.emptyInbox}>
                <Bell size={28} />
                <h2>No notifications yet</h2>
                <p>Replies received while you explore will appear here.</p>
              </div>
            ) : (
              [...completed].reverse().map((message) => (
                <button
                  key={message.id}
                  type="button"
                  className={styles.notification}
                  data-unread={!readIds.includes(message.id)}
                  onClick={() => {
                    openPanel('assistant');
                    stickRef.current = true;
                  }}
                >
                  <MessageCircle size={16} />
                  <span>
                    <strong>
                      {message.offline ? 'Local assistant replied' : 'A new answer is ready'}
                    </strong>
                    <span>{message.content.replace(/[*#`]/g, '').slice(0, 140)}</span>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              ))
            )}
          </div>
        )}

        <div
          className={styles.assistantBody}
          style={panel !== 'assistant' ? { display: 'none' } : undefined}
        >
          <div
            ref={listRef}
            onScroll={onListScroll}
            data-lenis-prevent
            className="flex min-h-0 flex-1 touch-pan-y flex-col gap-5 overflow-y-auto overscroll-y-contain p-5 [-webkit-overflow-scrolling:touch]"
          >
            {quota.blocked && (
              <div
                role="alert"
                className="flex shrink-0 items-start gap-2.5 rounded-[var(--radius-md)] border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2.5"
              >
                <Warning size={14} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="m-0 text-[0.76rem] font-medium text-[var(--text)]">
                    Daily assistant limit reached
                  </p>
                  <p className="mt-1 mb-0 text-[0.68rem] leading-[1.5] text-[var(--text-secondary)]">
                    You&apos;ve used all {ASSISTANT_QUOTA_LIMIT} questions for today. New questions
                    will be available in about {quota.resetHours}h.
                  </p>
                </div>
              </div>
            )}
            {messages.length === 0 && !sending && (
              <div className={styles.emptyOverview}>
                <div className={styles.overviewIntro}>
                  <span className={styles.overviewAvatar}>
                    <AssistantAvatar size={30} />
                  </span>
                  <div>
                    <span className={styles.eyebrow}>ASSISTANT</span>
                    <h2>Good work starts with a good question.</h2>
                    <p>
                      Ask about Vyacheslav&apos;s projects, experience, writing, or how to get in
                      touch.
                    </p>
                  </div>
                </div>
                <Link
                  href="/#contact"
                  className={styles.availability}
                  onClick={(event) => handlePortfolioLink(event, '/#contact')}
                >
                  <span className={styles.availabilityDot} />
                  <span>{profile.brandTagline.replace('Building things that matter. ', '')}</span>
                  <ArrowUpRight size={14} />
                </Link>
                <div className={styles.starters} aria-label="Suggested questions">
                  <Suggestions
                    items={suggestionItems}
                    disabled={sending || quota.blocked}
                    onSelect={(item) => submit(item.value ?? item.label)}
                  />
                </div>
                <div className={styles.quickLinks} aria-label="Explore portfolio">
                  <Link
                    href="/#projects"
                    onClick={(event) => handlePortfolioLink(event, '/#projects')}
                  >
                    <FolderOpen size={15} />
                    <span>Projects</span>
                    <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    href="/#experience"
                    onClick={(event) => handlePortfolioLink(event, '/#experience')}
                  >
                    <Briefcase size={15} />
                    <span>Experience</span>
                    <ArrowUpRight size={13} />
                  </Link>
                  <Link
                    href="/#contact"
                    onClick={(event) => handlePortfolioLink(event, '/#contact')}
                  >
                    <Mail size={15} />
                    <span>Contact</span>
                    <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            )}

            {messages.map((message) =>
              message.role === 'user' ? (
                <div
                  key={message.id}
                  className={`${styles.messageGroup} animate-msg-in flex flex-col items-end`}
                >
                  <div className="max-w-[82%] rounded-[14px] rounded-br-[5px] bg-[var(--text)] px-4 py-3 text-[0.84rem] leading-[1.6] whitespace-pre-wrap text-[var(--bg)]">
                    <AssistantMarkdown content={message.content} onAction={navigate} />
                  </div>
                  <div className={styles.messageActions}>
                    <button
                      type="button"
                      className={styles.messageAction}
                      onClick={() => editCurrentMessage(message.id)}
                      disabled={sending}
                      aria-label="Edit this message"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  key={message.id}
                  className={`${styles.messageGroup} animate-msg-in flex items-start gap-3 py-1`}
                >
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--accent-secondary)]">
                    <AssistantAvatar size={17} />
                  </span>
                  <div className="min-w-0 flex-1 pt-px text-[0.875rem] leading-[1.72] text-[var(--text)]">
                    {message.streaming && !message.content && (
                      <div className="flex min-h-7 items-center">
                        <ThinkingTool label={thinkingLabel} />
                      </div>
                    )}
                    {message.content && (
                      <AssistantMarkdown content={message.content} onAction={navigate} />
                    )}
                    {message.interrupted && (
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">Response stopped</p>
                    )}
                    {message.offline && (
                      <span className="mt-1.5 inline-block rounded-full border border-[var(--border)] px-1.5 py-px text-[0.6rem] text-[var(--text-dim)]">
                        Answered from local portfolio context
                      </span>
                    )}
                    {!message.streaming && message.sources && message.sources.length > 0 && (
                      <nav
                        aria-label="Related portfolio content"
                        className="mt-4 grid gap-2 whitespace-normal"
                      >
                        <span className="text-[0.62rem] font-medium text-[var(--text-dim)]">
                          Related portfolio content
                        </span>
                        {message.sources.map((source) => {
                          const href = source.href.startsWith('#')
                            ? `/${source.href}`
                            : source.href;
                          return (
                            <a
                              key={source.href}
                              href={href}
                              onClick={(event) => handlePortfolioLink(event, href)}
                              className="group flex items-center justify-between gap-3 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-elevated)]/35 px-3 py-2.5 text-left no-underline outline-none transition-colors hover:border-[var(--border-hover)] hover:bg-[var(--glass-hover)] focus-visible:border-[var(--geist-focus)]"
                            >
                              <span className="min-w-0">
                                <span className="block text-[0.72rem] font-medium text-[var(--text)]">
                                  {source.title}
                                </span>
                                <span className="block truncate text-[0.62rem] text-[var(--text-dim)]">
                                  {source.description}
                                </span>
                              </span>
                              <ArrowUpRight
                                size={13}
                                aria-hidden="true"
                                className="shrink-0 text-[var(--text-ghost)]"
                              />
                            </a>
                          );
                        })}
                      </nav>
                    )}
                    {!message.streaming && message.content && (
                      <div className={styles.messageActions}>
                        <button
                          type="button"
                          className={styles.messageAction}
                          onClick={() => void copyText(message.content, message.id)}
                          aria-label="Copy this answer"
                        >
                          {copiedId === message.id ? <CheckCheck size={12} /> : <Copy size={12} />}
                          {copiedId === message.id ? 'Copied' : 'Copy'}
                        </button>
                        {message.id === lastAssistantId && (
                          <button
                            type="button"
                            className={styles.messageAction}
                            onClick={() =>
                              regenerate({
                                pathname,
                                sectionId: active.sectionId ?? undefined,
                              })
                            }
                            disabled={sending}
                            aria-label="Regenerate this answer"
                          >
                            <RotateCcw size={12} />
                            Regenerate
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ),
            )}

            {sending && !hasAnswerContent && !streamingMessage && (
              <div className={`${styles.messageGroup} animate-msg-in flex items-start gap-3 py-1`}>
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-[var(--accent-secondary)]">
                  <AssistantAvatar size={17} />
                </span>
                <div className="flex min-h-7 min-w-0 flex-1 items-center">
                  <ThinkingTool label={thinkingLabel} />
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

          <div className={styles.composerArea}>
            {showCommands && (
              <div className={styles.commandMenu} role="listbox" aria-label="Assistant commands">
                {commandMatches.map((command, index) => (
                  <button
                    key={command.id}
                    type="button"
                    role="option"
                    aria-selected={index === commandIndex}
                    data-active={index === commandIndex}
                    className={styles.commandRow}
                    onMouseEnter={() => setCommandIndex(index)}
                    onClick={() => runCommand(command)}
                  >
                    <Terminal size={13} />
                    <span className={styles.commandName}>{command.name}</span>
                    <span className={styles.commandDescription}>{command.description}</span>
                  </button>
                ))}
              </div>
            )}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                submit(draft);
              }}
              className="flex min-h-12 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-hover)] bg-transparent py-1.5 pr-1.5 pl-3.5 transition-colors focus-within:border-[var(--text-secondary)]"
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setCommandIndex(0);
                }}
                rows={1}
                onKeyDown={(event) => {
                  if (showCommands) {
                    if (event.key === 'ArrowDown') {
                      event.preventDefault();
                      setCommandIndex((index) => (index + 1) % commandMatches.length);
                      return;
                    }
                    if (event.key === 'ArrowUp') {
                      event.preventDefault();
                      setCommandIndex(
                        (index) => (index - 1 + commandMatches.length) % commandMatches.length,
                      );
                      return;
                    }
                    if (
                      event.key === 'Enter' &&
                      !event.shiftKey &&
                      !event.nativeEvent.isComposing
                    ) {
                      event.preventDefault();
                      const command =
                        commandMatches[Math.min(commandIndex, commandMatches.length - 1)];
                      if (command) runCommand(command);
                      return;
                    }
                  }
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    submit(draft);
                  }
                }}
                placeholder={
                  quota.blocked
                    ? 'Daily quota reached — come back tomorrow'
                    : 'Ask about Vyacheslav, or type / for commands'
                }
                aria-label="Message the assistant"
                maxLength={2000}
                autoComplete="off"
                disabled={quota.blocked}
                tabIndex={open ? undefined : -1}
                className="min-h-8 max-h-36 min-w-0 flex-1 resize-none bg-transparent py-1.5 text-[0.85rem] leading-5 text-[var(--text)] outline-none placeholder:text-[var(--text-ghost)] disabled:opacity-60"
              />
              <button
                type={sending ? 'button' : 'submit'}
                onClick={sending ? stop : undefined}
                disabled={!sending && (!draft.trim() || quota.blocked)}
                aria-label={sending ? 'Stop response' : 'Send message'}
                title={sending ? 'Stop response' : 'Send message'}
                tabIndex={open ? undefined : -1}
                className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] bg-[var(--text)] text-[var(--bg)] outline-none transition-all hover:opacity-85 focus-visible:opacity-85 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {sending ? <Square size={13} fill="currentColor" /> : <ArrowUp size={14} />}
              </button>
            </form>
            <div className={styles.composerMeta}>
              <span>{quotaHint}</span>
              <span className={styles.composerToolbar}>
                <span
                  className={styles.quotaGauge}
                  role="progressbar"
                  aria-label="Daily assistant quota remaining"
                  aria-valuemin={0}
                  aria-valuemax={ASSISTANT_QUOTA_LIMIT}
                  aria-valuenow={quota.remaining}
                >
                  <span style={{ width: `${quotaPercent}%` }} />
                </span>
                <select
                  className={styles.modelPicker}
                  value={model}
                  onChange={(event) => setModel(event.target.value as AssistantModelId)}
                  aria-label="Assistant model"
                  title="Assistant model"
                  disabled={sending}
                >
                  {ASSISTANT_MODELS.map((entry) => (
                    <option key={entry.id} value={entry.id} title={entry.note}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
