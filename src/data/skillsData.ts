import {
  SiReact, SiTypescript, SiJavascript, SiHtml5, SiSass,
  SiThreedotjs, SiNodedotjs, SiPython, SiGo, SiRust,
  SiPostgresql, SiRedis, SiGit, SiDocker,
  SiOpengl, SiLinux,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { FiCode, FiCpu } from 'react-icons/fi';
import type { IconType } from 'react-icons';

/* ─── Types ──────────────────────────────────────────────── */

export interface SkillItem {
  name: string;
  group: 'frontend' | 'backend' | 'tools';
  level: number;
  desc: string;
  funLevel: string;
  related: string[];
  projects: string[];
}

/* ─── Data ───────────────────────────────────────────────── */

export const GROUP_COLORS: Record<string, string> = {
  frontend: 'var(--accent)',
  backend: 'var(--accent-secondary)',
  tools: 'var(--accent-tertiary)',
};

export const ICON_MAP: Record<string, IconType> = {
  React: SiReact, TypeScript: SiTypescript, JavaScript: SiJavascript,
  'HTML/CSS': SiHtml5, SCSS: SiSass, 'Three.js': SiThreedotjs,
  R3F: FiCode, 'Node.js': SiNodedotjs, Python: SiPython,
  Go: SiGo, Rust: SiRust, Java: DiJava,
  PostgreSQL: SiPostgresql, Redis: SiRedis,
  Git: SiGit, Docker: SiDocker,
  WebGPU: FiCode,
  CUDA: FiCpu, OpenGL: SiOpengl, Linux: SiLinux,
  C: FiCode, 'C++': FiCode, 'C#': FiCode, Luau: FiCode,
};

export const SKILLS_DATA: SkillItem[] = [
  {
    name: 'React',
    group: 'frontend',
    level: 4,
    desc: 'Component-driven UIs with hooks, context, and state machines.',
    funLevel: 'can build a SPA before coffee gets cold',
    related: ['TypeScript', 'JavaScript', 'R3F'],
    projects: ['nexagon'],
  },
  {
    name: 'TypeScript',
    group: 'frontend',
    level: 4,
    desc: 'Type-safe JavaScript for maintainable large-scale apps.',
    funLevel: 'types everything, even the types',
    related: ['React', 'JavaScript', 'Node.js'],
    projects: ['roblox-systems'],
  },
  {
    name: 'JavaScript',
    group: 'frontend',
    level: 5,
    desc: 'Core language of the web — ES6+ features and async patterns.',
    funLevel: 'speaks fluent callback',
    related: ['TypeScript', 'React', 'Node.js'],
    projects: [],
  },
  {
    name: 'HTML/CSS',
    group: 'frontend',
    level: 5,
    desc: 'Semantic markup, responsive layouts, and modern CSS.',
    funLevel: 'can center a div (finally)',
    related: ['SCSS'],
    projects: ['nexagon'],
  },
  {
    name: 'SCSS',
    group: 'frontend',
    level: 4,
    desc: 'SASS-powered stylesheets with variables, mixins, and nesting.',
    funLevel: 'nests CSS like inception',
    related: ['HTML/CSS'],
    projects: [],
  },
  {
    name: 'Three.js',
    group: 'frontend',
    level: 3,
    desc: 'WebGL 3D rendering, shaders, and interactive scenes.',
    funLevel: 'makes triangles dance on screen',
    related: ['R3F', 'WebGPU', 'JavaScript'],
    projects: ['nexagon'],
  },
  {
    name: 'R3F',
    group: 'frontend',
    level: 3,
    desc: 'React-three-fiber — declarative Three.js in React.',
    funLevel: 'declarative 3D without the headaches',
    related: ['Three.js', 'React'],
    projects: [],
  },
  {
    name: 'C/C++',
    group: 'frontend',
    level: 4,
    desc: 'Systems programming and performance-critical applications.',
    funLevel: 'segfaults with confidence',
    related: ['C#'],
    projects: [],
  },
  {
    name: 'C#',
    group: 'frontend',
    level: 3,
    desc: 'Modern, type-safe language for Windows and cross-platform development.',
    funLevel: 'writes code that compiles on the third try',
    related: ['C/C++'],
    projects: [],
  },
  {
    name: 'Node.js',
    group: 'backend',
    level: 4,
    desc: 'Server-side JS runtime for APIs and tooling.',
    funLevel: 'npm install solves 90% of problems',
    related: ['TypeScript', 'JavaScript', 'PostgreSQL', 'Redis'],
    projects: ['nexagon'],
  },
  {
    name: 'Python',
    group: 'backend',
    level: 3,
    desc: 'Scripting, automation, and backend services.',
    funLevel: 'imports their way to victory',
    related: ['Docker', 'Linux'],
    projects: [],
  },
  {
    name: 'Go',
    group: 'backend',
    level: 2,
    desc: 'Performant, concurrent systems and CLI tools.',
    funLevel: 'goroutines go brrr',
    related: ['Docker', 'Linux'],
    projects: [],
  },
  {
    name: 'Rust',
    group: 'backend',
    level: 4,
    desc: 'Memory-safe systems programming with zero-cost abstractions.',
    funLevel: 'fights the borrow checker daily',
    related: ['WebGPU', 'Linux'],
    projects: ['nexagon'],
  },
  {
    name: 'Java',
    group: 'backend',
    level: 2,
    desc: 'Enterprise-grade applications and Android development.',
    funLevel: 'writes once, debugs everywhere',
    related: ['PostgreSQL'],
    projects: ['bank-rest-api-app'],
  },
  {
    name: 'PostgreSQL',
    group: 'backend',
    level: 3,
    desc: 'Relational databases with advanced querying.',
    funLevel: 'SELECT wisdom FROM brain WHERE skill = 3',
    related: ['Node.js', 'Redis'],
    projects: ['nexagon'],
  },
  {
    name: 'Redis',
    group: 'backend',
    level: 3,
    desc: 'In-memory caching and pub/sub messaging.',
    funLevel: 'things go fast when you forget them',
    related: ['Node.js', 'PostgreSQL'],
    projects: ['nexagon'],
  },
  {
    name: 'Luau',
    group: 'backend',
    level: 4,
    desc: 'Scripting language for Roblox game development.',
    funLevel: 'makes Roblox do things it shouldnt',
    related: ['TypeScript'],
    projects: ['roblox-systems'],
  },
  {
    name: 'Git',
    group: 'tools',
    level: 4,
    desc: 'Version control and collaborative development workflows.',
    funLevel: 'git push --force is a lifestyle',
    related: ['Linux'],
    projects: ['nexagon', 'roblox-systems', 'bank-rest-api-app'],
  },
  {
    name: 'Docker',
    group: 'tools',
    level: 3,
    desc: 'Containerized deployment and reproducible environments.',
    funLevel: 'works on my container',
    related: ['Linux', 'Node.js'],
    projects: ['nexagon', 'bank-rest-api-app'],
  },
  {
    name: 'WebGPU',
    group: 'tools',
    level: 2,
    desc: 'Next-gen GPU compute and rendering API.',
    funLevel: 'future-proofing one API call at a time',
    related: ['Rust', 'Three.js'],
    projects: ['nexagon'],
  },
  {
    name: 'CUDA',
    group: 'tools',
    level: 1,
    desc: 'Parallel GPU computing for ML and simulation.',
    funLevel: 'melts GPUs for fun',
    related: ['C/C++'],
    projects: [],
  },
  {
    name: 'OpenGL',
    group: 'tools',
    level: 2,
    desc: 'Cross-platform 2D/3D graphics API.',
    funLevel: 'deprecated but still standing',
    related: ['C/C++', 'Three.js'],
    projects: [],
  },
  {
    name: 'Linux',
    group: 'tools',
    level: 4,
    desc: 'Daily driver OS — shell, containers, and servers.',
    funLevel: 'arch btw',
    related: ['Docker', 'Git', 'Node.js'],
    projects: ['nexagon', 'bank-rest-api-app'],
  },
];
