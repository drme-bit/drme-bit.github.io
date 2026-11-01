'use client';

import { TransitionLink } from '@/features/transitions';
import { usePathname } from 'next/navigation';
import { scrollToTarget } from '@/widgets/smooth-scrolling/lenisStore';
import { Menu } from '@/shared/ui/Icon';
import { useChat } from '@/app/providers/ChatProvider';
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
  'flex min-h-10 items-center gap-2.5 rounded-md px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground';
const iconClass = 'size-4 shrink-0 text-accent';
const socialIcons = { github: FiGithub, linkedin: FiLinkedin, discord: SiDiscord } as const;

export function MobileNav() {
  const groups = GLOBAL_NAV.filter((item): item is NavGroup => item.type === 'group');
  const routes = GLOBAL_NAV.filter((item): item is NavRouteLink => item.type === 'route');
  const pathname = usePathname();
  const { setOpen: setChatOpen } = useChat();

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
        className="!top-[64px] !right-[52px] !bottom-2 !left-auto !h-auto !w-[min(360px,calc(100vw-64px))] !max-w-none gap-0 rounded-xl border border-border bg-background p-0 shadow-2xl"
        showClose={false}
        side="right"
      >
        <div className="flex min-h-[58px] items-center justify-between border-b border-border px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] font-medium tracking-[-0.01em] text-foreground">drme_</span>
            <span className="text-[11px] text-muted-foreground">Navigate the portfolio</span>
          </div>
          <SheetClose asChild>
            <IconButton
              size="icon-sm"
              aria-label="Close menu"
              className="text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <span className="text-xs">✕</span>
            </IconButton>
          </SheetClose>
        </div>

        <div className="flex flex-1 flex-col gap-3 overflow-y-auto overscroll-contain p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]">
          <SheetClose asChild>
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className={linkClass}
            >
              <GuideCat size={16} />
              <span>Ask AI</span>
            </button>
          </SheetClose>

          <Separator className="my-1" />

          {groups.map((group) => (
            <div key={group.id} className="flex flex-col gap-1">
              <span className="px-2 pb-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground/60">
                {group.label}
              </span>
              <ul className="flex flex-col gap-0.5">
                {group.children.map((child) => {
                  const href = leafHref(child);
                  const ChildIcon = child.icon;
                  return (
                      <li key={child.id}>
                      <SheetClose asChild>
                        <a
                          href={href}
                          className={linkClass}
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
                          {ChildIcon && <ChildIcon className={iconClass} />}
                          <span>{child.label}</span>
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
