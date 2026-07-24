'use client';

import { useState } from 'react';
import { FiSend, FiCheck, FiAlertCircle, FiCalendar } from 'react-icons/fi';
import { useContactForm } from '../hooks/useContactForm';
import { SUBJECT_OPTIONS, FORM_SUCCESS_DELAY } from '../lib/constants';
import type { ContactFormData } from '../types/contacts';
import styles from './ContactForm.module.scss';

export default function ContactForm() {
  const { isSubmitting, isSuccess, error, submit, reset } = useContactForm();
  const [form, setForm] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: 'freelance',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return;
    await submit(form);
    setTimeout(() => {
      reset();
      setForm({ name: '', email: '', subject: 'freelance', message: '' });
    }, FORM_SUCCESS_DELAY);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h3 className={styles.title}>
          <span className={styles.prompt}>$</span> send_message
        </h3>
        <a
          href="https://calendly.com/vacheslavtkachik/30min"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.calendly}
        >
          <FiCalendar size={14} />
          <span>prefer a call?</span>
        </a>
      </div>

      {isSuccess ? (
        <div className={styles.success}>
          <FiCheck size={24} />
          <p className={styles.successTitle}>message sent!</p>
          <p className={styles.successSub}>i&apos;ll get back to you soon</p>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <label className={styles.field}>
              <span className={styles.label}>name</span>
              <input
                type="text"
                name="name"
                className={styles.input}
                placeholder="your name"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>email</span>
              <input
                type="email"
                name="email"
                className={styles.input}
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label className={styles.field}>
            <span className={styles.label}>subject</span>
            <select
              name="subject"
              className={styles.input}
              value={form.subject}
              onChange={handleChange}
            >
              {SUBJECT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span className={styles.label}>message</span>
            <textarea
              name="message"
              className={`${styles.input} ${styles.textarea}`}
              placeholder="what's on your mind?"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
            />
          </label>

          {error && (
            <div className={styles.error}>
              <FiAlertCircle size={14} />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className={styles.submit}
            disabled={isSubmitting || !form.name.trim() || !form.email.trim() || !form.message.trim()}
          >
            {isSubmitting ? 'sending...' : 'send message'}
            <FiSend size={12} />
          </button>
        </form>
      )}
    </div>
  );
}
