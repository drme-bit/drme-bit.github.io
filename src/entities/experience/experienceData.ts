/*  Data ─ */
interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  desc: string;
  highlights?: string[];
  tech?: string[];
  link?: string;
  linkText?: string;
  gallery?: { src: string; alt: string }[];
}

const experienceData: ExperienceEntry[] = [
  {
    period: '2021 — present',
    role: 'Freelance Developer',
    org: 'Self-Employed',
    desc: 'Built custom software solutions for clients across multiple platforms. Developed Roblox experiences (anime games, trading economies, horror titles) serving 2000+ daily players with admin panels, vehicle systems, and anti-cheat. Created Telegram/Discord bots for moderation, automation, and community management. Delivered backend APIs and full-stack web apps tailored to client needs. Managed all aspects: requirements gathering, architecture, development, deployment, and maintenance.',
    highlights: [
      'Roblox titles — anime, trading economies, horror',
      '2,000+ daily players across live experiences',
      'Telegram / Discord bots & automation tooling',
      'Backend APIs and full-stack web apps',
    ],
    tech: ['Luau', 'TypeScript', 'Python', 'Node.js', 'MySQL'],
    gallery: [
      {
        src: '/media/projects/roblox/images/vault_overview.png',
        alt: 'Roblox vault game overview',
      },
      {
        src: '/media/projects/roblox/images/garden_vs_brainrot.png',
        alt: 'Roblox garden vs brainrot game',
      },
      {
        src: '/media/projects/bloxingbad/images/map-reference.png',
        alt: 'Bloxingbad map reference',
      },
    ],
  },
  {
    period: '2023 — 2025',
    role: 'Backend Developer',
    org: 'Freelance',
    desc: 'Built custom Telegram and Discord bots for moderation, community management, automation, and game server integration. Focused on reliable, self-hosted solutions using Python and Node.js.',
    highlights: [
      'Self-hosted, reliable bot infrastructure',
      'Moderation & community management flows',
      'Game-server integration tooling',
    ],
    tech: ['Python', 'Node.js', 'Telegram Bot API', 'Discord API'],
    gallery: [
      { src: '/images/demonstration/kanban-demo.png', alt: 'Kanban workflow automation demo' },
      { src: '/images/demonstration/me-coding-demo.png', alt: 'Coding session demo' },
    ],
  },
  {
    period: '2025 — 2026',
    role: 'Backend Developer',
    org: 'Banking Application Simulation (Team Project)',
    desc: 'Developed backend for a simulated banking system as part of a team project. Designed and implemented REST API endpoints for accounts, transactions, transfers, and user management. Worked on business logic, data validation, error handling, and wrote comprehensive unit tests.',
    highlights: [
      'REST API — accounts, transactions, transfers, users',
      'Business logic, validation, error handling',
      'Comprehensive unit test suite',
    ],
    tech: ['Node.js', 'Express', 'REST'],
    gallery: [
      {
        src: '/images/demonstration/jetbrains-ai-use-demo.png',
        alt: 'IDE workflow demo',
      },
      { src: '/media/projects/bloxingbad/images/code-structure.png', alt: 'Code structure' },
      { src: '/media/projects/bloxingbad/images/jira-integration.png', alt: 'Jira integration' },
    ],
  },
  {
    period: '2026',
    role: 'Diploma Project — Nexagon',
    org: 'Software Engineering Bachelor',
    desc: 'Created Nexagon, a platform for monitoring and managing game servers. Features real-time tracking, server management tools, and planned hosting integration. Served as the thesis project for my Professional Junior Bachelor degree.',
    highlights: [
      'Real-time game-server monitoring',
      'Server management & RCON tooling',
      'Hosting integration on the roadmap',
    ],
    tech: ['TypeScript', 'Node.js', 'WebSocket', 'React'],
    link: '/projects/nexagon',
    linkText: 'see nexagon',
    gallery: [
      { src: '/media/projects/nexagon/images/nexagon_monitor.png', alt: 'Nexagon server monitor' },
      { src: '/media/projects/nexagon/images/nexagon_createServer.png', alt: 'Add server flow' },
      { src: '/media/projects/nexagon/images/nexagon_rcon.png', alt: 'RCON console' },
      { src: '/media/projects/nexagon/images/nexagon_result.png', alt: 'Nexagon live tracking result' },
    ],
  },
];

export { experienceData, type ExperienceEntry };