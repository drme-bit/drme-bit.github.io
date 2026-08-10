'use client';

import { useRef } from 'react';
import { useLenis } from 'lenis/react';
import { TransitionLink } from '@/features/transitions';
import {
  FiHeart,
  FiMail,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiArrowUp,
  SiDiscord,
  FiExternalLink,
} from '@/shared/ui/atoms/Icon';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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
import styles from './PremiumFooter.module.scss';

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function PremiumFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      const footer = footerRef.current;
      if (!footer || prefersReducedMotion()) return;

      const ctx = gsap.context(() => {
        const rows = footer.querySelectorAll(`.${styles.footerRow}`);
        if (rows.length) {
          gsap.fromTo(
            rows,
            { opacity: 0, y: 20 },
            {
              opacity: 1,
              y: 0,
              duration: 0.6,
              stagger: 0.08,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: footer,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }

        const icons = footer.querySelectorAll(`.${styles.socialIcon}`);
        if (icons.length) {
          gsap.fromTo(
            icons,
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
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            },
          );
        }
      }, footerRef);

      return () => ctx.revert();
    },
    { scope: footerRef },
  );

  function handleBackToTop() {
    if (lenis) {
      lenis.scrollTo(0, { duration: 1.2 });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  return (
    <footer ref={footerRef} id="footer" className={styles.footer} role="contentinfo">
      <div className={styles.footerBg} aria-hidden="true" />
      <div className={styles.footerInner}>
        <div className={`${styles.footerTop} ${styles.footerRow}`}>
          <div className={styles.footerBrand}>
            <span className={styles.footerLogo}>
              <span className={styles.logoDot} aria-hidden="true" />
              {brandName}
            </span>
            <p className={styles.footerTagline}>{brandTagline}</p>
          </div>

          <div className={styles.footerContact}>
            <a
              href={`mailto:${email}`}
              className={styles.contactLink}
              aria-label="Email me"
            >
              <FiMail aria-hidden="true" size={16} />
              <span>{email}</span>
              <FiExternalLink aria-hidden="true" size={12} />
            </a>
          </div>
        </div>

        <div className={`${styles.footerDivide} ${styles.footerRow}`} aria-hidden="true" />

        <div className={`${styles.footerBottom} ${styles.footerRow}`}>
          <nav className={styles.footerNav} aria-label="Footer navigation">
            <div className={styles.navColumn}>
              <span className={styles.navTitle}>Navigate</span>
              <ul className={styles.navList}>
                {footerNavLinks.map((link) => (
                  <li key={link.label}>
                    <TransitionLink className={styles.navLink} href={link.href}>
                      {link.label}
                    </TransitionLink>
                  </li>
                ))}
              </ul>
            </div>

            <div className={styles.navColumn}>
              <span className={styles.navTitle}>Connect</span>
              <ul className={styles.socialList} role="list">
                {footerSocialLinks.map((link) => (
                  <li key={link.label} className={styles.socialItem}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className={styles.socialLink}
                      aria-label={link.label}
                      title={link.label}
                    >
                      <span className={styles.socialIcon} aria-hidden="true">
                        {link.label === 'GitHub' && <FiGithub size={16} />}
                        {link.label === 'Twitter/X' && <FiTwitter size={16} />}
                        {link.label === 'LinkedIn' && <FiLinkedin size={16} />}
                        {link.label === 'Discord' && <SiDiscord size={16} />}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className={styles.footerSupport}>
            <a
              href={kofiUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.kofiBtn}
              aria-label="Support on Ko-fi"
            >
              <img
                src={kofiImage}
                alt=""
                className={styles.kofiImg}
                loading="lazy"
                aria-hidden="true"
              />
              <span>{supportLink.label}</span>
              <FiExternalLink aria-hidden="true" size={12} />
            </a>
            <p className={styles.copyright}>
              <FiHeart aria-hidden="true" className={styles.heart} size={10} />
              {currentYear} {brandName}. Built with curiosity.
            </p>
            <button
              type="button"
              className={styles.backToTop}
              onClick={handleBackToTop}
              aria-label="Back to top"
            >
              <FiArrowUp aria-hidden="true" size={14} />
              <span>top</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default PremiumFooter;
