'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { TransitionLink } from '@/features/transitions';
import { scrollToTop } from '@/widgets/smooth-scrolling/lenisStore';
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiArrowUp,
  SiDiscord,
  GoHeartFill
} from '@/shared/ui/Icon';

import {
  footerNavLinks,
  footerSocialLinks,
  brandName,
  currentYear,
} from './lib/data';

/*  Minimal status-bar footer: wordmark, sitemap, local time, bare icons, top.  */

const SOCIAL_ICONS: Record<string, typeof FiGithub> = {
  GitHub: FiGithub,
  'Twitter/X': FiTwitter,
  Twitter: FiTwitter,
  LinkedIn: FiLinkedin,
  Discord: SiDiscord,
};

function OdesaClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = () =>
      new Date().toLocaleTimeString('en-GB', {
        timeZone: 'Europe/Kyiv',
        hour: '2-digit',
        minute: '2-digit',
      });
    setTime(format());
    const id = setInterval(() => setTime(format()), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span aria-label={time ? `Local time in Odesa, ${time}` : 'Local time in Odesa'}>
      Odesa {time ?? '––:––'}
    </span>
  );
}

export function Footer() {
  useEffect(() => {
    const footer = document.getElementById('footer');
    const trigger = document.getElementById('footer-reveal-trigger');
    if (!footer || !trigger) return;

    let frame = 0;
    const updateReveal = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const start = trigger.getBoundingClientRect().top;
        const distance = Math.max(1, footer.getBoundingClientRect().height);
        const progress = Math.max(0, Math.min(1, (window.innerHeight - start) / distance));
        footer.style.opacity = String(progress);
        footer.style.transform = `translateY(${(1 - progress) * 24}px)`;
      });
    };

    updateReveal();
    window.addEventListener('scroll', updateReveal, { passive: true });
    window.addEventListener('resize', updateReveal);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', updateReveal);
      window.removeEventListener('resize', updateReveal);
    };
  }, []);

  return (
    <footer
      id="footer"
      role="contentinfo"
      className="fixed inset-x-0 bottom-0 z-0 min-h-[340px] overflow-hidden bg-[var(--bg)] max-[700px]:min-h-[240px] xl:inset-x-auto xl:left-0 xl:right-[var(--workspace-reserved-right)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden whitespace-nowrap font-display text-[clamp(9rem,28vw,26rem)] font-semibold leading-none tracking-[-0.105em] text-[var(--text)] opacity-[0.05]"
      >
        drme
      </span>
      <div className="footer-inner relative z-10 mx-auto flex min-h-[340px] w-full max-w-[1400px] flex-wrap items-end gap-x-6 gap-y-3 px-[4vw] pb-6 pt-28 max-[700px]:min-h-[240px] max-[700px]:gap-x-4 max-[700px]:gap-y-2 max-[700px]:px-5 max-[700px]:pb-5 max-[700px]:pt-20">
        <Link
          href="/"
          aria-label="Back to home"
          className="font-mono text-[13px] font-semibold lowercase tracking-[0.14em] text-[var(--text)] no-underline transition-opacity hover:opacity-80"
        >
          drme<span className="text-accent">_</span>
        </Link>

        <span aria-hidden="true" className="h-4 w-px bg-[var(--border)]" />

        <span className="font-mono text-[11px] tracking-[0.06em] text-[var(--text-dim)]">
          © {currentYear} {brandName}
        </span>

        <span aria-hidden="true" className="h-4 w-px bg-[var(--border)]" />

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
            Build with <GoHeartFill /> by drme
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

          <span aria-hidden="true" className="h-4 w-px bg-[var(--border)]" />

          <span className="font-mono text-[11px] tracking-[0.06em] text-[var(--text-dim)]">
            <OdesaClock />
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
