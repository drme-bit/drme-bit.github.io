/* ─── Data ───────────────────────────────────────────────── */
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
    role: 'Roblox Developer (Freelance)',
    org: 'Roblox Talents',
    desc: 'Developed multiple commission-based experiences on Roblox across various genres. Created anime-themed games (JoJo’s Bizarre Adventure, One Piece inspired), a full item trading economy system, and the horror game "Vault 8166" (creepypasta style). Implemented complex gameplay mechanics, server-side logic, data management, monetization systems, and optimized performance using Luau.',
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