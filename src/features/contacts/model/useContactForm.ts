import { useState } from 'react';
import type { ContactFormData } from '../model/contacts';
import { profile } from '@/entities/profile';

interface UseContactFormReturn {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
  submit: (data: ContactFormData) => Promise<void>;
  reset: () => void;
}

export function useContactForm(): UseContactFormReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const subject = `Portfolio message — ${data.subject}`;
      const body = [`Name: ${data.name}`, `Email: ${data.email}`, '', data.message].join('\n');
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      setIsSuccess(true);
    } catch {
      setError('Could not open your email app. Please use the email link instead.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setIsSuccess(false);
    setError(null);
  };

  return { isSubmitting, isSuccess, error, submit, reset };
}
