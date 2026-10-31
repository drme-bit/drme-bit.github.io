'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import Link from 'next/link';
import {
  Code2,
  Briefcase,
  Compass,
  FolderOpen,
  Mail,
  FileText,
  Wrench,
  Square,
  PanelRightClose,
  Bell,
  MessageCircle,
  Settings2,
  CheckCheck,
  History,
  MessageSquarePlus,
} from 'lucide-react';
import { Trash, ArrowDown, ArrowUpRight, ArrowUp, Warning, FiGithub, FiLinkedin, FiAtSign, SiDiscord } from '@/shared/ui/Icon';
import { useChat } from '@/app/providers/ChatProvider';
import { CHAT_QUOTA_LIMIT } from '@/app/api/chat/quota';
import { profile, socialLinks } from '@/entities/profile';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';
import { Suggestions } from '@/shared/ui/agent-elements/Suggestions';
import type { SuggestionItem } from '@/shared/ui/agent-elements/Suggestions';
import { ThinkingTool } from '@/shared/ui/agent-elements/ThinkingTool';
import GuideCat from './GuideCat';
import GuideCompanion from './GuideCompanion';
import { useAiChat } from './useAiChat';
import MarkdownMessage from './MarkdownMessage';
import styles from './Mascot.module.scss';
import WorkspaceSettings from '@/widgets/workspace/WorkspaceSettings';
import ExplorePanel from '@/widgets/workspace/ExplorePanel';
import WorkspaceMenu from '@/widgets/workspace/WorkspaceMenu';
import { Separator } from '@/shared/ui';

/*  Geist-style chat: user messages are inverted pills, assistant replies
    are plain rows (no bubbles), composer sends with an arrow button.  */

export default function Mascot() {
  const { open, setOpen, panel, panelWidth, setPanelWidth, openPanel } = useChat();
  const [readIds, setReadIds] = useState<number[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [showJump, setShowJump] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const {
    messages,
    sending,
    thinkingLabel,
    offline,
    quota,
    sessions,
    activeSessionId,
    switchSession,
    deleteSession,
    send,
    stop,
    clear,
  } = useAiChat();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const stickRef = useRef(true);
  const dockRef = useRef<HTMLButtonElement>(null);
  const historyRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1279px)');
    const updateViewport = () => setIsMobileViewport(media.matches);
    updateViewport();
    media.addEventListener('change', updateViewport);
    return () => media.removeEventListener('change', updateViewport);
  }, []);

  const suggestedQuestions = useMemo(() => {
    const context = messages
      .slice(-3)
      .map((message) => message.content)
      .join(' ')
      .toLowerCase();

    if (context.includes('nexagon') || context.includes('webgpu') || context.includes('rust')) {
      return [
        {
          label: 'Architecture',
          prompt: 'What technical decisions shaped Nexagon?',
        },
        { label: 'Systems', prompt: 'Which other projects show systems work?' },
        { label: 'Live UI', prompt: 'How does he approach real-time interfaces?' },
      ];
    }
    if (
      context.includes('available') ||
      context.includes('freelance') ||
      context.includes('full-time')
    ) {
      return [
        { label: 'Good collaboration fit', prompt: 'What kind of collaboration is a good fit?' },
        { label: 'Product-focused projects', prompt: 'Which projects best show product work?' },
        { label: 'How to get in touch', prompt: 'How can I get in touch with Vyacheslav?' },
      ];
    }
    if (
      context.includes('experience') ||
      context.includes('team') ||
      context.includes('timeline')
    ) {
      return [
        {
          label: 'Relevant product experience',
          prompt: 'Which experience is most relevant to a product team?',
        },
        { label: 'End-to-end ownership', prompt: 'What does he usually own end to end?' },
        { label: 'What to explore next', prompt: 'Which project should I look at next?' },
      ];
    }
    if (
      context.includes('backend') ||
      context.includes('systems') ||
      context.includes('infrastructure')
    ) {
      return [
        { label: 'Beyond the frontend', prompt: 'What did he build beyond the frontend?' },
        { label: 'Deepest architecture', prompt: 'Which project has the deepest architecture?' },
        {
          label: 'Speed vs engineering depth',
          prompt: 'How does he balance speed and engineering depth?',
        },
      ];
    }
    return [
      {
        label: 'Backend',
        prompt: 'Which projects best show backend and systems work?',
      },
      {
        label: 'Nexagon',
        prompt: 'Tell me about Nexagon and the technical decisions behind it.',
      },
      {
        label: 'Experience',
        prompt: 'What experience is most relevant for a product team?',
      },
    ];
  }, [messages]);

  const suggestionItems = useMemo<SuggestionItem[]>(
    () =>
      suggestedQuestions.map((question, index) => ({
        id: question.prompt,
        label: question.label,
        value: question.prompt,
        icon:
          index === 0 ? (
            <Code2 size={13} />
          ) : index === 1 ? (
            <FolderOpen size={13} />
          ) : (
            <Briefcase size={13} />
          ),
      })),
    [suggestedQuestions],
  );
  const hasStreamingMessage = messages.some((message) => message.streaming);
  const completed = messages.filter(
    (message) => message.role === 'assistant' && !message.streaming && !message.interrupted,
  );
  const completedKey = completed.map((message) => message.id).join(',');
  const chatVisible = open && panel === 'chat';
  const unread = completed.filter((message) => !readIds.includes(message.id)).length;

  useEffect(() => {
    if (!chatVisible) return;
    // Mark replies as seen only when their conversation is actually visible.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReadIds(completedKey ? completedKey.split(',').map(Number) : []);
  }, [chatVisible, completedKey]);

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = `${Math.min(144, input.scrollHeight)}px`;
  }, [draft]);

  useEffect(() => {
    if (open && isMobileViewport) closeRef.current?.focus({ preventScroll: true });
    else if (chatVisible) inputRef.current?.focus({ preventScroll: true });
    else if (!open && document.activeElement?.closest('#chat')) dockRef.current?.focus();
  }, [open, panel, chatVisible, isMobileViewport]);

  useEffect(() => {
    if (!open || !isMobileViewport) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, isMobileViewport]);

  useEffect(() => {
    if (stickRef.current) {
      listRef.current?.scrollTo({
        top: listRef.current.scrollHeight,
        behavior: sending ? 'instant' : 'smooth',
      });
    }
  }, [messages, sending, open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' && open && isMobileViewport) {
        const dialog = document.getElementById('chat');
        const focusable = dialog
          ? Array.from(
              dialog.querySelectorAll<HTMLElement>(
                'button:not([disabled]), a[href], textarea:not([disabled]), summary, [tabindex]:not([tabindex="-1"])',
              ),
            ).filter((element) => element.getClientRects().length > 0)
          : [];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (
          first &&
          last &&
          e.shiftKey &&
          (document.activeElement === first || !dialog?.contains(document.activeElement))
        ) {
          e.preventDefault();
          last.focus();
        } else if (
          first &&
          last &&
          !e.shiftKey &&
          (document.activeElement === last || !dialog?.contains(document.activeElement))
        ) {
          e.preventDefault();
          first.focus();
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && ['1', '2', '3', '4'].includes(e.key)) {
        e.preventDefault();
        if (e.key === '1') openPanel('chat');
        if (e.key === '2') openPanel('notifications');
        if (e.key === '3') openPanel('explore');
        if (e.key === '4') openPanel('settings');
        return;
      }
      if (
        e.key === 'Escape' &&
        open &&
        !e.defaultPrevented &&
        !document.querySelector('[data-workspace-menu]')
      ) {
        setOpen(false);
        dockRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [isMobileViewport, open, openPanel, setOpen]);

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
  const quotaHint = quota.blocked
    ? `Quota reached · back in ~${quota.resetHours}h`
    : `${quota.remaining} of ${CHAT_QUOTA_LIMIT} left today`;
  const quotaPercent = Math.round((quota.remaining / CHAT_QUOTA_LIMIT) * 100);
  const panelTitle =
    panel === 'chat'
      ? sessions.find((session) => session.id === activeSessionId)?.title || 'Portfolio guide'
      : panel === 'notifications'
        ? 'Notifications'
        : panel === 'explore'
          ? 'On this page'
          : 'Appearance';
  const panelSubtitle =
    panel === 'chat'
      ? hasStreamingMessage
        ? 'Replying'
        : sending
          ? 'Thinking'
          : offline
            ? 'Local mode'
            : 'Ready to help'
      : '';

  const previousCompletedKey = useRef(completedKey);
  useEffect(() => {
    if (
      previousCompletedKey.current &&
      previousCompletedKey.current !== completedKey &&
      !chatVisible
    ) {
      const latest = completed[completed.length - 1];
      if (latest) {
        // The toast is an external notification synchronized with a completed reply.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToastMessage(
          latest.offline ? 'The local guide has replied' : 'Your portfolio answer is ready',
        );
        const timer = window.setTimeout(() => setToastMessage(null), 5200);
        return () => window.clearTimeout(timer);
      }
    }
    previousCompletedKey.current = completedKey;
  }, [chatVisible, completed, completedKey]);

  const handlePortfolioLink = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const hash = href.startsWith('/#') ? href.slice(1) : null;
    if (hash && window.location.pathname === '/') {
      event.preventDefault();
      scrollToTarget(hash);
    }
    if (!window.matchMedia('(min-width: 1280px)').matches) setOpen(false);
  };

  return (
    <>
      <aside className={styles.rail} data-open={open} aria-label="Portfolio guide dock">
        <button
          ref={dockRef}
          type="button"
          className={styles.launcher}
          onClick={() => openPanel('chat')}
          data-active={open && panel === 'chat'}
          aria-label={
            sending ? 'Open portfolio guide, response in progress' : 'Open portfolio guide'
          }
          aria-expanded={open}
          aria-controls="chat"
          aria-current={open && panel === 'chat' ? 'page' : undefined}
          aria-keyshortcuts="Control Shift 1 Meta Shift 1"
          data-tooltip="Portfolio guide"
          title="Portfolio guide · ⌘⇧1"
        >
          <span className={styles.portrait} data-busy={sending}>
            <GuideCat size={30} />
            <span className={styles.dot} data-busy={sending} />
          </span>
        </button>
        <Separator orientation="horizontal" className={styles.railSeparator} />
        <div className={styles.railTools}>
          <button
            type="button"
            className={styles.toolButton}
            data-tooltip="Inbox"
            data-active={open && panel === 'notifications'}
            aria-keyshortcuts="Control Shift 2 Meta Shift 2"
            title="Notifications · ⌘⇧2"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            aria-current={open && panel === 'notifications' ? 'page' : undefined}
            onClick={() => openPanel('notifications')}
          >
            <Bell size={18} />
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
          <button
            type="button"
            className={styles.toolButton}
            data-tooltip="Explore this page"
            data-active={open && panel === 'explore'}
            aria-keyshortcuts="Control Shift 3 Meta Shift 3"
            title="Explore · ⌘⇧3"
            aria-label="Explore page sections"
            aria-current={open && panel === 'explore' ? 'page' : undefined}
            onClick={() => openPanel('explore')}
          >
            <Compass size={18} />
          </button>
          <button
            type="button"
            className={styles.toolButton}
            data-tooltip="Settings"
            data-active={open && panel === 'settings'}
            aria-keyshortcuts="Control Shift 4 Meta Shift 4"
            title="Settings · ⌘⇧4"
            aria-label="Workspace settings"
            aria-current={open && panel === 'settings' ? 'page' : undefined}
            onClick={() => openPanel('settings')}
          >
            <Settings2 size={18} />
          </button>
        </div>
        <div className={styles.railSpacer} aria-hidden="true" />
        <Separator orientation="horizontal" className={`${styles.railSeparator} ${styles.socialSeparator}`} />
        <nav className={styles.railSocials} aria-label="Social links">
          {socialLinks.map((link) => {
            const Icon = link.id === 'github' ? FiGithub : link.id === 'linkedin' ? FiLinkedin : SiDiscord;
            return (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialButton}
                data-tooltip={link.label}
                aria-label={link.label}
              >
                <Icon size={16} />
              </a>
            );
          })}
          <a href={`mailto:${profile.email}`} className={styles.socialButton} data-tooltip="Email" aria-label="Email">
            <FiAtSign size={16} />
          </a>
        </nav>
        <Separator orientation="horizontal" className={`${styles.railSeparator} ${styles.socialSeparator}`} />
        <div className={styles.railFooter}>
          <WorkspaceMenu />
        </div>
      </aside>
      {/* Mobile backdrop — always mounted so Safari computes the blur once;
          desktop keeps the page visible in its neighbouring work area. */}
      <div
        aria-hidden="true"
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-[1001] bg-black/60 backdrop-blur-sm transition-opacity duration-[360ms] xl:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <section
        id="chat"
        aria-label="Portfolio workspace"
        role={open && isMobileViewport ? 'dialog' : undefined}
        aria-modal={open && isMobileViewport ? true : undefined}
        aria-hidden={!open}
        inert={!open}
        data-open={open}
        className={styles.sidebar}
        style={{ '--chat-panel-width': `${panelWidth}px` } as CSSProperties}
      >
        <div
          role="separator"
          aria-label="Resize sidebar"
          aria-orientation="vertical"
          aria-valuemin={360}
          aria-valuemax={640}
          aria-valuenow={panelWidth}
          tabIndex={open && !isMobileViewport ? 0 : -1}
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
          <GuideCompanion
            mood={
              hasStreamingMessage
                ? 'replying'
                : sending
                  ? 'thinking'
                  : draft
                    ? 'listening'
                    : messages.length
                      ? 'ready'
                      : 'idle'
            }
          />
          <div className={styles.identity}>
            <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-[var(--text)]">
              {panelTitle}
            </span>
            {panel === 'chat' && (
              <span className={styles.statusLine}>
                <span className={`size-1.5 rounded-full ${statusDot}`} aria-hidden="true" />
                {panelSubtitle}
              </span>
            )}
          </div>
          <div className={styles.headerActions}>
            <details
              ref={historyRef}
              className={styles.historyMenu}
              style={panel !== 'chat' ? { display: 'none' } : undefined}
            >
              <summary
                aria-label="Chat history"
                title="Saved chats"
                tabIndex={open ? undefined : -1}
                className={styles.headerAction}
              >
                <History size={14} />
              </summary>
              <div className={styles.historyPopover}>
                <div className={styles.historyHeading}>
                  <span>Saved chats</span>
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
                            {new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(session.updatedAt)}
                          </time>
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete ${session.title}`}
                          title="Delete chat"
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
              onClick={clear}
              style={panel !== 'chat' ? { display: 'none' } : undefined}
              aria-label="Start a new chat"
              aria-keyshortcuts="Control Shift Backspace"
              title="New chat · Ctrl+Shift+Backspace"
              tabIndex={open ? undefined : -1}
              className={styles.headerAction}
            >
              <MessageSquarePlus size={15} />
            </button>
            <Separator
              orientation="vertical"
              className={styles.headerSeparator}
              style={panel !== 'chat' ? { display: 'none' } : undefined}
            />
            <button
              ref={closeRef}
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

        <nav aria-label="Workspace sections" className={styles.panelNav}>
          {[
            { id: 'chat', label: 'Chat', Icon: MessageCircle },
            { id: 'notifications', label: 'Inbox', Icon: Bell },
            { id: 'explore', label: 'Explore', Icon: Compass },
            { id: 'settings', label: 'Settings', Icon: Settings2 },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-current={panel === id ? 'page' : undefined}
              title={`${label} · ⌘⇧${id === 'chat' ? '1' : id === 'notifications' ? '2' : id === 'explore' ? '3' : '4'}`}
              onClick={() => openPanel(id as 'chat' | 'notifications' | 'explore' | 'settings')}
            >
              <Icon size={14} />
              {label}
              {id === 'notifications' && unread > 0 && (
                <span className={styles.count}>{unread}</span>
              )}
            </button>
          ))}
        </nav>

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
                    openPanel('chat');
                    stickRef.current = true;
                  }}
                >
                  <MessageCircle size={16} />
                  <span>
                    <strong>
                      {message.offline ? 'Local guide replied' : 'Your answer is ready'}
                    </strong>
                    <span>{message.content.replace(/[*#`]/g, '').slice(0, 140)}</span>
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              ))
            )}
          </div>
        )}

        <div className={styles.chatBody} style={panel !== 'chat' ? { display: 'none' } : undefined}>
          <div
            ref={listRef}
            onScroll={onListScroll}
            data-lenis-prevent
            className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overscroll-contain p-5"
          >
            {quota.blocked && (
              <div
                role="alert"
                className="flex shrink-0 items-start gap-2.5 rounded-[var(--radius-md)] border border-amber-400/25 bg-amber-400/[0.06] px-3 py-2.5"
              >
                <Warning size={14} className="mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="m-0 text-[0.76rem] font-medium text-[var(--text)]">
                    Daily chat limit reached
                  </p>
                  <p className="mt-1 mb-0 text-[0.68rem] leading-[1.5] text-[var(--text-secondary)]">
                    You&apos;ve used all {CHAT_QUOTA_LIMIT} questions for today. New questions will
                    be available in about {quota.resetHours}h.
                  </p>
                </div>
              </div>
            )}
            {messages.length === 0 && !sending && (
              <div className={styles.emptyOverview}>
                <div className={styles.overviewIntro}>
                  <span className={styles.overviewMascot}>
                    <GuideCat size={38} />
                  </span>
                  <div>
                    <span className={styles.eyebrow}>PORTFOLIO GUIDE</span>
                    <h2>Good work starts with a good question.</h2>
                    <p>Explore the work or ask me about the thinking behind it.</p>
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

            {messages.map((m) =>
              m.role === 'user' ? (
                <div key={m.id} className="animate-msg-in flex flex-col items-end">
                  <div className="max-w-[82%] rounded-[14px] rounded-br-[5px] bg-[var(--text)] px-4 py-3 text-[0.84rem] leading-[1.6] whitespace-pre-wrap text-[var(--bg)]">
                    <MarkdownMessage content={m.content} />
                  </div>
                </div>
              ) : (
                <div key={m.id} className="animate-msg-in flex items-start gap-3 py-1">
                  <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-elevated)]">
                    <GuideCat size={21} />
                  </span>
                  <div className="min-w-0 flex-1 pt-px text-[0.875rem] leading-[1.72] text-[var(--text)]">
                    <MarkdownMessage content={m.content} />
                    {m.interrupted && (
                      <p className="mt-2 text-xs text-[var(--text-secondary)]">Response stopped</p>
                    )}
                    {m.offline && (
                      <span className="mt-1.5 inline-block rounded-full border border-[var(--border)] px-1.5 py-px text-[0.6rem] text-[var(--text-dim)]">
                        Answered from the local portfolio guide
                      </span>
                    )}
                    {!m.streaming && m.sources && m.sources.length > 0 && (
                      <nav
                        aria-label="Related portfolio content"
                        className="mt-4 grid gap-2 whitespace-normal"
                      >
                        <span className="text-[0.62rem] font-medium text-[var(--text-dim)]">
                          Related portfolio content
                        </span>
                        {m.sources.map((source) => (
                          <a
                            key={source.href}
                            href={source.href.startsWith('#') ? `/${source.href}` : source.href}
                            onClick={(event) => {
                              const href = source.href.startsWith('#')
                                ? `/${source.href}`
                                : source.href;
                              handlePortfolioLink(event, href);
                            }}
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
                        ))}
                      </nav>
                    )}
                  </div>
                </div>
              ),
            )}

            {sending && !hasStreamingMessage && (
              <div className="animate-msg-in flex items-start gap-2.5 py-0.5">
                <GuideCat size={24} />
                <ThinkingTool label={thinkingLabel} />
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit(draft);
              }}
              className="flex min-h-12 items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border-hover)] bg-transparent py-1.5 pr-1.5 pl-3.5 transition-colors focus-within:border-[var(--text-secondary)]"
            >
              <textarea
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={1}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                    event.preventDefault();
                    submit(draft);
                  }
                }}
                placeholder={
                  quota.blocked
                    ? 'Daily quota reached — come back tomorrow'
                    : 'Ask about a project or experience'
                }
                aria-label="Chat message"
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
            <div className={styles.composerSuggestions}>
              <Suggestions
                className="min-w-0 flex-1"
                items={suggestionItems}
                disabled={sending || quota.blocked}
                onSelect={(item) => {
                  setDraft(item.value ?? item.label);
                  inputRef.current?.focus({ preventScroll: true });
                }}
              />
              <details className={styles.composerTools}>
                <summary
                  title="Page actions"
                  aria-label="Page actions"
                  className="flex size-7 cursor-pointer list-none items-center justify-center rounded-md border border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--glass-hover)] focus-visible:outline-2 [&::-webkit-details-marker]:hidden"
                >
                  <Wrench size={14} />
                </summary>
                <nav
                  aria-label="Page actions"
                  className="absolute right-0 bottom-9 z-20 w-44 rounded-md border border-[var(--border)] bg-[var(--bg-elevated)] p-1 shadow-lg"
                >
                  {[
                    { label: 'Open projects', href: '/#projects', Icon: FolderOpen },
                    { label: 'Open experience', href: '/#experience', Icon: Briefcase },
                    { label: 'Open contact', href: '/#contact', Icon: Mail },
                    { label: 'View resume', href: '/resume', Icon: FileText },
                    { label: 'Back to top', href: '/#hero', Icon: Compass },
                  ].map(({ label, href, Icon }) => (
                    <a
                      key={href}
                      href={href}
                      onClick={(event) => {
                        event.currentTarget.closest('details')?.removeAttribute('open');
                        const hash = href.startsWith('/#') ? href.slice(1) : null;
                        if (hash && hash === '#hero' && window.location.pathname === '/') {
                          event.preventDefault();
                          scrollToTarget(0);
                          if (!window.matchMedia('(min-width: 1280px)').matches) setOpen(false);
                          return;
                        }
                        handlePortfolioLink(event, href);
                      }}
                      className="flex items-center gap-2 rounded px-2 py-2 text-xs text-[var(--text-secondary)] no-underline hover:bg-[var(--glass-hover)] focus-visible:outline-2"
                    >
                      <Icon size={14} />
                      {label}
                    </a>
                  ))}
                </nav>
              </details>
            </div>
            <div className={styles.composerMeta}>
              <span>{quotaHint}</span>
              <span
                className={styles.quotaGauge}
                role="progressbar"
                aria-label="Daily chat quota remaining"
                aria-valuemin={0}
                aria-valuemax={CHAT_QUOTA_LIMIT}
                aria-valuenow={quota.remaining}
              >
                <span style={{ width: `${quotaPercent}%` }} />
              </span>
            </div>
          </div>
        </div>
      </section>
      {toastMessage && (
        <button
          type="button"
          className={styles.toast}
          onClick={() => {
            setToastMessage(null);
            openPanel('chat');
          }}
          role="status"
        >
          <span className={styles.toastDot} />
          <span>{toastMessage}</span>
          <MessageCircle size={14} />
        </button>
      )}
    </>
  );
}
