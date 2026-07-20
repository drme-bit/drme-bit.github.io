export type SectionType = 'text' | 'code' | 'list' | 'quote';

export interface BlogSection {
  heading: string;
  body: string;
  type?: SectionType;
  language?: string;
  items?: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  readTime: string;
  category: string;
  excerpt: string;
  summary: string;
  tags: string[];
  featured?: boolean;
  icon?: string;
  coverImage?: string;
  sections?: BlogSection[];
  theme?: {
    primary: string;
    bg: string;
    accent: string;
    glow: string;
  };
}
