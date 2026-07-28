export const CALENDLY_URL = 'https://calendly.com/vacheslavtkachik/30min';

export const APP_PHONE = '+380 96 004 5028';

export const SUBJECT_OPTIONS = [
  { value: 'freelance', label: 'Freelance Project' },
  { value: 'contract', label: 'Contract Work' },
  { value: 'full-time', label: 'Full-time Position' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'other', label: 'Other' },
] as const;

export const SOCIAL_LINKS: Array<{ id: string; label: string; href: string; external?: boolean }> = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/drme-bit', external: true },
  { id: 'twitter', label: 'Twitter', href: 'https://twitter.com/drme_bit', external: true },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com/in/vyacheslav-tkachik', external: true },
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com/drme_bit', external: true },
];

export const FORM_SUCCESS_DELAY = 3000;
