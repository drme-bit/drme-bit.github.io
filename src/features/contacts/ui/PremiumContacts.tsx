'use client';

import { useRef, useState, useCallback } from 'react';
import { useInView } from '@/shared/hooks/useInView';
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
} from '@/shared/ui/Icon';
import { useContactForm } from '../model/useContactForm';
import type { ContactFormData } from '../model/contacts';
import { fieldConfigs, contactItems, socialLinks } from '@/entities/contact';

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(config.name, e.target.value);
  };

  const isError = Boolean(error && touched);

  const inputBase = [
    'w-full resize-y rounded-md border bg-[var(--bg-elevated)] px-3 py-[0.72rem] font-sans text-[0.88rem] text-[var(--text)] transition-[border-color,box-shadow,background-color] duration-200 placeholder:text-[var(--text-ghost)] focus:border-[var(--text-dim)] focus:bg-[var(--bg)] focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--text)_8%,transparent)] focus:outline-none',
    isError ? 'border-[var(--accent-danger)]' : 'border-[var(--border)]',
  ].join(' ');

  return (
    <div className="relative flex flex-col gap-[0.4rem]" data-field={config.name}>
      <label className="text-[0.8rem] font-medium text-[var(--text-secondary)]" htmlFor={config.name}>
        {config.label}
        {config.required && <span className="ml-[0.2rem] text-[var(--accent-secondary)]" aria-hidden="true">*</span>}
      </label>

      {config.type === 'textarea' ? (
        <textarea
          id={config.name}
          name={config.name}
          className={`${inputBase} min-h-[144px] leading-[1.65]`}
          value={value}
          onChange={handleChange}
          onBlur={() => onBlur(config.name)}
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
            onBlur={() => onBlur(config.name)}
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
          onBlur={() => onBlur(config.name)}
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
      if (first) {
        (
          document.querySelector(
            `[data-field="${first.name}"] input, [data-field="${first.name}"] textarea, [data-field="${first.name}"] select`,
          ) as HTMLElement
        )?.focus();
      }
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
      <div className="flex min-h-[360px] flex-col items-start justify-center border-y border-[var(--border)] py-10" role="status" aria-live="polite">
        <FiCheck className="mb-5 text-[var(--accent-success)]" size={26} />
        <h3 className="m-0 font-display text-[1.8rem] font-medium tracking-[var(--tracking-tight)] text-[var(--text)]">Email draft ready</h3>
        <p className="m-0 max-w-[42ch] text-[0.82rem] leading-[1.55] text-muted-foreground">
          Your email app should open with the message filled in. Send it there to finish.
        </p>
        <button
          onClick={handleReset}
          type="button"
          className="mt-4 inline-flex cursor-pointer items-center gap-2 border-b border-[var(--border)] bg-transparent py-2 text-[0.8rem] text-[var(--text-secondary)] transition-colors hover:border-[var(--text)] hover:text-[var(--text)]"
        >
          <FiSend size={13} aria-hidden="true" />
          send another
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-[1.1rem]" noValidate>
      <div className="mb-2 flex flex-col gap-2 border-b border-[var(--border)] pb-5">
        <h3 id="form-title" className="m-0 font-display text-[1.5rem] font-medium tracking-[var(--tracking-tight)] text-[var(--text)]">Send a note</h3>
        <p className="m-0 text-[0.82rem] leading-relaxed text-[var(--text-secondary)]">A little context helps me get back to you with a useful answer.</p>
      </div>
      <div className="flex flex-col gap-5" role="group" aria-labelledby="form-title">
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
        className="group inline-flex min-h-11 cursor-pointer items-center justify-center gap-3 self-start border border-[var(--text)] bg-[var(--text)] px-5 py-2.5 text-[0.82rem] font-medium text-[var(--bg)] transition-[background-color,color] duration-200 hover:bg-transparent hover:text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-55"
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
    <article className="flex items-center gap-3 border-t border-[var(--border)] py-4 first:border-t-0">
      <span className="inline-flex w-5 shrink-0 items-center justify-center text-[var(--text-dim)]" aria-hidden="true">
        <IconComponent size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="m-0 text-[0.82rem] font-medium leading-[1.3] text-[var(--text)]">{item.title}</h3>
        <p className="m-[0.2rem_0_0] truncate text-[0.75rem] text-[var(--text-secondary)]">{item.subtitle}</p>
      </div>
      {item.href && (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-[0.75rem] text-[var(--text-secondary)] no-underline transition-colors hover:text-[var(--text)]" aria-label={`${item.actionLabel || 'Open'} — ${item.title}`}>
          <span>{item.actionLabel || 'open'}</span>
          <FiExternalLink size={11} aria-hidden="true" />
        </a>
      )}
      {item.copyText && !item.href && (
        <button
          onClick={handleCopy}
          className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-[0.75rem] text-[var(--text-secondary)] transition-colors hover:text-[var(--text)]"
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
    <div>
      <p className="m-0 mb-2 text-[0.72rem] font-medium text-[var(--text-dim)]">
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
    <div className="border-t border-[var(--border)] pt-5">
      <p className="m-0 mb-3 text-[0.72rem] font-medium text-[var(--text-dim)]">
        Elsewhere
      </p>
      <div className="flex flex-wrap gap-x-5 gap-y-3" role="list">
        {socialLinks.map((link) => {
          const IconComponent = iconMap[link.icon];
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 py-1 text-[0.78rem] text-[var(--text-secondary)] no-underline transition-colors hover:text-[var(--text)]"
              aria-label={link.label}
            >
              <span className="inline-flex text-[var(--text-ghost)] transition-colors duration-200 group-hover:text-[var(--accent-secondary)]" aria-hidden="true">
                <IconComponent size={15} />
              </span>
              <span className="min-w-0 truncate">{link.label}</span>
              <span className="text-[var(--text-ghost)] transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden="true">↗</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}

/*  Main Component  */

export function PremiumContacts() {
  const [sectionRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.08 });

  return (
    <section id="contact" className="relative z-10 border-t border-[var(--border)] bg-[var(--bg)]">
      <div ref={sectionRef} className={`relative mx-auto w-full max-w-[1400px] px-[4vw] py-24 transition-[opacity,transform] duration-700 ease-out max-[700px]:px-5 max-[700px]:py-16 ${isInView ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'}`}>
        <header className="mb-14 grid grid-cols-[minmax(0,1fr)_minmax(260px,0.65fr)] items-end gap-10 max-[760px]:mb-10 max-[760px]:grid-cols-1 max-[760px]:gap-5">
          <div>
            <p className="mb-4 text-[0.78rem] text-[var(--text-dim)]">A good conversation starts somewhere</p>
            <h2 className="m-0 font-display text-[clamp(3rem,7vw,6rem)] font-semibold leading-[0.94] tracking-[-0.075em] text-[var(--text)]">Let&apos;s talk.</h2>
          </div>
          <p className="m-0 max-w-[42ch] text-[clamp(0.95rem,1.25vw,1.05rem)] leading-[1.75] text-[var(--text-secondary)]">
            Have a project in mind, a role to discuss, or just want to say hello? Send a note — I usually reply within a day.
          </p>
        </header>

        <div className="grid grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)] items-start gap-x-16 gap-y-12 border-t border-[var(--border)] pt-8 max-[900px]:grid-cols-1 max-[900px]:gap-y-10">
          <div className="min-w-0">
            <ContactForm />
          </div>

          <aside className="flex min-w-0 flex-col">
            <div className="mb-7 flex items-center gap-2.5 border-b border-[var(--border)] pb-5 text-[0.8rem] text-[var(--text-secondary)]">
              <span className="h-2 w-2 animate-status-pulse rounded-full bg-[var(--accent-success)]" aria-hidden="true" />
              <span>Available for select projects</span>
            </div>
            <Conduits />
            <div className="mt-7"><Routes /></div>
          </aside>
        </div>
      </div>
    </section>
  );
}

export default PremiumContacts;
