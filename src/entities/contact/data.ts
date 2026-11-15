import type { ContactFormField, ContactInfoItem } from './types';
import { profile, socialLinks } from '@/entities/profile';

export const fieldConfigs: ContactFormField[] = [
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

const phoneHref = `tel:${profile.phone.replace(/[^\d+]/g, '')}`;

export const contactItems: ContactInfoItem[] = [
  {
    id: 'calendar',
    icon: 'calendar',
    title: 'Schedule a call',
    subtitle: '30 min on the calendar',
    href: profile.calendlyUrl,
    external: true,
    actionLabel: 'Book',
  },
  {
    id: 'email',
    icon: 'mail',
    title: 'Email',
    subtitle: profile.email,
    href: `mailto:${profile.email}`,
    copyText: profile.email,
  },
  {
    id: 'phone',
    icon: 'phone',
    title: 'Phone',
    subtitle: profile.phone,
    href: phoneHref,
    copyText: profile.phone,
  },
  {
    id: 'resume',
    icon: 'file',
    title: 'Resume',
    subtitle: 'PDF',
    href: profile.resumeUrl,
    external: true,
    actionLabel: 'Open',
  },
  {
    id: 'location',
    icon: 'mapPin',
    title: 'Based in',
    subtitle: profile.location,
  },
];

export { socialLinks };
