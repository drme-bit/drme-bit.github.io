export interface SocialLink {
  id: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: 'general' | 'project' | 'collaboration' | 'freelance' | 'speaking' | 'mentorship' | 'other';
  message: string;
}

export interface ContactFormProps {
  onSuccess?: () => void;
}
