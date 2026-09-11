'use client';

import { useEffect, useRef } from 'react';
import { useLenis } from 'lenis/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TransitionLink } from '@/features/transitions';
import {
  FiHeart,
  FiMail,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiExternalLink,
  FiArrowUp,
  SiDiscord,
} from '@/shared/ui/atoms/Icon';
import {
  footerNavLinks,
  footerSocialLinks,
  supportLink,
  brandName,
  brandTagline,
  email,
  kofiUrl,
  kofiImage,
  currentYear,
} from './lib/data';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function PremiumFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  useEffect(() => {
    const footer = footerRef.current;
    const inner = innerRef.current;
    if (!footer) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Footer stays in its natural layout slot the whole scroll — its bottom
      // edge is pinned to the page bottom. Depth comes from an upward
      // clip-path wipe plus a slight inner parallax, so no empty band can ever
      // appear below the footer during the scrub.
      gsap.fromTo(
        footer,
        { clipPath: 'inset(100% 0% 0% 0%)', opacity: 0.3 },
        {
          clipPath: 'inset(0% 0% 0% 0%)',
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: footer,
            start: 'top bottom',
            end: 'bottom bottom',
            scrub: 1,
          },
        },
      );

      // Inner content lags the slab slightly → adds a touch of parallax depth.
      if (inner) {
        gsap.fromTo(
          inner,
          { yPercent: 18 },
          {
            yPercent: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: footer,
              start: 'top bottom',
              end: 'bottom bottom',
              scrub: 1,
            },
          },
        );
      }
    }, footer);

    return () => ctx.revert();
  }, []);

  function handleBackToTop() {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <footer
      ref={footerRef}
      id="footer"
      role="contentinfo"
      className="relative z-[1] overflow-hidden border-t border-[var(--terminal-border)] bg-background"
    >
      <div
        ref={innerRef}
        className="relative mx-auto w-full max-w-[1400px] px-[4vw] pb-10 pt-20 max-[700px]:px-5 max-[700px]:pb-8 max-[700px]:pt-14"
      >
        {/*  Top: brand + back to top  */}
        <div className="mb-11 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-[0.45rem]">
            <span className="inline-flex items-center gap-[0.6rem] font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.02em] text-foreground">
              <span className="h-3 w-3 rounded-full bg-foreground shadow-[0_0_14px_color-mix(in_srgb,var(--text)_55%,transparent)]" aria-hidden="true" />
              {brandName}
            </span>
            <p className="m-0 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-[var(--text-ghost)]">
              {brandTagline}
            </p>
          </div>
          <button
            type="button"
            onClick={handleBackToTop}
            aria-label="Back to top"
            className="inline-flex items-center gap-[0.45rem] rounded-full border border-border bg-[var(--terminal-bar)] px-[0.9rem] py-[0.55rem] font-mono text-[0.6rem] uppercase tracking-[0.1em] text-[var(--text-ghost)] transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground hover:text-foreground"
          >
            <FiArrowUp aria-hidden="true" size={14} />
            <span>top</span>
          </button>
        </div>

        {/*  CTA: signature strip  */}
        <div className="flex items-center justify-between gap-6 pt-[1.6rem] pb-[1.9rem]">
          <p className="m-0 font-display text-[clamp(1.7rem,4.5vw,3rem)] font-extrabold leading-none tracking-[-0.03em] text-foreground">
            Let&apos;s build something.
          </p>
          <div className="flex flex-col items-end gap-2">
            <a
              href={`mailto:${email}`}
              className="group inline-flex items-center gap-[0.6rem] rounded-[var(--radius-md)] bg-foreground px-[1.4rem] py-[0.85rem] font-mono text-[0.68rem] uppercase tracking-[0.06em] text-background no-underline transition-opacity duration-200 hover:-translate-y-px hover:opacity-90"
            >
              <span>start a conversation</span>
              <FiArrowUp className="transition-transform duration-200 group-hover:rotate-45" aria-hidden="true" size={15} />
            </a>
            <span className="m-0 font-mono text-[0.6rem] tracking-[0.06em] text-[var(--text-ghost)]">
              replies in &lt; 24h
            </span>
          </div>
        </div>

        <div aria-hidden="true" className="h-px w-full bg-[var(--terminal-border)]" />

        {/*  Columns  */}
        <div className="py-[2.25rem]">
          <nav className="grid grid-cols-3 gap-8 max-[700px]:grid-cols-1 max-[700px]:gap-7" aria-label="Footer navigation">
            <div className="flex flex-col gap-[0.85rem]">
              <span className="border-b border-[var(--terminal-bar-border)] pb-[0.4rem] font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--text-ghost)]">
                Navigate
              </span>
              <ul className="m-0 flex list-none flex-col gap-[0.35rem] p-0">
                {footerNavLinks.map((link) => (
                  <li key={link.label}>
                    <TransitionLink
                      className="inline-block text-[0.82rem] text-muted-foreground no-underline transition-all duration-200 hover:translate-x-[3px] hover:text-foreground"
                      href={link.href}
                    >
                      {link.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-[0.85rem]">
              <span className="border-b border-[var(--terminal-bar-border)] pb-[0.4rem] font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--text-ghost)]">
                Elsewhere
              </span>
              <ul className="m-0 flex list-none flex-col gap-[0.35rem] p-0" role="list">
                {footerSocialLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="group inline-flex items-center gap-2 text-[0.82rem] text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground"
                      aria-label={link.label}
                    >
                      <span className="inline-flex h-[30px] w-[30px] items-center justify-center rounded-[var(--radius-sm)] border border-border bg-[var(--terminal-bar)] text-[var(--text-ghost)] transition-colors duration-200 group-hover:border-foreground group-hover:text-foreground" aria-hidden="true">
                        {link.label === 'GitHub' && <FiGithub size={16} />}
                        {link.label === 'Twitter/X' && <FiTwitter size={16} />}
                        {link.label === 'LinkedIn' && <FiLinkedin size={16} />}
                        {link.label === 'Discord' && <SiDiscord size={16} />}
                      </span>
                      <span>{link.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-[0.85rem]">
              <span className="border-b border-[var(--terminal-bar-border)] pb-[0.4rem] font-mono text-[0.58rem] uppercase tracking-[0.16em] text-[var(--text-ghost)]">
                Support
              </span>
              <div className="inline-flex items-center gap-2 self-start rounded-[var(--radius-sm)] border border-border bg-[var(--terminal-bar)] px-3 py-2">
                <FiMail className="shrink-0 text-[var(--text-ghost)]" size={14} aria-hidden="true" />
                <a href={`mailto:${email}`} className="font-mono text-[0.62rem] tracking-[0.02em] text-muted-foreground no-underline transition-colors duration-200 hover:text-foreground">
                  {email}
                </a>
              </div>
              <a
                href={kofiUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-[var(--terminal-bar)] px-[0.8rem] py-2 font-mono text-[0.6rem] tracking-[0.04em] text-[var(--text-secondary)] no-underline transition-colors duration-200 hover:border-foreground hover:text-foreground"
                aria-label="Support on Ko-fi"
              >
                <img
                  src={kofiImage}
                  alt=""
                  className="h-[22px] w-[22px] rounded object-contain"
                  loading="lazy"
                  aria-hidden="true"
                />
                <span>{supportLink.label}</span>
                <FiExternalLink aria-hidden="true" size={12} />
              </a>
            </div>
          </nav>
        </div>

        {/*  Legal  */}
        <div className="flex items-center justify-between gap-4 border-t border-[var(--terminal-border)] pt-[1.4rem]">
          <p className="m-0 inline-flex items-center gap-[0.45rem] font-mono text-[0.6rem] tracking-[0.06em] text-[var(--text-ghost)]">
            © {currentYear} {brandName}. Built with curiosity.
            <FiHeart aria-hidden="true" className="text-foreground" size={11} />
          </p>
          <span className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-[var(--text-ghost)]">
            dr.me / portfolio
          </span>
        </div>
      </div>
    </footer>
  );
}

export default PremiumFooter;