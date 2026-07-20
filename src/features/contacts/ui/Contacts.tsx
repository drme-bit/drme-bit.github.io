'use client';

import { useState, useRef, useCallback } from 'react';
import {
  FiMail, FiLinkedin, FiPhone, FiFileText,
  FiGithub, FiSend, FiMessageSquare,
  FiArrowUpRight, FiCheck,
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

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/* ─── Data ───────────────────────────────────────────────── */

const ICON: Record<string, IconType> = {
  email: FiMail,
  linkedin: FiLinkedin,
  phone: FiPhone,
  resume: FiFileText,
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

/* ─── Helpers ────────────────────────────────────────────── */

async function copyToClipboard(text: string) {
  if (navigator.clipboard?.writeText) {
    try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  } catch { return false; }
}

/* ─── Sub-components ─────────────────────────────────────── */

function BentoCard({ children, className = '', style }: BentoCardProps) {
  return (
    <div className={`${styles['bento-card']} ${className}`} style={style}>
      {children}
    </div>
  );
}

function ContactCard({ contact }: { contact: Contact }) {
  const Icon = ICON[contact.label];

  return (
    <a
      href={contact.href}
      target={contact.external ? '_blank' : undefined}
      rel={contact.external ? 'noopener noreferrer' : undefined}
      className={`${styles['bento-card']} ${styles['bento-contact']}`}
      style={{ '--card-color': contact.color } as React.CSSProperties}
    >
      <div className={styles['bento-contact-icon']}>
        <Icon />
      </div>
      <div className={styles['bento-contact-info']}>
        <span className={styles['bento-contact-label']}>{contact.label}</span>
        <span className={styles['bento-contact-value']}>{contact.value}</span>
      </div>
      <span className={styles['bento-contact-arrow']}>
        <FiArrowUpRight />
      </span>
      <div className={styles['bento-contact-glow']} />
    </a>
  );
}

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
          <BentoCard className={styles['bento-cta']}>
            <span className={styles['bento-cta-tag']}>available for work</span>
            <h2 className={styles['bento-cta-title']}>
              Let's build<br />
              <span className={styles['bento-cta-accent']}>something great</span>
            </h2>
            <p className={styles['bento-cta-sub']}>
              based in ukraine · freelance & collaboration
            </p>
          </BentoCard>

          {/* Contact cards */}
          {CONTACTS.map((c: Contact) => (
            <ContactCard key={c.id} contact={c} />
          ))}

          {/* Form */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
