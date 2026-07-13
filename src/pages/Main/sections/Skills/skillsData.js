import {
  SiReact, SiTypescript, SiJavascript, SiHtml5, SiSass,
  SiThreedotjs, SiNodedotjs, SiPython, SiGo, SiRust,
  SiPostgresql, SiRedis, SiGit, SiDocker,
  SiOpengl, SiLinux,
} from 'react-icons/si';
import { DiJava } from 'react-icons/di';
import { FiCode, FiCpu } from 'react-icons/fi';

const GROUP_COLORS = {
  frontend: 'var(--accent)',
  backend: 'var(--accent-secondary)',
  tools: 'var(--accent-tertiary)',
};

const ICON_MAP = {
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

const SKILLS_DATA = [
  { name: 'React', group: 'frontend', level: 4, desc: 'Component-driven UIs with hooks, context, and state machines.', related: ['TypeScript', 'JavaScript', 'R3F'], projects: ['drme-bit.github.io', 'nexagon'] },
  { name: 'TypeScript', group: 'frontend', level: 4, desc: 'Type-safe JavaScript for maintainable large-scale apps.', related: ['React', 'JavaScript', 'Node.js'], projects: ['drme-bit.github.io', 'roblox-systems'] },
  { name: 'JavaScript', group: 'frontend', level: 5, desc: 'Core language of the web — ES6+ features and async patterns.', related: ['TypeScript', 'React', 'Node.js'], projects: ['drme-bit.github.io'] },
  { name: 'HTML/CSS', group: 'frontend', level: 5, desc: 'Semantic markup, responsive layouts, and modern CSS.', related: ['SCSS'], projects: ['drme-bit.github.io'] },
  { name: 'SCSS', group: 'frontend', level: 4, desc: 'SASS-powered stylesheets with variables, mixins, and nesting.', related: ['HTML/CSS'], projects: ['drme-bit.github.io'] },
  { name: 'Three.js', group: 'frontend', level: 3, desc: 'WebGL 3D rendering, shaders, and interactive scenes.', related: ['R3F', 'WebGPU', 'JavaScript'], projects: ['drme-bit.github.io'] },
  { name: 'R3F', group: 'frontend', level: 3, desc: 'React-three-fiber — declarative Three.js in React.', related: ['Three.js', 'React'], projects: ['drme-bit.github.io'] },
  { name: 'C/C++', group: 'frontend', level: 2, desc: 'Systems programming and performance-critical applications.', related: ['C#'], projects: [] },
  { name: 'C#', group: 'frontend', level: 2, desc: 'Modern, type-safe language for Windows and cross-platform development.', related: ['C/C++'], projects: [] },
  { name: 'Node.js', group: 'backend', level: 4, desc: 'Server-side JS runtime for APIs and tooling.', related: ['TypeScript', 'JavaScript', 'PostgreSQL', 'Redis'], projects: ['nexagon'] },
  { name: 'Python', group: 'backend', level: 3, desc: 'Scripting, automation, and backend services.', related: ['Docker', 'Linux'], projects: [] },
  { name: 'Go', group: 'backend', level: 2, desc: 'Performant, concurrent systems and CLI tools.', related: ['Docker', 'Linux'], projects: [] },
  { name: 'Rust', group: 'backend', level: 2, desc: 'Memory-safe systems programming with zero-cost abstractions.', related: ['WebGPU', 'Linux'], projects: ['nexagon'] },
  { name: 'Java', group: 'backend', level: 3, desc: 'Enterprise-grade applications and Android development.', related: [], projects: [] },
  { name: 'PostgreSQL', group: 'backend', level: 3, desc: 'Relational databases with advanced querying.', related: ['Node.js', 'Redis'], projects: ['nexagon'] },
  { name: 'Redis', group: 'backend', level: 2, desc: 'In-memory caching and pub/sub messaging.', related: ['Node.js', 'PostgreSQL'], projects: [] },
  { name: 'Luau', group: 'backend', level: 4, desc: 'Scripting language for Roblox game development.', related: ['TypeScript'], projects: ['roblox-systems'] },
  { name: 'Git', group: 'tools', level: 4, desc: 'Version control and collaborative development workflows.', related: ['Linux'], projects: ['drme-bit.github.io', 'nexagon'] },
  { name: 'Docker', group: 'tools', level: 3, desc: 'Containerized deployment and reproducible environments.', related: ['Linux', 'Node.js'], projects: ['nexagon'] },
  { name: 'WebGPU', group: 'tools', level: 2, desc: 'Next-gen GPU compute and rendering API.', related: ['Rust', 'Three.js'], projects: ['nexagon'] },
  { name: 'CUDA', group: 'tools', level: 1, desc: 'Parallel GPU computing for ML and simulation.', related: ['C/C++'], projects: [] },
  { name: 'OpenGL', group: 'tools', level: 2, desc: 'Cross-platform 2D/3D graphics API.', related: ['C/C++', 'Three.js'], projects: [] },
  { name: 'Linux', group: 'tools', level: 4, desc: 'Daily driver OS — shell, containers, and servers.', related: ['Docker', 'Git', 'Node.js'], projects: ['nexagon'] },
];

export { SKILLS_DATA, GROUP_COLORS, ICON_MAP };
