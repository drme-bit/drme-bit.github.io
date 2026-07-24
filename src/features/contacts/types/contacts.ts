export interface SocialLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: 'freelance' | 'contract' | 'full-time' | 'collaboration' | 'other';
  message: string;
}

export interface ContactFormProps {
  onSuccess?: () => void;
}
