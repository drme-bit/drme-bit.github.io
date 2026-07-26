'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FiSend, FiMail, FiUser, FiLoader, FiCheck, FiX, FiExternalLink, FiCopy, FiCalendar, FiPhone, FiMapPin, FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiAlertCircle } from '@/shared/ui/atoms/Icon';
import { useContactForm } from '../hooks/useContactForm';
import type { ContactFormData } from '../types/contacts';
import styles from '../ui/PremiumContacts.module.scss';

gsap.registerPlugin(ScrollTrigger);

/*  Form Field Config  */

interface FormFieldConfig {
  name: keyof ContactFormData;
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  options?: { value: string; label: string }[];
}

const fieldConfigs: FormFieldConfig[] = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true, maxLength: 50 },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', required: true },
  {
    name: 'subject', label: 'Subject', type: 'select', placeholder: 'What\'s this about?', required: true,
    options: [
      { value: 'project', label: 'Project Inquiry' },
      { value: 'collaboration', label: 'Collaboration' },
      { value: 'freelance', label: 'Freelance Work' },
      { value: 'speaking', label: 'Speaking Engagement' },
      { value: 'other', label: 'Other' },
    ],
  },
  { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Tell me about your project, ideas, or just say hi...', required: true, maxLength: 2000 },
];

/*  Form Field ─ */

function FormField({
  config, value, error, touched, onChange, onBlur,
}: {
  config: FormFieldConfig;
  value: string;
  error?: string;
  touched?: boolean;
  onChange: (name: keyof ContactFormData, value: string) => void;
  onBlur: (name: keyof ContactFormData) => void;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  useEffect(() => { setHasValue(value.length > 0); }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    onChange(config.name, e.target.value);
  };

  const isError = error && touched;

  return (
    <div
      className={`${styles.formField} ${isFocused ? styles.focused : ''} ${hasValue ? styles.hasValue : ''} ${isError ? styles.hasError : ''}`}
      data-field={config.name}
    >
      <label className={styles.fieldLabel} htmlFor={config.name}>
        {config.label}
        {config.required && <span className={styles.requiredMark} aria-hidden="true">*</span>}
      </label>

      <div className={styles.fieldInputWrapper}>
        {config.type === 'textarea' ? (
          <textarea
            id={config.name}
            name={config.name}
            className={`${styles.fieldInput} ${styles.fieldTextarea}`}
            value={value}
            onChange={handleChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={config.placeholder}
            rows={5}
            maxLength={config.maxLength}
            aria-invalid={isError ? 'true' : 'false'}
            aria-describedby={isError ? `${config.name}-error` : undefined}
            aria-required={config.required}
          />
        ) : config.type === 'select' ? (
          <div className={styles.selectWrapper}>
            <select
              id={config.name}
              name={config.name}
              className={`${styles.fieldInput} ${styles.fieldSelect}`}
              value={value}
              onChange={handleChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              aria-invalid={isError ? 'true' : 'false'}
              aria-describedby={isError ? `${config.name}-error` : undefined}
              aria-required={config.required}
            >
              <option value="" disabled>{config.placeholder}</option>
              {config.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <input
            id={config.name}
            name={config.name}
            type={config.type}
            className={styles.fieldInput}
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
          <div className={styles.charCount} aria-hidden="true">
            {value.length} / {config.maxLength}
          </div>
        )}
      </div>

      {isError && (
        <p id={`${config.name}-error`} className={styles.fieldError} role="alert">
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
      <div className={styles.successState} role="status" aria-live="polite">
        <div className={styles.successIcon} aria-hidden="true"><FiCheck size={22} /></div>
        <h3 className={styles.successTitle}>Message Sent!</h3>
        <p className={styles.successMessage}>Thanks for reaching out. I&apos;ll get back to you within 24 hours.</p>
        <button onClick={handleReset} className={styles.resetBtn} type="button">
          <FiSend size={14} aria-hidden="true" />
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className={styles.contactForm} noValidate>
      <div className={styles.formFields} role="group" aria-labelledby="form-title">
        <div className={styles.fieldRow}>
          <FormField config={fieldConfigs[0]} value={formData.name} error={errors.name} touched={touched.name} onChange={handleChange} onBlur={handleBlur} />
          <FormField config={fieldConfigs[1]} value={formData.email} error={errors.email} touched={touched.email} onChange={handleChange} onBlur={handleBlur} />
        </div>
        <FormField config={fieldConfigs[2]} value={formData.subject} error={errors.subject} touched={touched.subject} onChange={handleChange} onBlur={handleBlur} />
        <FormField config={fieldConfigs[3]} value={formData.message} error={errors.message} touched={touched.message} onChange={handleChange} onBlur={handleBlur} />
      </div>

      {error && (
        <div className={styles.formError} role="alert">
          <FiAlertCircle size={14} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" className={styles.submitBtn} disabled={isSubmitting} aria-busy={isSubmitting}>
        <span className={styles.btnContent}>
          {isSubmitting ? (
            <>
              <span className={styles.btnSpinner} aria-hidden="true">
                <FiLoader size={16} className={styles.spinning} />
              </span>
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Message</span>
              <FiSend size={16} className={styles.btnIcon} aria-hidden="true" />
            </>
          )}
        </span>
      </button>
    </form>
  );
}

/*  Contact Info ── */

interface ContactInfoItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  copyText?: string;
  href?: string;
  external?: boolean;
  actionLabel?: string;
}

const contactItems: ContactInfoItem[] = [
  { id: 'calendar', icon: <FiCalendar size={18} />, title: 'Schedule a Call', subtitle: '30 min · Calendly', href: 'https://calendly.com/vacheslavtkachik/30min', external: true, actionLabel: 'Book' },
  { id: 'email', icon: <FiMail size={18} />, title: 'Email Me', subtitle: 'hello@drme.dev', copyText: 'hello@drme.dev' },
  { id: 'phone', icon: <FiPhone size={18} />, title: 'Call Me', subtitle: '+380 96 004 5028', copyText: '+380 96 004 5028' },
  { id: 'location', icon: <FiMapPin size={18} />, title: 'Location', subtitle: 'Kyiv, Ukraine (GMT+3)' },
];

function ContactInfoCard({ item, index }: { item: ContactInfoItem; index: number }) {
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      opacity: 0, y: 16, duration: 0.5, delay: index * 0.06,
      ease: 'power2.out',
      scrollTrigger: { trigger: cardRef.current, start: 'top 90%', toggleActions: 'play none none reverse' },
    });
  }, [index]);

  const handleCopy = useCallback(async () => {
    if (!item.copyText) return;
    try { await navigator.clipboard.writeText(item.copyText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  }, [item.copyText]);

  const isActionable = !!item.href || !!item.copyText;

  return (
    <article
      ref={cardRef}
      className={`${styles.infoCard} ${isActionable ? styles.actionable : ''} ${copied ? styles.copied : ''}`}
    >
      <div className={styles.cardIconWrapper}>
        <span className={styles.cardIcon} aria-hidden="true">{item.icon}</span>
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        <p className={styles.cardSubtitle}>{item.subtitle}</p>
      </div>

      {item.href && (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={`${styles.cardAction} ${styles.external}`} aria-label={`${item.actionLabel || 'Open'} ${item.title}`}>
          <span className={styles.actionText}>{item.actionLabel || 'Open'}</span>
          <FiExternalLink size={12} aria-hidden="true" />
        </a>
      )}

      {item.copyText && !item.href && (
        <button onClick={handleCopy} className={`${styles.cardAction} ${styles.copy}`} aria-label={`Copy ${item.title.toLowerCase()}`} aria-pressed={copied}>
          {copied ? (
            <><FiCheck size={12} aria-hidden="true" /><span className={styles.actionText}>Copied</span></>
          ) : (
            <><FiCopy size={12} aria-hidden="true" /><span className={styles.actionText}>Copy</span></>
          )}
        </button>
      )}
    </article>
  );
}

function ContactInfo() {
  return (
    <aside className={styles.contactInfo} aria-label="Contact Information">
      <header className={styles.infoHeader}>
        <span className={styles.prompt} aria-hidden="true">$</span>
        <h2 className={styles.infoTitle}>Get in Touch</h2>
      </header>

      <div className={styles.infoGrid} role="list">
        {contactItems.map((item, i) => (
          <ContactInfoCard key={item.id} item={item} index={i} />
        ))}
      </div>

      <div className={styles.availability}>
        <div className={styles.availabilityIndicator} aria-hidden="true"><span className={styles.statusDot} /></div>
        <span className={styles.availabilityText}>Usually responds within a few hours</span>
      </div>
    </aside>
  );
}

/*  Social Links ── */

interface SocialLink {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  description: string;
}

const socialLinks: SocialLink[] = [
  { id: 'github', label: 'GitHub', icon: <FiGithub size={18} />, href: 'https://github.com/drme-bit', description: 'Repositories & contributions' },
  { id: 'twitter', label: 'Twitter/X', icon: <FiTwitter size={18} />, href: 'https://twitter.com/drme_bit', description: 'Updates & thoughts' },
  { id: 'linkedin', label: 'LinkedIn', icon: <FiLinkedin size={18} />, href: 'https://linkedin.com/in/vyacheslav-tkachik', description: 'Professional network' },
  { id: 'instagram', label: 'Instagram', icon: <FiInstagram size={18} />, href: 'https://instagram.com/drme_bit', description: 'Behind the scenes' },
];

function SocialCard({ link, index }: { link: SocialLink; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);

  useGSAP(() => {
    if (!cardRef.current) return;
    gsap.from(cardRef.current, {
      opacity: 0, y: 12, duration: 0.4, delay: index * 0.05,
      ease: 'power2.out',
      scrollTrigger: { trigger: cardRef.current, start: 'top 92%', toggleActions: 'play none none reverse' },
    });
  }, [index]);

  return (
    <a ref={cardRef} href={link.href} target="_blank" rel="noopener noreferrer" className={styles.socialCard} aria-label={link.label}>
      <span className={styles.socialIcon} aria-hidden="true">{link.icon}</span>
      <span className={styles.socialLabel}>{link.label}</span>
    </a>
  );
}

function SocialLinks() {
  return (
    <section className={styles.socialLinks} aria-label="Social Links">
      <header className={styles.socialHeader}>
        <span className={styles.prompt} aria-hidden="true">$</span>
        <h2 className={styles.socialTitle}>Connect</h2>
      </header>

      <div className={styles.socialGrid} role="list">
        {socialLinks.map((link, i) => (
          <SocialCard key={link.id} link={link} index={i} />
        ))}
      </div>

      <div className={styles.socialFooter}>
        <p className={styles.footerText}>
          Prefer email? <a href="mailto:hello@drme.dev" className={styles.footerLink}>hello@drme.dev</a>
        </p>
      </div>
    </section>
  );
}

/*  Main Component  */

export function PremiumContacts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Curtain: contact slides up over pinned Reviews (no pin — CSS sticky handles holding)
  useGSAP(() => {
    const wrapper = wrapperRef.current;
    const section = sectionRef.current;
    if (!wrapper || !section) return;

    const ctx = gsap.context(() => {
      // Contact slides from below viewport to top (yPercent: 100 → 0)
      gsap.fromTo(wrapper,
        { yPercent: 100 },
        {
          yPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        }
      );

      // Stagger reveal for left (form) and right (info+social) columns
      const formWrapper = section.querySelector(`.${styles.formWrapper}`);
      const sideWrapper = section.querySelector(`.${styles.sideWrapper}`);

      [formWrapper, sideWrapper].forEach((el, i) => {
        if (el) {
          gsap.fromTo(el,
            { opacity: 0, y: 30 },
            {
              opacity: 1, y: 0, duration: 0.6, delay: i * 0.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: wrapper, start: 'top 75%', toggleActions: 'play none none reverse' },
            }
          );
        }
      });
    }, wrapperRef);

    return () => ctx.revert();
  }, { scope: wrapperRef, revertOnUpdate: true });

  return (
    <div id="contact" ref={wrapperRef} className={styles.wrapper}>
      <section id="contact-section" ref={sectionRef} className={styles.section}>
        <div className={styles.inner}>
          <header className={styles.header}>
            <span className={styles.prompt} aria-hidden="true">$</span>
            <h2 className={styles.title}>Get in Touch</h2>
          </header>

          <div className={styles.grid}>
            {/* Form Column */}
            <div className={styles.formWrapper}>
              <ContactForm />
            </div>

            {/* Right Column — Info & Social */}
            <div className={styles.sideWrapper}>
              <ContactInfo />
              <SocialLinks />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PremiumContacts;
