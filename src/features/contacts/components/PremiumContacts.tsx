'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
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
import type { ContactFormData } from '../types/contacts';
import { profile } from '@/shared/data/profile';
import { fieldConfigs, contactItems, socialLinks } from '../lib/data';
import styles from '../ui/PremiumContacts.module.scss';

gsap.registerPlugin(ScrollTrigger);

/*  Icon Map  */

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

function ContactInfoCard({ item, index }: { item: typeof contactItems[0]; index: number }) {
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
  const IconComponent = iconMap[item.icon];

  return (
    <article
      ref={cardRef}
      className={`${styles.infoCard} ${isActionable ? styles.actionable : ''} ${copied ? styles.copied : ''}`}
    >
      <div className={styles.cardIconWrapper}>
        <span className={styles.cardIcon} aria-hidden="true"><IconComponent size={18} /></span>
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

function SocialCard({ link, index }: { link: typeof socialLinks[0]; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null);
  const IconComponent = iconMap[link.icon];

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
      <span className={styles.socialIcon} aria-hidden="true"><IconComponent size={18} /></span>
      <span className={styles.socialLabel}>{link.label}</span>
    </a>
  );
}

function PremiumSocialLinks() {
  return (
    <section className={styles.socialLinks} aria-label="Social Links">
      <header className={styles.socialHeader}>
        <span className={styles.prompt} aria-hidden="true">
          $
        </span>
        <h2 className={styles.socialTitle}>Connect</h2>
      </header>

      <div className={styles.socialGrid} role="list">
        {socialLinks.map((link, i) => (
          <SocialCard key={link.id} link={link} index={i} />
        ))}
      </div>

      <div className={styles.socialFooter}>
        <p className={styles.footerText}>
          Prefer email?{' '}
          <a href={`mailto:${profile.email}`} className={styles.footerLink}>
            {profile.email}
          </a>
        </p>
      </div>
    </section>
  );
}

/*  Main Component  */

export function PremiumContacts() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const wrapper = wrapperRef.current;
    const section = sectionRef.current;
    if (!wrapper || !section) return;

    const ctx = gsap.context(() => {
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
            <div className={styles.formWrapper}>
              <ContactForm />
            </div>

            <div className={styles.sideWrapper}>
              <ContactInfo />
              <PremiumSocialLinks />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PremiumContacts;