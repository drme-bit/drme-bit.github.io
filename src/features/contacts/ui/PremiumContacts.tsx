'use client';

import { useRef, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FiSend,
  FiMail,
  FiLoader,
  FiCheck,
  FiX,
  FiExternalLink,
  FiCopy,
  FiCalendar,
  FiPhone,
  FiMapPin,
  FiGithub,
  FiTwitter,
  FiLinkedin,
  SiDiscord,
  FiAlertCircle,
} from '@/shared/ui/atoms/Icon';
import { useContactForm } from '../hooks/useContactForm';
import type { ContactFormData } from '../model/contacts';
import { fieldConfigs, contactItems, socialLinks } from '@/entities/contact';

gsap.registerPlugin(ScrollTrigger);

// Inverted light band: white background, black elements, no gradients.
const SECTION_TOKENS = [
  '[--bg:#ffffff]',
  '[--bg-surface:#f6f6f4]',
  '[--text:#101010]',
  '[--text-dim:#484844]',
  '[--text-ghost:#8c8c86]',
  '[--border:#e4e2dd]',
  '[--terminal-border:#e4e2dd]',
  '[--terminal-bar:#faf9f7]',
  '[--terminal-bar-border:rgba(10,10,10,0.08)]',
  '[--glass:rgba(10,10,10,0.05)]',
  '[--glass-hover:rgba(10,10,10,0.09)]',
].join(' ');

const iconMap = {
  calendar: FiCalendar,
  mail: FiMail,
  phone: FiPhone,
  mapPin: FiMapPin,
  github: FiGithub,
  twitter: FiTwitter,
  linkedin: FiLinkedin,
  discord: SiDiscord,
} as const;

/*  Form Field ─ */

function FormField({
  config, value, error, touched, onChange, onBlur,
}: {
  config: typeof fieldConfigs[0];
  value: string;
  error?: string;
  touched?: boolean;
  onChange: (name: keyof ContactFormData, value: string) => void;
  onBlur: (name: keyof ContactFormData) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(config.name, e.target.value);
  };

  const isError = Boolean(error && touched);

  const inputBase = [
    'w-full resize-y rounded-[var(--radius-sm)] border bg-background px-[0.85rem] py-[0.7rem] font-inherit text-[0.82rem] text-foreground transition-[border-color,box-shadow] duration-200 placeholder:text-[var(--text-ghost)] focus:border-[var(--accent-secondary)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-secondary)_15%,transparent)] focus:outline-none',
    isError ? 'border-[var(--accent-danger)]' : 'border-border',
  ].join(' ');

  return (
    <div className="relative flex flex-col gap-[0.4rem]" data-field={config.name}>
      <label className="font-mono text-[0.6rem] uppercase tracking-[0.12em] text-[var(--text-ghost)]" htmlFor={config.name}>
        {config.label}
        {config.required && <span className="ml-[0.2rem] text-[var(--accent-secondary)]" aria-hidden="true">*</span>}
      </label>

      {config.type === 'textarea' ? (
        <textarea
          id={config.name}
          name={config.name}
          className={`${inputBase} min-h-[120px] leading-[1.55]`}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => { setIsFocused(false); onBlur(config.name); }}
          placeholder={config.placeholder}
          rows={5}
          maxLength={config.maxLength}
          aria-invalid={isError ? 'true' : 'false'}
          aria-describedby={isError ? `${config.name}-error` : undefined}
          aria-required={config.required}
        />
      ) : config.type === 'select' ? (
        <div className="relative">
          <select
            id={config.name}
            name={config.name}
            className={`${inputBase} cursor-pointer appearance-none`}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => { setIsFocused(false); onBlur(config.name); }}
            aria-invalid={isError ? 'true' : 'false'}
            aria-describedby={isError ? `${config.name}-error` : undefined}
            aria-required={config.required}
          >
            <option value="" disabled>{config.placeholder}</option>
            {config.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-[0.85rem] top-1/2 -translate-y-1/2 text-[0.7rem] text-[var(--text-ghost)]" aria-hidden="true">▾</span>
        </div>
      ) : (
        <input
          id={config.name}
          name={config.name}
          type={config.type}
          className={inputBase}
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => { setIsFocused(false); onBlur(config.name); }}
          placeholder={config.placeholder}
          maxLength={config.maxLength}
          aria-invalid={isError ? 'true' : 'false'}
          aria-describedby={isError ? `${config.name}-error` : undefined}
          aria-required={config.required}
        />
      )}

      {config.maxLength && config.type !== 'select' && (
        <div
          className={`pointer-events-none absolute bottom-[0.45rem] font-mono text-[0.52rem] text-[var(--text-ghost)] ${
            config.type === 'textarea' ? 'right-[0.85rem]' : 'right-[0.7rem]'
          }`}
          aria-hidden="true"
        >
          {value.length} / {config.maxLength}
        </div>
      )}

      {isError && (
        <p id={`${config.name}-error`} className="m-0 flex items-center gap-[0.35rem] text-[0.68rem] text-[var(--accent-danger)]" role="alert">
          <FiX size={10} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/*  Contact Form ── */

function ContactForm() {
  const { submit, isSubmitting, isSuccess, error, reset } = useContactForm();

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: 'general',
    message: '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof ContactFormData, boolean>>>({});
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormData, string>>>({});
  const formRef = useRef<HTMLFormElement>(null);

  const validateField = useCallback((name: keyof ContactFormData, val: string): string | undefined => {
    const config = fieldConfigs.find((f) => f.name === name);
    if (!config) return undefined;
    if (config.required && !val.trim()) return `${config.label} is required`;
    if (name === 'email' && val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address';
    if (config.maxLength && val.length > config.maxLength) return `${config.label} must be ${config.maxLength} characters or less`;
    return undefined;
  }, []);

  const handleChange = useCallback((name: keyof ContactFormData, val: string) => {
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (touched[name]) {
      setErrors((prev) => ({ ...prev, [name]: validateField(name, val) }));
    }
  }, [touched, validateField]);

  const handleBlur = useCallback((name: keyof ContactFormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, formData[name]) }));
  }, [formData, validateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<Record<keyof ContactFormData, string>> = {};
    let hasErrors = false;
    fieldConfigs.forEach((config) => {
      const err = validateField(config.name, formData[config.name]);
      if (err) { newErrors[config.name] = err; hasErrors = true; }
    });
    setTouched(fieldConfigs.reduce((acc, f) => ({ ...acc, [f.name]: true }), {}));
    setErrors(newErrors);
    if (hasErrors) {
      const first = fieldConfigs.find((f) => newErrors[f.name]);
      first && (document.querySelector(`[data-field="${first.name}"] input, [data-field="${first.name}"] textarea, [data-field="${first.name}"] select`) as HTMLElement)?.focus();
      return;
    }
    await submit(formData);
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', subject: 'general', message: '' });
    setTouched({});
    setErrors({});
    reset();
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-start gap-[0.6rem] rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--accent-success)_35%,transparent)] bg-[var(--terminal-bar)] p-10" role="status" aria-live="polite">
        <FiCheck className="text-[var(--accent-success)]" size={34} />
        <h3 className="m-0 font-display text-[1.4rem] font-bold text-foreground">Message sent</h3>
        <p className="m-0 max-w-[42ch] text-[0.82rem] leading-[1.55] text-muted-foreground">
          Thanks for reaching out — I&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={handleReset}
          type="button"
          className="mt-2 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--terminal-bar-border)] bg-transparent px-4 py-[0.55rem] font-mono text-[0.64rem] tracking-[0.04em] text-[var(--text-secondary)] transition-colors duration-200 hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
        >
          <FiSend size={13} aria-hidden="true" />
          send another
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-[1.1rem]" noValidate>
      <div className="flex flex-col gap-4" role="group" aria-labelledby="form-title">
        <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
          <FormField config={fieldConfigs[0]} value={formData.name} error={errors.name} touched={touched.name} onChange={handleChange} onBlur={handleBlur} />
          <FormField config={fieldConfigs[1]} value={formData.email} error={errors.email} touched={touched.email} onChange={handleChange} onBlur={handleBlur} />
        </div>
        <FormField config={fieldConfigs[2]} value={formData.subject} error={errors.subject} touched={touched.subject} onChange={handleChange} onBlur={handleBlur} />
        <FormField config={fieldConfigs[3]} value={formData.message} error={errors.message} touched={touched.message} onChange={handleChange} onBlur={handleBlur} />
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--accent-danger)_30%,transparent)] bg-[color-mix(in_srgb,var(--accent-danger)_10%,transparent)] px-[0.8rem] py-[0.55rem] text-[0.75rem] text-[var(--accent-danger)]" role="alert">
          <FiAlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        className="group inline-flex cursor-pointer items-center justify-center gap-[0.6rem] self-start rounded-[var(--radius-md)] border-none bg-[var(--accent-secondary)] px-6 py-[0.8rem] font-mono text-[0.68rem] uppercase tracking-[0.06em] text-[#02120f] transition-[filter,transform] duration-200 hover:-translate-y-px hover:brightness-110 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-55"
        disabled={isSubmitting}
        aria-busy={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="inline-flex items-center justify-center" aria-hidden="true">
              <FiLoader size={16} className="animate-spin" />
            </span>
            <span>sending…</span>
          </>
        ) : (
          <>
            <span>send message</span>
            <FiSend size={15} className="transition-transform duration-200 group-hover:-rotate-45 group-hover:translate-x-0.5" aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}

/*  Direct lines ── */

function Line({ item }: { item: typeof contactItems[0] }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!item.copyText) return;
    try { await navigator.clipboard.writeText(item.copyText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  }, [item.copyText]);

  const IconComponent = iconMap[item.icon];

  return (
    <article className="flex items-center gap-[0.85rem] border-t border-[var(--terminal-bar-border)] py-[0.7rem] first:border-t-0">
      <span className="inline-flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[color-mix(in_srgb,var(--accent-secondary)_22%,transparent)] bg-[color-mix(in_srgb,var(--accent-secondary)_10%,transparent)] text-[var(--accent-secondary)]" aria-hidden="true">
        <IconComponent size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="m-0 font-display text-[0.9rem] font-semibold leading-[1.2] text-foreground">{item.title}</h3>
        <p className="m-[0.15rem_0_0] truncate text-[0.7rem] text-muted-foreground">{item.subtitle}</p>
      </div>
      {item.href && (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 cursor-pointer items-center gap-[0.35rem] rounded-[var(--radius-sm)] border border-[var(--terminal-bar-border)] bg-transparent px-[0.6rem] py-[0.38rem] font-mono text-[0.6rem] uppercase tracking-[0.05em] text-[var(--text-ghost)] no-underline transition-colors duration-200 hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]" aria-label={`${item.actionLabel || 'Open'} — ${item.title}`}>
          <span>{item.actionLabel || 'open'}</span>
          <FiExternalLink size={11} aria-hidden="true" />
        </a>
      )}
      {item.copyText && !item.href && (
        <button
          onClick={handleCopy}
          className="inline-flex shrink-0 cursor-pointer items-center gap-[0.35rem] rounded-[var(--radius-sm)] border border-[var(--terminal-bar-border)] bg-transparent px-[0.6rem] py-[0.38rem] font-mono text-[0.6rem] uppercase tracking-[0.05em] text-[var(--text-ghost)] transition-colors duration-200 hover:border-[var(--accent-secondary)] hover:text-[var(--accent-secondary)]"
          aria-label={`Copy ${item.title.toLowerCase()}`}
          aria-pressed={copied}
        >
          {copied
            ? (<><FiCheck size={11} aria-hidden="true" /><span>copied</span></>)
            : (<><FiCopy size={11} aria-hidden="true" /><span>copy</span></>)}
        </button>
      )}
    </article>
  );
}

function Conduits() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-[var(--terminal-bar)] px-[1.6rem] py-6">
      <p className="m-0 mb-[0.9rem] font-mono text-[0.58rem] uppercase tracking-[0.15em] text-[var(--text-ghost)]">
        Direct lines
      </p>
      <div className="flex flex-col" role="list">
        {contactItems.map((item) => (
          <Line key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

/*  Elsewhere ── */

function Routes() {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-[var(--terminal-bar)] px-[1.6rem] py-6">
      <p className="m-0 mb-[0.9rem] font-mono text-[0.58rem] uppercase tracking-[0.15em] text-[var(--text-ghost)]">
        Elsewhere
      </p>
      <div className="grid grid-cols-2 gap-[0.4rem]" role="list">
        {socialLinks.map((link) => {
          const IconComponent = iconMap[link.icon];
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-[var(--radius-sm)] border border-border bg-background px-[0.6rem] py-[0.55rem] text-[0.72rem] text-muted-foreground no-underline transition-all duration-200 hover:-translate-y-px hover:border-[color-mix(in_srgb,var(--accent-secondary)_45%,transparent)] hover:text-[var(--accent-secondary)]"
              aria-label={link.label}
            >
              <span className="inline-flex text-[var(--text-ghost)] transition-colors duration-200 group-hover:text-[var(--accent-secondary)]" aria-hidden="true">
                <IconComponent size={14} />
              </span>
              <span className="min-w-0 truncate">{link.label}</span>
              <span className="ml-auto text-[var(--text-ghost)] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">→</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/*  Main Component  */

export function PremiumContacts() {
  const sectionRef = useRef<HTMLElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      const cols = [
        sectionRef.current?.querySelector('[data-col="form"]'),
        sectionRef.current?.querySelector('[data-col="info"]'),
        sectionRef.current?.querySelector('[data-reveal="lead"]'),
      ];
      cols.forEach((el, i) => {
        if (el) {
          gsap.fromTo(el,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.6, delay: i * 0.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: innerRef.current, start: 'top 65%', toggleActions: 'play none none reverse' },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef, revertOnUpdate: true });

  return (
    <section id="contact" ref={sectionRef} className={`relative z-10 border-t border-[#e4e2dd] bg-white ${SECTION_TOKENS}`}>
      <div ref={innerRef} className="relative mx-auto w-full max-w-[1400px] px-[4vw] py-24 max-[700px]:px-5 max-[700px]:py-16">
        <header className="mb-[1.1rem] flex flex-col gap-[0.4rem] max-[700px]:mb-[0.9rem]">
          <span className="font-mono text-[0.55rem] uppercase tracking-[0.15em] text-[var(--text-ghost)]">
            // open channel
          </span>
          <h2 className="m-0 font-display text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold leading-none tracking-[-0.03em] text-foreground">
            Contact
          </h2>
          <p className="m-0 font-mono text-[0.7rem] lowercase tracking-[0.1em] text-muted-foreground">
            drop a line — one message, one reply.
          </p>
        </header>

        <p data-reveal="lead" className="mb-12 max-w-[52ch] font-mono text-[0.78rem] leading-[1.7] text-muted-foreground max-[700px]:mb-9">
          Tell me about a project, a role, or a thought worth crossing oceans for. I read
          everything and reply to most of it — usually within 24 hours.
        </p>

        <div className="grid grid-cols-[minmax(0,7fr)_minmax(320px,5fr)] items-start gap-x-16 gap-y-12 max-[980px]:grid-cols-1 max-[980px]:gap-y-12">
          <div data-col="form" className="min-w-0">
            <ContactForm />
          </div>

          <aside data-col="info" className="flex min-w-0 flex-col gap-5">
            <div className="flex items-center gap-[0.6rem] rounded-[var(--radius-md)] border border-border bg-[var(--terminal-bar)] px-4 py-[0.8rem] font-mono text-[0.62rem] uppercase tracking-[0.08em] text-[var(--text-secondary)]">
              <span className="h-2 w-2 animate-status-pulse rounded-full bg-[var(--accent-success)]" aria-hidden="true" />
              <span>available for work</span>
              <span className="ml-auto normal-case tracking-[0.04em] text-[var(--text-ghost)]">replies &lt; 24h</span>
            </div>
            <Conduits />
            <Routes />
          </aside>
        </div>
      </div>
    </section>
  );
}

export default PremiumContacts;