export type PremiumContactFormField = {
  name: 'name' | 'email' | 'subject' | 'message';
  label: string;
  type: 'text' | 'email' | 'textarea' | 'select';
  placeholder: string;
  required?: boolean;
  maxLength?: number;
  options?: { value: string; label: string }[];
};

export type PremiumContactInfoItem = {
  id: string;
  icon: 'calendar' | 'mail' | 'phone' | 'mapPin';
  title: string;
  subtitle: string;
  href?: string;
  external?: boolean;
  actionLabel?: string;
  copyText?: string;
};

export type PremiumSocialLink = {
  id: string;
  label: string;
  icon: 'github' | 'twitter' | 'linkedin' | 'discord';
  href: string;
  description: string;
};

export type PremiumNavLink = {
  label: string;
  href: string;
};

export type PremiumFooterLink = {
  label: string;
  href: string;
  external?: boolean;
};
