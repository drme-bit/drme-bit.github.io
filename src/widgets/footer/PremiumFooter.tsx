'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { TransitionLink } from '@/features/transitions';
import { scrollToTop } from '@/widgets/smooth-scrolling/lenisStore';
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiArrowUp,
  SiDiscord,
} from '@/shared/ui/Icon';
import {
  footerNavLinks,
  footerSocialLinks,
  brandName,
  currentYear,
} from './lib/data';

/*  Minimal status-bar footer (Linear/Railway/Supabase language):
    one quiet row — wordmark, sitemap, status, bare icons, top.
    No surfaces, no CTA, icons without boxes.  */

const SOCIAL_ICONS: Record<string, typeof FiGithub> = {
  GitHub: FiGithub,
  'Twitter/X': FiTwitter,
  Twitter: FiTwitter,
  LinkedIn: FiLinkedin,
  Discord: SiDiscord,
};

export function PremiumFooter() {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        // One-shot: re-hiding on scroll-back makes the bar flicker at
        // the threshold and replay the rise mid-scroll.
        if (entry.isIntersecting) {
          footer.classList.add('is-revealed');
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      id="footer"
      role="contentinfo"
      className="relative z-[0] border-t border-[var(--border)] bg-[var(--bg)]"
    >
      <div className="footer-inner mx-auto flex w-full max-w-[1400px] flex-wrap items-center gap-x-6 gap-y-3 px-[4vw] py-5 max-[700px]:px-5">
        <Link
          href="/"
          aria-label="Back to home"
          className="font-mono text-[13px] font-semibold lowercase tracking-[0.14em] text-foreground no-underline transition-opacity hover:opacity-80"
        >
          drme<span className="text-accent">_</span>
        </Link>
        <span className="font-mono text-[11px] tracking-[0.06em] text-[var(--text-dim)]">
          © {currentYear} {brandName}
        </span>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {footerNavLinks.map((link) => (
            <TransitionLink
              key={link.label}
              href={link.href}
              className="text-[12.5px] text-[var(--text-secondary)] no-underline transition-colors duration-200 hover:text-foreground"
            >
              {link.label}
            </TransitionLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-4 max-[700px]:ml-0">
          <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.04em] text-[var(--text-dim)]">
            <span className="size-1.5 rounded-full bg-[var(--accent-success)]" aria-hidden="true" />
            <OdesaClock />
          </span>

          <span aria-hidden="true" className="h-4 w-px bg-[var(--border)]" />

          <div className="flex items-center gap-3.5">
            {footerSocialLinks.map((link) => {
              const Icon = SOCIAL_ICONS[link.label] ?? FiGithub;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.external ? '_blank' : undefined}
                  rel={link.external ? 'noopener noreferrer' : undefined}
                  aria-label={link.label}
                  className="text-[var(--text-dim)] transition-colors duration-200 hover:text-foreground"
                >
                  <Icon size={15} aria-hidden="true" />
                </a>
              );
            })}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top"
            className="cursor-pointer text-[var(--text-dim)] transition-all duration-200 hover:-translate-y-px hover:text-foreground"
          >
            <FiArrowUp aria-hidden="true" size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}

function OdesaClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const time = now.toLocaleTimeString('en-GB', {
    timeZone: 'Europe/Kyiv',
    hour: '2-digit',
    minute: '2-digit',
  });
  return <span>Odesa — {time}</span>;
}

export default PremiumFooter;
