import { createProject } from './helpers';

export default createProject({
  id: 'fivem-roblox',
  title: 'Freelance Roblox Developer',
  url: '#',
  desc: 'Custom game mechanics, admin panels, and monetization systems for Roblox and FiveM communities serving 2000+ daily players.',
  fullDesc:
    'Self-employed developer creating custom game systems for Roblox and FiveM/RedM communities. '
    + 'Developed admin panels with real-time player moderation, custom vehicle systems with advanced physics, '
    + 'inventory and economy frameworks with persistent data storage, and anti-cheat detection systems. '
    + 'Optimized server performance for communities averaging 2000+ daily active players. '
    + 'Technologies include Luau, TypeScript (roblox-ts), MySQL, and FiveM Lua scripting with native code integration.',
  tech: ['Luau', 'TypeScript', 'roblox-ts', 'ByteNet', 'Rojo', 'DataStore2', 'Roact'],
  status: 'ACTIVE',
  logo: '/media/projects/roblox/logos/roblox_logo.svg',
  image: '/media/projects/roblox/images/pgm_overview.png',
  images: [
    '/media/projects/roblox/images/pgm_overview.png',
    '/media/projects/roblox/images/pgm_model.png',
    '/media/projects/roblox/images/pgm_sandbox.png',
    '/media/projects/roblox/images/vault_overview.png',
    '/media/projects/roblox/images/garden_vs_brainrot.png',
  ],
  video: '/media/projects/roblox/videos/roblox_demo.mp4',
  stages: [
    {
      title: 'Admin Panel Framework',
      duration: 'Project 1',
      desc: 'Built a comprehensive admin panel with real-time player moderation, permission tiers, and command execution. Implemented UI using Roblox\'s built-in GUI system with data binding to backend services.'
    },
    {
      title: 'Vehicle Systems',
      duration: 'Project 2',
      desc: 'Developed custom vehicle physics with realistic handling, fuel consumption, damage modeling, and repair mechanics. Integrated with the inventory system for vehicle storage and retrieval.'
    },
    {
      title: 'Economy & Inventory',
      duration: 'Project 3',
      desc: 'Created a persistent inventory framework with item categories, stacking, and trade mechanics. Built the economy system with currency management, shop UIs, and transaction logging to MySQL.'
    },
    {
      title: 'Anti-Cheat & Security',
      duration: 'Ongoing',
      desc: 'Implemented multi-layered anti-cheat detection including server-side validation, anomaly detection, and automated ban systems. Regular updates to counter new exploit methods.'
    },
    {
      title: 'Performance Optimization',
      duration: 'Ongoing',
      desc: 'Optimized Lua execution with memoization, object pooling, and efficient networking. Reduced server tick consumption by 40% through batched updates and lazy evaluation patterns.'
    }
  ],
  features: [
    'Real-time admin panel with permission tiers',
    'Custom vehicle physics with damage modeling',
    'Persistent inventory with trade mechanics',
    'Economy system with transaction logging',
    'Multi-layered anti-cheat detection',
    'Server performance optimization (40% tick reduction)',
    'MySQL-backed persistent storage',
    'Custom GUI systems for Roblox and FiveM',
    'Player moderation tools',
    'Community management features'
  ],
  architecture: 'Modular Lua/Luau codebase organized into self-contained services (Admin, Vehicle, Economy, Inventory). Communication via Roblox RemoteEvents/RemoteFunctions for client-server sync. FiveM projects use native Lua integration with MySQL Connector for persistent data. TypeScript via roblox-ts for type safety in larger codebases. Code is structured with dependency injection for testability.',
  challenges: 'Roblox\'s sandboxed environment imposed strict memory and execution limits, requiring aggressive optimization. FiveM native code integration required deep understanding of the game engine internals. Anti-cheat systems needed constant updates as exploit methods evolved rapidly in the modding community.',
  plans: 'Develop a shared library of reusable game systems across Roblox and FiveM. Build a web dashboard for real-time analytics across all active communities. Add support for new platforms as they emerge in the ecosystem.'
});
