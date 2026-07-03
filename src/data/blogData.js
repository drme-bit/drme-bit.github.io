export const BLOG_POSTS = [
  {
    slug: 'building-a-portfolio-with-motion-and-3d',
    title: 'Building a Portfolio with Motion and 3D',
    date: '2026-06-18',
    readTime: '8 min read',
    category: 'Frontend',
    excerpt:
      'How I balanced atmosphere, performance, and usability while building a portfolio that feels closer to an interactive product than a static resume.',
    summary:
      'This post breaks down the structure of the portfolio, the decision to use a dark terminal-like visual language, and the tradeoffs behind combining scroll effects, 3D elements, and custom UI without losing readability.',
    tags: ['React', 'Three.js', 'UI', 'Animation'],
    featured: true,
    sections: [
      {
        heading: 'Why this visual direction',
        body:
          'The goal was to make the site feel engineered rather than templated. Instead of chasing a generic minimal portfolio, I leaned into a terminal-inspired composition with technical overlays, section depth, and motion that supports the content instead of fighting it.',
      },
      {
        heading: 'What stayed small on purpose',
        body:
          'The strongest interface decisions were the restrained ones: compact metadata, short section copy, and navigation that never competes with the content. The result reads faster and gives the more expressive parts of the layout room to breathe.',
      },
      {
        heading: 'Performance lessons',
        body:
          '3D and motion are useful only when they stay lightweight. Keeping the scene fixed, leaning on CSS for most transitions, and avoiding unnecessary re-renders made the page feel alive without turning into a performance liability.',
      },
    ],
  },
  {
    slug: 'designing-data-driven-pages',
    title: 'Designing Data-Driven Pages',
    date: '2026-05-29',
    readTime: '6 min read',
    category: 'Architecture',
    excerpt:
      'A simple pattern for separating content from layout so project pages, case studies, and future blog posts can evolve without duplicating markup.',
    summary:
      'This entry focuses on the structure behind reusable content pages: centralized data, shared page shells, and deliberate typography rules that keep the UI consistent as the content grows.',
    tags: ['React Router', 'Content Model', 'SCSS'],
    featured: false,
    sections: [
      {
        heading: 'One schema, many pages',
        body:
          'When the content model is predictable, the page layout becomes simpler. Projects, blog posts, and future notes can all follow the same principles: title, metadata, highlights, and body sections.',
      },
      {
        heading: 'Why data beats hardcoded markup',
        body:
          'Hardcoded page sections make small changes expensive. A compact data model lets you add entries or rearrange sections without rewriting the visual shell every time.',
      },
    ],
  },
  {
    slug: 'keeping-ui-compact-and-readable',
    title: 'Keeping UI Compact and Readable',
    date: '2026-04-11',
    readTime: '5 min read',
    category: 'Design',
    excerpt:
      'A few rules that keep dense interface blocks legible: smaller stat surfaces, clear hierarchy, and enough spacing to prevent visual noise.',
    summary:
      'This is the design principle I keep applying across the site: supporting metadata should support the page, not hijack it. Compact metrics and short labels are enough if the hierarchy is strong.',
    tags: ['Typography', 'Layout', 'Visual Hierarchy'],
    featured: false,
    sections: [
      {
        heading: 'Supporting metadata only',
        body:
          'Metrics are useful when they help the reader orient themselves. They should not become the main event unless the page is specifically about analytics.',
      },
      {
        heading: 'Readable before decorative',
        body:
          'Once the interface is compact, the next check is whether the reading path is still obvious. If the answer is no, the composition is too busy and should be simplified.',
      },
    ],
  },
];

export function getBlogPostBySlug(slug) {
  return BLOG_POSTS.find((post) => post.slug === slug);
}

export function getBlogPostIndex(slug) {
  return BLOG_POSTS.findIndex((post) => post.slug === slug);
}