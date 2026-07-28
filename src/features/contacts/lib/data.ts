import type { PremiumContactFormField, PremiumContactInfoItem, PremiumSocialLink, PremiumNavLink } from '../types/index';
import { socialLinks, navLinks } from '@/shared/data/links';

export const fieldConfigs: PremiumContactFormField[] = [
  { name: 'name', label: 'Full Name', type: 'text', placeholder: 'Your name', required: true, maxLength: 50 },
  { name: 'email', label: 'Email Address', type: 'email', placeholder: 'your@email.com', required: true },
  {
    name: 'subject', label: 'Subject', type: 'select', placeholder: "What's this about?", required: true,
    options: [
      { value: 'project', label: 'Project Inquiry' },
      { value: 'collaboration', label: 'Collaboration' },
      { value: 'freelance', label: 'Freelance Work' },
      { value: 'speaking', label: 'Speaking Engagement' },
      { value: 'other', label: 'Other' },
    ],
  },
  { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Tell me about your project, ideas, or just say hi...', required: true, maxLength: 2000 },
];

export const contactItems: PremiumContactInfoItem[] = [
  {
    id: 'calendar',
    icon: 'calendar',
    title: 'Schedule a Call',
    subtitle: '30 min · Calendly',
    href: 'https://calendly.com/vacheslavtkachik/30min',
    external: true,
    actionLabel: 'Book',
  },
  {
    id: 'email',
    icon: 'mail',
    title: 'Email Me',
    subtitle: 'vacheslavtkachik@gmail.com',
    copyText: 'vacheslavtkachik@gmail.com',
  },
  {
    id: 'phone',
    icon: 'phone',
    title: 'Call Me',
    subtitle: '+380 96 004 5028',
    copyText: '+380 96 004 5028',
  },
  { id: 'location', icon: 'mapPin', title: 'Location', subtitle: 'Odessa, Ukraine (GMT+3)' },
];

export { socialLinks, navLinks };
