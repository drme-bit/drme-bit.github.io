export default {
  slug: 'building-my-portfolio',
  title: 'Building My Portfolio',
  date: '2026-07-16',
  readTime: '4 min read',
  category: 'Dev',
  excerpt:
    'Decided to build a portfolio site from scratch instead of using templates. Here\'s what went into it.',
  summary:
    'A short note on why I chose to build this site myself, what tech stack I picked, and what I learned along the way.',
  tags: ['React', 'Vite', 'SCSS', 'Firebase'],
  featured: true,
  sections: [
    {
      heading: 'Why from scratch',
      body:
        'Templates are fast but they all look the same. I wanted something that actually feels like mine — the terminal aesthetic, the 3D background, the scroll interactions. It took longer, but the result is something I can stand behind.',
    },
    {
      heading: 'Stack choices',
      body:
        'React + Vite for the foundation. SCSS for styling — no Tailwind this time, wanted full control over the design tokens. Firebase for the reviews system. The 3D terrain uses cobe, a lightweight WebGL globe library. Lenis for smooth scrolling.',
    },
    {
      heading: 'What I\'d do differently',
      body:
        'Started without a design system and paid for it later. Spent hours fixing spacing inconsistencies that a proper token setup would have prevented from day one. Lesson learned: design tokens first, components second.',
    },
  ],
};
