'use client';

import { useEffect, useState, type MouseEvent } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { TransitionLink } from '@/features/transitions';
import { scrollToTarget, setScrollLocked } from '@/widgets/smooth-scrolling/lenisStore';
import {
  Menu,
  ChartActivity,
  FileText,
  FolderClosed,
  BookOpen,
  FiAtSign,
  FiGithub,
  FiLinkedin,
  SiDiscord,
} from '@/shared/ui/Icon';
import { IconButton, Separator } from '@/shared/ui';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useNav } from '@/app/providers/NavProvider';
import styles from './MobileNav.module.scss';
import AssistantAvatar from '@/widgets/assistant/AssistantAvatar';
import { GLOBAL_NAV, HOME_SECTION_IDS } from '@/shared/config/navConfig';
import type { NavGroup, NavLeaf } from '@/shared/config/navTypes';
import { profile, socialLinks } from '@/entities/profile';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/shared/ui/Sheet/Sheet';

const homeGroup = GLOBAL_NAV.find((item): item is NavGroup => item.id === 'home');

const SECTIONS = HOME_SECTION_IDS.map((id) =>
  homeGroup?.children.find(
    (child): child is NavLeaf & { type: 'section' } =>
      child.type === 'section' && child.targetId === id,
  ),
).filter((item): item is NavLeaf & { type: 'section' } => Boolean(item));

const QUICK_LINKS = [
  { id: 'projects', label: 'All projects', href: '/projects', Icon: FolderClosed },
  { id: 'blog', label: 'Writing', href: '/blog', Icon: BookOpen },
  { id: 'stats', label: 'Stats', href: '/stats', Icon: ChartActivity },
  { id: 'resume', label: 'Résumé', href: '/resume', Icon: FileText },
] as const;

const TOOLS = [
  { id: 'notifications', label: 'Inbox' },
  { id: 'explore', label: 'Explore this page' },
  { id: 'settings', label: 'Appearance' },
] as const;

const socialIcons = { github: FiGithub, linkedin: FiLinkedin, discord: SiDiscord } as const;

const rowClass =
  'group flex min-h-12 items-center gap-3 rounded-xl px-3 py-2 text-[14px] text-foreground transition-colors duration-150 hover:bg-secondary active:bg-secondary/70';
const rowIconClass = 'size-[18px] shrink-0 text-muted-foreground';

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpen: setAssistantOpen, openPanel } = useWorkspace();
  const { active } = useNav();
  const isHome = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

  // The menu covers the whole viewport, so the page behind it must not scroll.
  useEffect(() => {
    if (!menuOpen || !window.matchMedia('(max-width: 767px)').matches) return;
    setScrollLocked(true);
    return () => setScrollLocked(false);
  }, [menuOpen]);

  const openTool = (panel: (typeof TOOLS)[number]['id']) => {
    openPanel(panel);
  };

  const sectionClick = (event: MouseEvent<HTMLAnchorElement>, targetId: string) => {
    if (isHome) {
      event.preventDefault();
      scrollToTarget(`#${targetId}`);
    } else {
      event.preventDefault();
      router.push(`/#${targetId}`);
    }
  };

  return (
    <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
      <SheetTrigger asChild>
        <IconButton
          size="icon-sm"
          aria-label="Open menu"
          className="text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <Menu className="size-[18px]" />
        </IconButton>
      </SheetTrigger>

      <SheetContent
        overlayClassName={styles.menuOverlay}
        className={`${styles.menuContent} flex flex-col gap-0 overflow-hidden p-0`}
        showClose={false}
        side="right"
      >
        <header className={`${styles.header} flex shrink-0 items-center justify-between px-4`}>
          <div className="flex min-w-0 items-center gap-3">
            <span
              data-mobile-nav-logo
              className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 font-mono text-xs font-semibold tracking-wide text-foreground"
            >
              d_
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                drme_ / portfolio
              </span>
              <SheetTitle className="m-0 text-[16px] font-semibold tracking-[-0.02em] text-foreground">
                Menu
              </SheetTitle>
            </div>
          </div>
          <SheetClose asChild>
            <IconButton
              size="icon-sm"
              aria-label="Close menu"
              className="size-10 rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <span className="text-sm">✕</span>
            </IconButton>
          </SheetClose>
        </header>

        <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-x-hidden overflow-y-auto px-4 pb-[max(24px,env(safe-area-inset-bottom))] pt-5 touch-pan-y [-webkit-overflow-scrolling:touch]" data-lenis-prevent>
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => setAssistantOpen(true)}
              className="flex min-h-[64px] w-full items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-left text-background transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/10">
                <AssistantAvatar size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-medium">Ask the assistant</span>
                <span className="mt-0.5 block text-[12px] text-background/65">
                  Projects, experience, or collaboration
                </span>
              </span>
              <span aria-hidden="true" className="text-lg">↗</span>
            </button>
          </SheetClose>

          <section aria-label="On this page">
            <h3 className="m-0 mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              On this page
            </h3>
            <nav className="flex flex-col gap-0.5">
              {SECTIONS.map((leaf) => {
                const Icon = leaf.icon;
                const selected = isHome && active.sectionId === leaf.id;
                return (
                  <SheetClose asChild key={leaf.id}>
                    <a
                      href={`/#${leaf.targetId}`}
                      aria-current={selected ? 'location' : undefined}
                      onClick={(event) => sectionClick(event, leaf.targetId)}
                      className={`${rowClass} ${selected ? 'bg-secondary' : ''}`}
                    >
                      {Icon && <Icon className={rowIconClass} aria-hidden="true" />}
                      <span className="min-w-0 flex-1">{leaf.label}</span>
                      {selected && <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />}
                    </a>
                  </SheetClose>
                );
              })}
            </nav>
          </section>

          <Separator />

          <section aria-label="Explore">
            <h3 className="m-0 mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Explore
            </h3>
            <nav className="flex flex-col gap-0.5">
              {QUICK_LINKS.map(({ id, label, href, Icon }) => (
                <SheetClose asChild key={id}>
                  <TransitionLink href={href} className={rowClass}>
                    <Icon className={rowIconClass} aria-hidden="true" />
                    <span>{label}</span>
                  </TransitionLink>
                </SheetClose>
              ))}
            </nav>
          </section>

          <Separator />

          <section aria-label="Workspace tools">
            <h3 className="m-0 mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/70">
              Tools
            </h3>
            <nav className="flex flex-col gap-0.5">
              {TOOLS.map(({ id, label }) => (
                <SheetClose asChild key={id}>
                  <button
                    type="button"
                    onClick={() => openTool(id)}
                    className={rowClass}
                  >
                    <span className={`${rowIconClass} text-center font-mono text-[13px] leading-[18px]`} aria-hidden="true">
                      {id === 'notifications' ? '◉' : id === 'explore' ? '◇' : '◐'}
                    </span>
                    <span>{label}</span>
                  </button>
                </SheetClose>
              ))}
            </nav>
          </section>

          <div className="mt-auto">
            <Separator className="mb-3" />
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/65">
                Elsewhere
              </span>
              <nav aria-label="Social links" className="flex items-center gap-0.5">
                {socialLinks.map((link) => {
                  const Icon = socialIcons[link.id];
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
                <a
                  href={`mailto:${profile.email}`}
                  aria-label="Email"
                  className="flex size-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <FiAtSign className="size-4" />
                </a>
              </nav>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
