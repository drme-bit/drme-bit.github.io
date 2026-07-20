const meta = {
  slug: 'why-i-replaced-cobe',
  title: 'Why I Replaced cobe with three-globe',
  date: '2026-07-19',
  readTime: '6 min read',
  category: 'Frontend',
  icon: 'Globe',
  excerpt:
    'cobe looked great in demos but fell apart in production. Here is what went wrong and why three-globe was the right call.',
  summary:
    'A deep dive into the technical reasons behind migrating from cobe to three-globe for the interactive skill globe.',
  tags: ['React', 'Three.js', 'three-globe', 'cobe', 'WebGL'],
  featured: false,
  theme: {
    primary: '#7dd3fc',
    bg: 'linear-gradient(180deg, #0c1222 0%, #0a0e1a 50%, #111827 100%)',
    accent: '#7dd3fc',
    glow: 'rgba(125, 211, 252, 0.1)',
  },
};

export type PostMeta = typeof meta;
export default meta;
