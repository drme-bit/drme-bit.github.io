'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { FiHeart, FiMail, FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiExternalLink } from '@/shared/ui/atoms/Icon';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PremiumFooter.module.scss';

gsap.registerPlugin(ScrollTrigger);

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

const socialLinks: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/drme-bit', external: true },
  { label: 'Twitter/X', href: 'https://twitter.com/drme_bit', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/vyacheslav-tkachik', external: true },
  { label: 'Instagram', href: 'https://instagram.com/drme_bit', external: true },
];

const navLinks: FooterLink[] = [
  { label: 'Stats', href: '/stats' },
  { label: 'Blog', href: '/posts' },
  { label: 'Projects', href: '/projects' },
];

export function PremiumFooter() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Footer slides up from below (yPercent: 100 → 0) as it scrolls into view
  useGSAP(() => {
    const wrapper = wrapperRef.current;
    const footer = footerRef.current;
    if (!wrapper || !footer) return;

    const ctx = gsap.context(() => {
      // Footer slides up from below viewport
      gsap.fromTo(wrapper,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top bottom',
            end: 'top top',
            scrub: 0.3,
          },
        }
      );

      // Fade in footer content as it reveals
      gsap.fromTo(footer.querySelectorAll('.footer-row'),
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 95%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(footer.querySelectorAll('.social-icon'),
        { opacity: 0, scale: 0.8, rotation: -8 },
        {
          opacity: 1,
          scale: 1,
          rotation: 0,
          duration: 0.4,
          stagger: 0.04,
          ease: 'back.out(1.3)',
          scrollTrigger: {
            trigger: footer,
            start: 'top 92%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, wrapperRef);

    return () => ctx.revert();
  }, { scope: wrapperRef, revertOnUpdate: true });

  return (
    <div ref={wrapperRef} className={styles.wrapper}>
      <footer
        ref={footerRef}
        id="footer"
        className={styles.footer}
        role="contentinfo"
      >
        <div className={styles.footerBg} aria-hidden="true" />
        <div className={styles.footerInner}>
          <div className={`${styles.footerTop} ${styles.footerRow}`}>
            <div className={styles.footerBrand}>
              <span className={styles.footerLogo}>
                <span className={styles.logoDot} aria-hidden="true" />
                drme
              </span>
              <p className={styles.footerTagline}>
                Building things that matter. Open to interesting projects.
              </p>
            </div>

            <div className={styles.footerContact}>
              <a
                href="mailto:hello@drme.dev"
                className={styles.contactLink}
                aria-label="Email me"
              >
                <FiMail size={16} aria-hidden="true" />
                <span>hello@drme.dev</span>
                <FiExternalLink size={12} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className={`${styles.footerDivide} ${styles.footerRow}`} aria-hidden="true" />

          <div className={`${styles.footerBottom} ${styles.footerRow}`}>
            <nav className={styles.footerNav} aria-label="Footer navigation">
              <div className={styles.navColumn}>
                <span className={styles.navTitle}>Navigate</span>
                <ul className={styles.navList}>
                  {navLinks.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className={styles.navLink}
                        prefetch={false}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.navColumn}>
                <span className={styles.navTitle}>Connect</span>
                <ul className={styles.socialList} role="list">
                  {socialLinks.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target={link.external ? '_blank' : undefined}
                        rel={link.external ? 'noopener noreferrer' : undefined}
                        className={styles.socialLink}
                        aria-label={link.label}
                      >
                        <span className={`${styles.socialIcon} ${styles.footerRow}`} aria-hidden="true">
                          {link.label === 'GitHub' && <FiGithub size={16} />}
                          {link.label === 'Twitter/X' && <FiTwitter size={16} />}
                          {link.label === 'LinkedIn' && <FiLinkedin size={16} />}
                          {link.label === 'Instagram' && <FiInstagram size={16} />}
                        </span>
                        <span className={styles.socialLabel}>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <div className={styles.footerSupport}>
              <a
                href="https://ko-fi.com/drmebit"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.kofiBtn}
                aria-label="Support on Ko-fi"
              >
                <img
                  src="https://storage.ko-fi.com/cdn/kratom2/logo/normal-NoshandBG-transparent.png"
                  alt=""
                  className={styles.kofiImg}
                  loading="lazy"
                  aria-hidden="true"
                />
                <span>Buy me a coffee</span>
                <FiExternalLink size={12} aria-hidden="true" />
              </a>
              <p className={styles.copyright}>
                <FiHeart size={10} className={styles.heart} aria-hidden="true" />
                {new Date().getFullYear()} drme. Built with curiosity.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default PremiumFooter;