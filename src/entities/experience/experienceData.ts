/*  Data ─ */
interface ExperienceEntry {
  period: string;
  role: string;
  org: string;
  desc: string;
  tech?: string[];
  link?: string;
  linkText?: string;
}

//TODO: write down a source codes linksand more detailed descriptions

const experienceData: ExperienceEntry[] = [
  {
    period: '2021 — present',
    role: 'Freelance Developer',
    org: 'Self-Employed',
    desc: 'Built custom software solutions for clients across multiple platforms. Developed Roblox experiences (anime games, trading economies, horror titles) serving 2000+ daily players with admin panels, vehicle systems, and anti-cheat. Created Telegram/Discord bots for moderation, automation, and community management. Delivered backend APIs and full-stack web apps tailored to client needs. Managed all aspects: requirements gathering, architecture, development, deployment, and maintenance.',
    tech: ['Luau', 'TypeScript', 'Python', 'Node.js', 'MySQL'],
  },
  {
    period: '2023 — 2025',
    role: 'Backend Developer',
    org: 'Freelance',
    desc: 'Built custom Telegram and Discord bots for moderation, community management, automation, and game server integration. Focused on reliable, self-hosted solutions using Python and Node.js.',
  },
  {
    period: '2025 — 2026',
    role: 'Backend Developer',
    org: 'Banking Application Simulation (Team Project)',
    desc: 'Developed backend for a simulated banking system as part of a team project. Designed and implemented REST API endpoints for accounts, transactions, transfers, and user management. Worked on business logic, data validation, error handling, and wrote comprehensive unit tests. Used Node.js / Express (or Python/FastAPI — укажи стек).',
  },
  {
    period: '2026',
    role: 'Diploma Project — Nexagon',
    org: 'Software Engineering Bachelor',
    desc: 'Created Nexagon, a platform for monitoring and managing game servers. Features real-time tracking, server management tools, and planned hosting integration. Served as the thesis projects for my Professional Junior Bachelor degree.',
  },
];

export { experienceData, type ExperienceEntry };