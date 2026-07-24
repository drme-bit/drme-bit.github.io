export const CALENDLY_URL = 'https://calendly.com/vacheslavtkachik/30min';

export const SUBJECT_OPTIONS = [
  { value: 'freelance', label: 'Freelance Project' },
  { value: 'contract', label: 'Contract Work' },
  { value: 'full-time', label: 'Full-time Position' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'other', label: 'Other' },
] as const;

export const SOCIAL_LINKS: Array<{ id: string; label: string; href: string; external?: boolean }> = [
  { id: 'github', label: 'drme-bit', href: 'https://github.com/drme-bit', external: true },
  { id: 'telegram', label: '@drme_bit', href: 'https://t.me/drmebit', external: true },
  { id: 'discord', label: 'Dr.ME', href: 'https://discord.gg/vhAvnrmNX', external: true },
  {
    id: 'linkedin',
    label: 'vacheslavtkachik',
    href: 'https://www.linkedin.com/in/vyacheslav-tkachik-2a3b8a277',
    external: true,
  },
  { id: 'email', label: 'vacheslavtkachik@gmail.com', href: 'mailto:vacheslavtkachik@gmail.com' },
];

export const FORM_SUCCESS_DELAY = 3000;
