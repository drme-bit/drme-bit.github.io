/*  Résumé data — sourced from public/resume/Vyacheslav_Tkachyk_Resume.pdf.
    Single source of truth for hero & about content derived from the actual PDF. */

export const RESUME_FILE = '/resume/Vyacheslav_Tkachyk_Resume.pdf';

export interface ResumeSkillGroup {
  label: string;
  skills: string[];
}

export interface ResumeTimelineItem {
  period: string;
  title: string;
  org: string;
  detail: string;
  stack?: string[];
}

export const resume = {
  name: 'Vyacheslav Tkachyk',
  role: 'Full-Stack Developer',
  stack: ['React', 'Three.js', 'Rust', 'Node.js'],
  headline: 'Full-Stack Developer · React / Three.js / Rust / Node.js',
  location: 'Odesa, Ukraine',
  email: 'vacheslavtkachik@gmail.com',
  summary:
    'Full-stack software engineer from Ukraine with ~5 years of hands-on coding experience across web, backend, and game-server tooling. Recently completed a Professional Junior Bachelor’s degree in Software Engineering, with a thesis project (Nexagon) covering real-time monitoring systems built on Rust, React, WebGPU and WASM.',
  skills: [
    {
      label: 'Languages',
      skills: ['TypeScript', 'JavaScript', 'Rust', 'Python', 'Luau', 'SCSS', 'C', 'C++', 'C#'],
    },
    { label: 'Frontend', skills: ['React', 'Three.js', 'Vite', 'Next.js', 'Lenis', 'GSAP'] },
    { label: 'Backend / Infra', skills: ['Node.js', 'Docker', 'PostgreSQL', 'Redis', 'Git', 'Linux'] },
    {
      label: 'Other',
      skills: ['REST API', 'gRPC', 'WebSocket', 'CI/CD (Jenkins)', 'Kubernetes', 'HashiCorp Vault', 'Bots'],
    },
  ],
  timeline: [
    {
      period: '2021 — now',
      title: 'Freelance Developer',
      org: 'Self-Employed',
      detail:
        'Custom software for clients: Roblox experiences (2,000+ daily players), moderation bots, and full-stack web apps — owned end-to-end.',
      stack: ['Luau', 'Python', 'React', 'Node.js'],
    },
    {
      period: '2023 — 2025',
      title: 'Backend Developer',
      org: 'Freelance',
      detail: 'Telegram & Discord bots for moderation, community management, automation and game-server integration.',
      stack: ['Python', 'Node.js'],
    },
    {
      period: '2025 — 2026',
      title: 'Banking App Simulation',
      org: 'Team Project',
      detail: 'REST API for accounts, transactions, transfers and user management — business logic, validation, tests.',
      stack: ['REST', 'Node.js'],
    },
    {
      period: '2026',
      title: 'BSc · Software Engineering',
      org: 'Thesis: Nexagon',
      detail: 'Capstone — a platform for monitoring and managing game servers with real-time metrics and alerts.',
      stack: ['Rust', 'React', 'WebGPU', 'WASM'],
    },
  ],
  projects: {
    nexagon: {
      title: 'Nexagon',
      tagline: 'Game server monitoring platform',
      detail:
        'Administer and monitor game servers with real-time metrics, WebSocket streaming, WebGPU-accelerated visualizations and WASM-powered client-side processing.',
      stack: ['Rust', 'TypeScript', 'React', 'Docker', 'Redis'],
      link: 'https://gitlab.com/nxgon',
    },
  },
} as const;
