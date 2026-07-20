import type { BlogPost, BlogSection, SectionType } from './posts/types';

export type { BlogPost, BlogSection, SectionType };

/* ─── CATEGORIES ─────────────────────────────────────────── */

export const CATEGORIES: Record<
  string,
  { color: string; gradient: string; icon: string }
> = {
  Frontend: {
    color: 'var(--accent-secondary)',
    gradient: 'linear-gradient(135deg, rgba(125,211,252,0.15), rgba(125,211,252,0.05))',
    icon: 'Monitor',
  },
  Backend: {
    color: 'var(--accent-tertiary)',
    gradient: 'linear-gradient(135deg, rgba(167,139,250,0.15), rgba(167,139,250,0.05))',
    icon: 'Server',
  },
  Dev: {
    color: 'var(--accent-warm)',
    gradient: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(251,191,36,0.05))',
    icon: 'Code',
  },
  Architecture: {
    color: 'var(--accent-tertiary)',
    gradient: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))',
    icon: 'Layers',
  },
  Design: {
    color: 'var(--accent-warm)',
    gradient: 'linear-gradient(135deg, rgba(251,113,133,0.15), rgba(251,113,133,0.05))',
    icon: 'Palette',
  },
};

/* ─── BLOG_POSTS (sync for list page) ────────────────────── */

// Import all metas statically for the list page
import integratingMeta from './posts/integrating-nodejs/meta';
import cobeMeta from './posts/why-i-replaced-cobe/meta';
import portfolioMeta from './posts/building-my-portfolio/meta';

export const BLOG_POSTS: BlogPost[] = [
  integratingMeta,
  cobeMeta,
  portfolioMeta,
];

export function getBlogPostBySlug(slug: string) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostIndex(slug: string) {
  return BLOG_POSTS.findIndex((post) => post.slug === slug);
}
