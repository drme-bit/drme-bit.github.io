import type { PremiumFooterLink } from '@/features/contacts/types/index';

/*  Social links — single source of truth  */

export const socialLinks = [
  { id: 'github', label: 'GitHub', icon: 'github' as const, href: 'https://github.com/drme-bit', description: 'Repositories & contributions' },
  { id: 'linkedin', label: 'LinkedIn', icon: 'linkedin' as const, href: 'https://www.linkedin.com/in/vyacheslav-tkachik-2a3b8a277/', description: 'Professional network' },
  { id: 'discord', label: 'Discord', icon: 'discord' as const, href: 'https://discord.gg/GpbqzWMMbh', description: 'Behind the scenes' },
];

/*  Nav links  */

export const navLinks = [
  { label: 'Stats', href: '/stats' },
  { label: 'Blog', href: '/blog' },
  { label: 'Projects', href: '/projects' },
];

/*  Footer-format social links  */

export const footerSocialLinks: PremiumFooterLink[] = socialLinks.map(s => ({
  label: s.label,
  href: s.href,
  external: true,
}));

/*  Brand  */

export const brandName = 'drme';
export const brandTagline = 'Building things that matter. Open to interesting projects.';
export const email = 'vacheslavtkachik@gmail.com';
export const phone = '+380 96 004 5028';
export const location = 'Odessa, Ukraine (GMT+3)';
