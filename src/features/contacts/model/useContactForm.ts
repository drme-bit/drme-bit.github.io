import { useState } from 'react';
import emailjs from '@emailjs/browser';
import type { ContactFormData } from '../model/contacts';
import { profile } from '@/entities/profile';
import { fieldConfigs } from '@/entities/contact';

/*  EmailJS configuration (.env.local). All NEXT_PUBLIC_* values end up in the browser bundle;
    that is by design for EmailJS - the public key only identifies your account.
      NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
      NEXT_PUBLIC_EMAILJS_SERVICE_ID
      NEXT_PUBLIC_EMAILJS_TEMPLATE_ID            – notification that lands in YOUR inbox
      NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID  – optional: confirmation sent to the visitor   */
const PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
const SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const AUTOREPLY_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_AUTOREPLY_TEMPLATE_ID;

/** 'sent'  – delivered through EmailJS.
 *  'draft' – EmailJS is not configured, the visitor's mail app was opened instead. */
export type ContactDelivery = 'sent' | 'draft';

interface UseContactFormReturn {
  isSubmitting: boolean;
  isSuccess: boolean;
  delivery: ContactDelivery | null;
  error: string | null;
  submit: (data: ContactFormData) => Promise<void>;
  reset: () => void;
}

const subjectLabel = (value: string) =>
  fieldConfigs
    .find((field) => field.name === 'subject')
    ?.options?.find((option) => option.value === value)?.label ?? value;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useContactForm(): UseContactFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [delivery, setDelivery] = useState<ContactDelivery | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sendWithEmailJs = async (data: ContactFormData) => {
    // Variable names must match the {{placeholders}} in your EmailJS templates.
    const params = {
      from_name: data.name,
      reply_to: data.email,
      email: data.email, // если в шаблоне {{email}}
      name: data.name, // если в шаблоне {{name}}
      subject: subjectLabel(data.subject),
      message: data.message,
    };

    // 1) Notification to you. limitRate is a client-side throttle (a courtesy, not real protection).
    await emailjs.send(SERVICE_ID!, TEMPLATE_ID!, params, {
      publicKey: PUBLIC_KEY!,
      blockHeadless: true,
      limitRate: { id: 'contact-form', throttle: 10_000 },
    });

    // 2) Auto-reply to the visitor. Its failure must not turn a delivered message into an error.
    //    The EmailJS REST API allows ~1 request per second, hence the short pause.
    if (AUTOREPLY_TEMPLATE_ID) {
      try {
        await sleep(1100);
        await emailjs.send(SERVICE_ID!, AUTOREPLY_TEMPLATE_ID, params, {
          publicKey: PUBLIC_KEY!,
          blockHeadless: true,
        });
      } catch {
        /* the message already reached you */
      }
    }
  };

  const openMailDraft = (data: ContactFormData) => {
    const subject = `Portfolio message — ${data.subject}`;
    const body = [`Name: ${data.name}`, `Email: ${data.email}`, '', data.message].join('\n');
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const submit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (PUBLIC_KEY && SERVICE_ID && TEMPLATE_ID) {
        await sendWithEmailJs(data);
        setDelivery('sent');
      } else {
        // Local development / missing env: keep the previous mailto behaviour.
        openMailDraft(data);
        setDelivery('draft');
      }
      setIsSuccess(true);
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      setError(
        status === 429
          ? 'Please wait a few seconds before sending another message.'
          : 'Could not send the message. Please use the email link instead.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSuccess(false);
    setDelivery(null);
    setError(null);
  };

  return { isSubmitting, isSuccess, delivery, error, submit, reset };
}
