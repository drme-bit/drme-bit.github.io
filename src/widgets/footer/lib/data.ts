import { profile, socialLinks } from '@/shared/data/profile';
import { navLinks as footerNavLinks } from '@/shared/data/links';

export { footerNavLinks };

export const footerSocialLinks = socialLinks.map((s) => ({
  label: s.label,
  href: s.href,
  external: true,
}));

export const supportLink = {
  label: 'Buy me a coffee',
  href: profile.kofiUrl,
  external: true,
};

export const kofiUrl = profile.kofiUrl;
export const kofiImage = 'https://storage.ko-fi.com/cdn/kratom2/logo/normal-NoshandBG-transparent.png';
export const currentYear = new Date().getFullYear();

export const brandName = profile.brandName;
export const brandTagline = profile.brandTagline;
export const email = profile.email;
