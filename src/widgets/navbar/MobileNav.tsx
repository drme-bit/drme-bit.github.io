'use client';

import { TransitionLink } from '@/features/transitions';
import { usePathname } from 'next/navigation';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';
import { Menu } from '@/shared/ui/Icon';
import { useChat } from '@/app/providers/ChatProvider';
import { useNav } from '@/app/providers/NavProvider';
import styles from './MobileNav.module.scss';
import GuideCat from '@/widgets/mascot/GuideCat';
import { GLOBAL_NAV } from '@/shared/config/navConfig';
import type { NavGroup, NavRouteLink, NavLeaf } from '@/shared/config/navTypes';
import { IconButton, Separator } from '@/shared/ui';
import { FiAtSign, FiGithub, FiLinkedin, SiDiscord } from '@/shared/ui/Icon';
import { profile, socialLinks } from '@/entities/profile';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from '@/shared/ui/Sheet/Sheet';

function leafHref(leaf: NavLeaf): string {
  if (leaf.type === 'route') return leaf.href;
  if (leaf.type === 'section') return `/#${leaf.targetId}`;
  return '#';
}

const linkClass =
  'group flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-muted-foreground transition-[background,color,transform] duration-150 hover:bg-secondary/70 hover:text-foreground active:scale-[0.99]';
const iconClass = 'size-4 shrink-0 text-accent';
const socialIcons = { github: FiGithub, linkedin: FiLinkedin, discord: SiDiscord } as const;

export function MobileNav() {
  const groups = GLOBAL_NAV.filter((item): item is NavGroup => item.type === 'group');
  const routes = GLOBAL_NAV.filter((item): item is NavRouteLink => item.type === 'route');
  const pathname = usePathname();
  const { setOpen: setChatOpen } = useChat();
  const { active } = useNav();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <IconButton
          size="icon-sm"
          aria-label="Open menu"
          className="text-muted-foreground hover:bg-secondary hover:text-foreground lg:hidden"
        >
          <Menu className="size-4" />
        </IconButton>
      </SheetTrigger>
      <SheetContent
        overlayClassName={styles.menuOverlay}
        className={`${styles.menuContent} !top-[60px] !right-[56px] !bottom-2 !left-2 !h-[calc(100dvh-68px)] !min-h-0 !max-h-[calc(100dvh-68px)] !w-auto !max-w-none !gap-0 !overflow-hidden !rounded-2xl !border !border-border !bg-background !p-0 !shadow-2xl !z-[1010] max-[767px]:!inset-x-2 max-[767px]:!top-[max(8px,env(safe-area-inset-top))] max-[767px]:!bottom-[max(8px,env(safe-area-inset-bottom))] max-[767px]:!h-auto max-[767px]:!max-h-none`}
        showClose={false}
        side="right"
      >
        <div className="flex min-h-[64px] shrink-0 items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 font-mono text-xs font-semibold tracking-wide text-foreground">d_</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">drme_ / portfolio</span>
              <span className="text-[15px] font-semibold tracking-[-0.02em] text-foreground">Menu</span>
            </div>
          </div>
          <SheetClose asChild>
            <IconButton
              size="icon-sm"
              aria-label="Close menu"
              className="size-9 rounded-lg border border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <span className="text-xs">✕</span>
            </IconButton>
          </SheetClose>
        </div>

        <div className="flex min-h-0 min-w-0 flex-1 touch-pan-y flex-col gap-4 overflow-x-hidden overflow-y-auto overscroll-y-contain p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] [-webkit-overflow-scrolling:touch] sm:p-4">
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="flex min-h-[72px] items-center gap-3 rounded-xl bg-foreground px-4 py-3 text-left text-background transition-opacity hover:opacity-90 active:scale-[0.99]"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background/10"><GuideCat size={22} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">Ask the portfolio guide</span>
                <span className="mt-0.5 block text-[12px] text-background/65">Projects, experience, or collaboration</span>
              </span>
              <span aria-hidden="true" className="text-lg">↗</span>
            </button>
          </SheetClose>

          <div className="flex items-center justify-between px-1 pt-1">
            <span className="font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground/70">Navigate</span>
            <span className="text-[11px] text-muted-foreground/60">{groups.reduce((count, group) => count + group.children.length, 0) + routes.length} destinations</span>
          </div>

          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1.5">
              <span className="px-2 pb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/60">
                {group.label}
              </span>
              <ul className="flex flex-col gap-0.5">
                {group.children.map((child) => {
                  const href = leafHref(child);
                  const ChildIcon = child.icon;
                  const selected = child.type === 'section' && active.sectionId === child.id;
                  return (
                      <li key={child.id}>
                      <SheetClose asChild>
                        <a
                          href={href}
                          className={`${linkClass} ${selected ? 'bg-secondary text-foreground' : ''}`}
                          aria-current={selected ? 'location' : undefined}
                          onClick={(e) => {
                            if (child.type === 'section' && pathname === '/') {
                              // Same-page jump through Lenis instead of the
                              // browser's abrupt hash jump.
                              e.preventDefault();
                              scrollToTarget(`#${child.targetId}`);
                            } else {
                              window.location.href = href;
                            }
                          }}
                        >
                          {ChildIcon && <ChildIcon className={`${iconClass} ${selected ? 'text-foreground' : ''}`} />}
                          <span className="min-w-0 flex-1">{child.label}</span>
                          {selected && <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />}
                        </a>
                      </SheetClose>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          <Separator className="my-1" />

          {routes.map((route) => {
            const RouteIcon = route.icon;
            return (
              <SheetClose key={route.id} asChild>
                <TransitionLink href={route.href} className={linkClass}>
                  {RouteIcon && <RouteIcon className={iconClass} />}
                  <span>{route.label}</span>
                </TransitionLink>
              </SheetClose>
            );
          })}

          <div className="mt-auto pt-2">
            <Separator className="my-1" />
            <div className="flex items-center justify-between px-2 pt-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground/65">
                Elsewhere
              </span>
              <nav aria-label="Social links" className="flex items-center gap-1">
                {socialLinks.map((link) => {
                  const Icon = socialIcons[link.id];
                  return (
                    <a
                      key={link.id}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.label}
                      className="flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--geist-focus)]"
                    >
                      <Icon className="size-4" />
                    </a>
                  );
                })}
                <a
                  href={`mailto:${profile.email}`}
                  aria-label="Email"
                  className="flex size-10 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--geist-focus)]"
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
