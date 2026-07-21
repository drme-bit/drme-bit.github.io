'use client';

import { useState } from 'react';
import {
  FiMail, FiLinkedin, FiPhone, FiFileText,
  FiGithub, FiSend, FiMessageSquare,
  FiArrowUpRight, FiCalendar, FiMapPin, FiCheck, FiCopy,
} from 'react-icons/fi';
import useReveal from '@/shared/hooks/useReveal';
import useCursorParallax from '@/shared/hooks/useCursorParallax';
import SectionTitle from '@/shared/ui/molecules/SectionTitle/SectionTitle';
import styles from './Contacts.module.scss';

/* ─── Types ──────────────────────────────────────────────── */

import type { IconType } from 'react-icons';

interface Contact {
  id: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  color: string;
}

/* ─── Data ───────────────────────────────────────────────── */

const ICON: Record<string, IconType> = {
  email: FiMail,
  linkedin: FiLinkedin,
  phone: FiPhone,
  github: FiGithub,
  telegram: FiSend,
  discord: FiMessageSquare,
};

const CONTACTS: Contact[] = [
  { id: 'email', label: 'email', value: 'vacheslavtkachik@gmail.com', href: 'mailto:vacheslavtkachik@gmail.com', color: '#7dd3fc' },
  { id: 'linkedin', label: 'linkedin', value: 'vacheslavtkachik', href: 'https://www.linkedin.com/in/vyacheslav-tkachik-2a3b8a277', external: true, color: '#a78bfa' },
  { id: 'phone', label: 'phone', value: '+380 96 004 5028', href: 'tel:+380960045028', color: '#34d399' },
  { id: 'github', label: 'github', value: 'drme-bit', href: 'https://github.com/drme-bit', external: true, color: '#f472b6' },
  { id: 'telegram', label: 'telegram', value: '@drme_bit', href: 'https://t.me/drmebit', external: true, color: '#60a5fa' },
  { id: 'discord', label: 'discord', value: 'Dr.ME', href: 'https://discord.gg/389417490809225216', external: true, color: '#c084fc' },
];

/* ─── Quick Links ────────────────────────────────────────── */

function QuickLinks() {
  return (
    <div className={`${styles['bento-card']} ${styles['bento-links']}`}>
      <h3 className={styles['bento-links-title']}>
        <span className={styles['bento-links-prompt']}>$</span> contact_methods
      </h3>
      <div className={styles['bento-links-list']}>
        {CONTACTS.map((c) => {
          const Icon = ICON[c.label];
          return (
            <a
              key={c.id}
              href={c.href}
              target={c.external ? '_blank' : undefined}
              rel={c.external ? 'noopener noreferrer' : undefined}
              className={styles['bento-links-row']}
              style={{ '--link-color': c.color } as React.CSSProperties}
            >
              <span className={styles['bento-links-icon']}>
                <Icon size={14} />
              </span>
              <span className={styles['bento-links-label']}>{c.label}</span>
              <span className={styles['bento-links-value']}>{c.value}</span>
              <span className={styles['bento-links-arrow']}>
                <FiArrowUpRight size={12} />
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Actions Card ───────────────────────────────────────── */

function ActionsCard() {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText('vacheslavtkachik@gmail.com');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = 'vacheslavtkachik@gmail.com';
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className={`${styles['bento-card']} ${styles['bento-actions']}`}>
      <h3 className={styles['bento-actions-title']}>
        <span className={styles['bento-actions-prompt']}>$</span> quick_actions
      </h3>
      <div className={styles['bento-actions-grid']}>
        <a
          href="https://calendly.com/vacheslavtkachik/30min"
          target="_blank"
          rel="noopener noreferrer"
          className={styles['bento-action-tile']}
          style={{ '--tile-color': '#7dd3fc' } as React.CSSProperties}
        >
          <FiCalendar size={16} />
          <span className={styles['bento-action-label']}>Schedule Meeting</span>
          <span className={styles['bento-action-detail']}>30 min · Calendly</span>
        </a>

        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className={styles['bento-action-tile']}
          style={{ '--tile-color': '#a78bfa' } as React.CSSProperties}
        >
          <FiFileText size={16} />
          <span className={styles['bento-action-label']}>Download Resume</span>
          <span className={styles['bento-action-detail']}>PDF · updated 2025</span>
        </a>

        <button
          type="button"
          onClick={copyEmail}
          className={styles['bento-action-tile']}
          style={{ '--tile-color': '#34d399' } as React.CSSProperties}
        >
          {copied ? <FiCheck size={16} /> : <FiCopy size={16} />}
          <span className={styles['bento-action-label']}>Open to</span>
          <span className={styles['bento-action-detail']}>
            {copied ? 'email copied!' : 'freelance · contract · full-time'}
          </span>
        </button>

        <a
          href="https://maps.google.com/?q=Kyiv,Ukraine"
          target="_blank"
          rel="noopener noreferrer"
          className={styles['bento-action-tile']}
          style={{ '--tile-color': '#f472b6' } as React.CSSProperties}
        >
          <FiMapPin size={16} />
          <span className={styles['bento-action-label']}>Location</span>
          <span className={styles['bento-action-detail']}>Kyiv, Ukraine · UTC+2</span>
        </a>
      </div>
    </div>
  );
}

/* ─── Contact Form ───────────────────────────────────────── */

function ContactForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const subj = encodeURIComponent(`Message from ${name.trim()}`);
    const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()}`);
    window.location.href = `mailto:vacheslavtkachik@gmail.com?subject=${subj}&body=${body}`;
  };

  return (
    <form className={`${styles['bento-card']} ${styles['bento-form']}`} onSubmit={handleSubmit}>
      <h3 className={styles['bento-form-title']}>
        <span className={styles['bento-form-prompt']}>$</span> send_message
      </h3>

      <label className={styles['bento-field']}>
        <span className={styles['bento-field-label']}>name</span>
        <input
          type="text"
          className={styles['bento-input']}
          placeholder="your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className={styles['bento-field']}>
        <span className={styles['bento-field-label']}>message</span>
        <textarea
          className={`${styles['bento-input']} ${styles['bento-textarea']}`}
          placeholder="what's on your mind?"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>

      <button type="submit" className={styles['bento-submit']}>
        send <FiArrowUpRight />
      </button>

      <p className={styles['bento-form-hint']}>
        opens your email client · or write directly to{' '}
        <a href="mailto:vacheslavtkachik@gmail.com" className={styles['bento-form-email']}>
          vacheslavtkachik@gmail.com
        </a>
      </p>
    </form>
  );
}

/* ─── Contacts ───────────────────────────────────────────── */

export default function Contacts() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  return (
    <section id="contact" ref={ref} className={`${styles.section} ${styles.reveal}${visible ? ` ${styles['is-visible']}` : ''}`}>
      <SectionTitle title="contact" accent="_" visible={visible} />

      <div
        className={styles['section-inner']}
        style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}
      >
        <div className={styles['contact-bento']}>
          {/* CTA Card */}
          <div className={`${styles['bento-card']} ${styles['bento-cta']}`}>
            <span className={styles['bento-cta-tag']}>available for work</span>
            <h2 className={styles['bento-cta-title']}>
              Let's build<br />
              <span className={styles['bento-cta-accent']}>something great</span>
            </h2>
            <p className={styles['bento-cta-sub']}>
              based in ukraine · freelance & collaboration
            </p>
          </div>

          {/* Quick Links */}
          <QuickLinks />

          {/* Actions */}
          <ActionsCard />

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
