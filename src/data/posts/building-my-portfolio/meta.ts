const meta = {
  slug: 'building-my-portfolio',
  title: 'Building My Portfolio',
  date: '2026-07-16',
  readTime: '4 min read',
  category: 'Dev',
  icon: '</>',
  excerpt:
    "Decided to build a portfolio site from scratch instead of using templates. Here's what went into it.",
  summary:
    'A short note on why I chose to build this site myself, what tech stack I picked, and what I learned along the way.',
  tags: ['React', 'Next.js', 'SCSS', 'Firebase'],
  featured: true,
  theme: {
    primary: '#fbbf24',
    bg: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 50%, #16213e 100%)',
    accent: '#fbbf24',
    glow: 'rgba(251, 191, 36, 0.12)',
  },
};

export type PostMeta = typeof meta;
export default meta;
