/*  Personal profile — single source of truth for contact & identity data.
    Used across hero, contacts, footer, and navbar. */

export const profile = {
  firstName: 'Vyacheslav',
  lastName: 'Tkachyk',
  name: 'Vyacheslav Tkachyk',
  githubUsername: 'drme-bit',
  email: 'vacheslavtkachik@gmail.com',
  phone: '+380 96 004 5028',
  city: 'Odesa',
  country: 'Ukraine',
  timezone: 'GMT+3',
  location: 'Odesa, Ukraine (GMT+3)',
  calendlyUrl: 'https://calendly.com/vacheslavtkachik/30min',
  resumeUrl: '/resume/Vyacheslav_Tkachyk_Resume.pdf',
  brandName: 'drme',
  brandTagline: 'Building things that matter. Open to interesting projects.',
  kofiUrl: 'https://ko-fi.com/drmebit',
} as const;

export type SocialLinkId = 'github' | 'linkedin' | 'discord';

export interface SocialLink {
  id: SocialLinkId;
  label: string;
  icon: SocialLinkId;
  href: string;
  description: string;
}

export const socialLinks: SocialLink[] = [
  { id: 'github', label: 'GitHub', icon: 'github', href: 'https://github.com/drme-bit', description: 'Repositories & contributions' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin', href: 'https://www.linkedin.com/in/vyacheslav-tkachik-2a3b8a277/', description: 'Professional network' },
  { id: 'discord', label: 'Discord', icon: 'discord', href: 'https://discord.gg/GpbqzWMMbh', description: 'Behind the scenes' },
];
