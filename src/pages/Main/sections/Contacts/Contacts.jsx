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

const GROUPS = [
  {
    id: 'business',
    label: 'business',
    items: [
      { kind: 'link', label: 'email', value: 'vacheslavtkachik@gmail.com', href: 'mailto:vacheslavtkachik@gmail.com' },
      { kind: 'link', label: 'linkedin', value: 'vacheslavtkachik', href: 'https://www.linkedin.com/in/vyacheslav-tkachik-2a3b8a277', external: true },
      { kind: 'link', label: 'phone', value: '+380 96 004 5028', href: 'tel:+380960045028' },
      { kind: 'link', label: 'resume', value: 'download.pdf', href: '#', disabled: true },
    ],
  },
  {
    id: 'social',
    label: 'social',
    items: [
      { kind: 'link', label: 'github', value: 'drme-bit', href: 'https://github.com/drme-bit', external: true },
      { kind: 'link', label: 'telegram', value: '@drme_bit', href: 'https://t.me/drmebit', external: true },
      { kind: 'link', label: 'discord', value: 'Dr.ME', href: 'https://discord.gg/389417490809225216', external: true },
    ],
  },
];

const COPY_DURATION = 1500;

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
/*  ContactItem — renders a single link or copy button               */
/* ------------------------------------------------------------------ */

function ContactItem({ item }) {
  const Icon = ICON[item.label];

  if (item.kind === 'copy') {
    return <CopyItem item={item} Icon={Icon} />;
  }

  return (
    <a
      href={item.href}
      target={item.external ? '_blank' : undefined}
      rel={item.external ? 'noopener noreferrer' : undefined}
      className={`contact-item${item.disabled ? ' contact-item--disabled' : ''}`}
      tabIndex={item.disabled ? -1 : 0}
    >
      <span className="contact-item-icon"><Icon /></span>
      <span className="contact-item-label">{item.label}</span>
      <span className="contact-item-value">{item.value}</span>
      {!item.disabled && <span className="contact-item-arrow"><FiArrowUpRight /></span>}
    </a>
  );
}

function CopyItem({ item, Icon }) {
  const [copied, setCopied] = useState(false);
  const tRef = useRef(null);

  const handle = useCallback(async () => {
    const ok = await copyToClipboard(item.copyText);
    if (!ok) return;
    clearTimeout(tRef.current);
    setCopied(true);
    tRef.current = setTimeout(() => setCopied(false), COPY_DURATION);
  }, [item.copyText]);

  return (
    <button
      type="button"
      className="contact-item contact-item--copy"
      onClick={handle}
      aria-label={copied ? 'Copied to clipboard' : `Copy ${item.label}`}
    >
      <span className="contact-item-icon"><Icon /></span>
      <span className="contact-item-label">{item.label}</span>
      <span className="contact-item-value">{item.value}</span>
      <span className="contact-item-arrow">{copied ? <FiCheck /> : <FiArrowUpRight />}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  ContactForm — name + message, opens mailto on submit             */
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
    <form className="contact-form" onSubmit={handleSubmit}>
      <h3 className="contact-form-title">
        <span className="contact-form-prompt">$</span> send_message
      </h3>

      <label className="contact-field">
        <span className="contact-field-label">name</span>
        <input
          type="text"
          className="contact-input"
          placeholder="your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </label>

      <label className="contact-field">
        <span className="contact-field-label">message</span>
        <textarea
          className="contact-input contact-textarea"
          placeholder="what's on your mind?"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
      </label>

      <button type="submit" className="contact-submit">
        send <FiArrowUpRight />
      </button>

      <p className="contact-form-hint">
        opens your email client · or write directly to{' '}
        <a href="mailto:vacheslavtkachik@gmail.com" className="contact-form-email">
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
        <h2 className="section-title">
          Get in<span className="section-accent"> touch</span>
        </h2>

        <div className="contact-grid">
          <div className="contact-groups">
            {GROUPS.map((g) => (
              <div key={g.id} className="contact-group">
                <h3 className="contact-group-heading">
                  <span className="contact-group-bracket">[</span>
                  {g.label}
                  <span className="contact-group-bracket">]</span>
                </h3>
                <div className="contact-group-items">
                  {g.items.map((item) => (
                    <ContactItem key={item.label} item={item} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <ContactForm />
        </div>

        <p className="contact-footnote">
          based in ukraine · available for freelance and collaboration
        </p>
      </div>
    </section>
  );
}
