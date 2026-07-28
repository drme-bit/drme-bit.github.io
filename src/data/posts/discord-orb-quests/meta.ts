const meta = {
  slug: 'discord-orb-quests',
  title: 'How I Automated Discord Orb Quests',
  date: '2026-07-28',
  readTime: '8 min read',
  category: 'Dev',
  icon: 'Terminal',
  excerpt:
    'A deep-dive into Discord\'s internal webpack modules and how to spoof quest progress to earn orbs without actually watching videos or playing games.',
  summary:
    'Reverse-engineering Discord\'s client internals to automate quest completion — from webpack module extraction to API spoofing.',
  tags: ['Discord', 'Reverse Engineering', 'JavaScript', 'Webpack', 'Exploit'],
  featured: true,
  theme: {
    primary: '#5865F2',
    bg: 'linear-gradient(180deg, #1a1b2e 0%, #0f1019 50%, #151625 100%)',
    accent: '#5865F2',
    glow: 'rgba(88, 101, 242, 0.12)',
  },
};

export type PostMeta = typeof meta;
export default meta;
