import { useState, useRef, useCallback } from 'react';
import {
  FiMail, FiLinkedin, FiPhone, FiFileText,
  FiGithub, FiSend, FiMessageSquare,
  FiArrowUpRight, FiCheck,
} from 'react-icons/fi';
import useReveal from '@/hooks/useReveal';
import useCursorParallax from '@/hooks/useCursorParallax';
import SectionHeader from '@/components/ui/SectionHeader/SectionHeader';
import './Contacts.scss';

/* ------------------------------------------------------------------ */
/*  Data                                                              */
/* ------------------------------------------------------------------ */

const ICON = {
  email: FiMail,
  linkedin: FiLinkedin,
  phone: FiPhone,
  resume: FiFileText,
  github: FiGithub,
  telegram: FiSend,
  discord: FiMessageSquare,
};

const CONTACTS = [
  { id: 'email', label: 'email', value: 'vacheslavtkachik@gmail.com', href: 'mailto:vacheslavtkachik@gmail.com', color: '#7dd3fc' },
  { id: 'linkedin', label: 'linkedin', value: 'vacheslavtkachik', href: 'https://www.linkedin.com/in/vyacheslav-tkachik-2a3b8a277', external: true, color: '#a78bfa' },
  { id: 'phone', label: 'phone', value: '+380 96 004 5028', href: 'tel:+380960045028', color: '#34d399' },
  { id: 'github', label: 'github', value: 'drme-bit', href: 'https://github.com/drme-bit', external: true, color: '#f472b6' },
  { id: 'telegram', label: 'telegram', value: '@drme_bit', href: 'https://t.me/drmebit', external: true, color: '#60a5fa' },
  { id: 'discord', label: 'discord', value: 'Dr.ME', href: 'https://discord.gg/389417490809225216', external: true, color: '#c084fc' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

async function copyToClipboard(text) {
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

/* ------------------------------------------------------------------ */
/*  BentoCard — reusable glass card with glow                         */
/* ------------------------------------------------------------------ */

function BentoCard({ children, className = '', style, as: Tag = 'div', ...props }) {
  return (
    <Tag className={`bento-card ${className}`} style={style} {...props}>
      {children}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  ContactCard — single contact in a bento card                      */
/* ------------------------------------------------------------------ */

function ContactCard({ contact }) {
  const Icon = ICON[contact.label];

  return (
    <a
      href={contact.href}
      target={contact.external ? '_blank' : undefined}
      rel={contact.external ? 'noopener noreferrer' : undefined}
      className="bento-card bento-contact"
      style={{ '--card-color': contact.color }}
    >
      <div className="bento-contact-icon">
        <Icon />
      </div>
      <div className="bento-contact-info">
        <span className="bento-contact-label">{contact.label}</span>
        <span className="bento-contact-value">{contact.value}</span>
      </div>
      <span className="bento-contact-arrow">
        <FiArrowUpRight />
      </span>
      <div className="bento-contact-glow" />
    </a>
  );
}

/* ------------------------------------------------------------------ */
/*  ContactForm — glass form in a bento card                          */
/* ------------------------------------------------------------------ */

function ContactForm() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;
    const subj = encodeURIComponent(`Message from ${name.trim()}`);
    const body = encodeURIComponent(`${message.trim()}\n\n— ${name.trim()}`);
    window.location.href = `mailto:vacheslavtkachik@gmail.com?subject=${subj}&body=${body}`;
  };

  return (
    <form className="bento-card bento-form" onSubmit={handleSubmit}>
      <h3 className="bento-form-title">
        <span className="bento-form-prompt">$</span> send_message
      </h3>

      <label className="bento-field">
        <span className="bento-field-label">name</span>
        <input
          type="text"
          className="bento-input"
          placeholder="your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="bento-field">
        <span className="bento-field-label">message</span>
        <textarea
          className="bento-input bento-textarea"
          placeholder="what's on your mind?"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="bento-submit">
        send <FiArrowUpRight />
      </button>

      <p className="bento-form-hint">
        opens your email client · or write directly to{' '}
        <a href="mailto:vacheslavtkachik@gmail.com" className="bento-form-email">
          vacheslavtkachik@gmail.com
        </a>
      </p>
    </form>
  );
}

/* ------------------------------------------------------------------ */
/*  Contacts section                                                  */
/* ------------------------------------------------------------------ */

export default function Contacts() {
  const [ref, visible] = useReveal();
  const { x, y } = useCursorParallax();

  return (
    <section id="contact" ref={ref} className={`section reveal${visible ? ' is-visible' : ''}`}>
      <SectionHeader title="contact" number="05" visible={visible} />

      <div
        className="section-inner"
        style={{ transform: `translate(${x * 4}px, ${y * 3}px)` }}
      >
        <div className="contact-bento">
          {/* CTA Card — spans 2 cols, 2 rows */}
          <BentoCard className="bento-cta">
            <span className="bento-cta-tag">available for work</span>
            <h2 className="bento-cta-title">
              Let's build<br />
              <span className="bento-cta-accent">something great</span>
            </h2>
            <p className="bento-cta-sub">
              based in ukraine · freelance & collaboration
            </p>
          </BentoCard>

          {/* Contact cards */}
          {CONTACTS.map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}

          {/* Form — spans 2 cols, 2 rows */}
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
