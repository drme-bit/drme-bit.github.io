import { createProject } from './helpers';

export default createProject({
  id: 'gmod-roblox',
  title: 'Project: GMod — Roblox',
  url: 'https://www.roblox.com/share?code=d02d21c36d98d342aae399f85b31f45e&type=ExperienceDetails&stamp=1785330199363',
  repo: '',
  desc: 'An early Roblox sandbox game inspired by Garry\'s Mod. Multiple game modes (FFA, sandbox, battle), custom models, vehicles, and animations — built when I was still learning the basics.',
  fullDesc:
    'Project: GMod (PGM) was one of my first real Roblox projects, built from scratch when I was still '
    + 'figuring out game development. Inspired by Garry\'s Mod, it aimed to bring the sandbox experience '
    + 'to Roblox with multiple game modes — Free For All deathmatch with custom weapons and maps, '
    + 'a creative sandbox mode with building tools, and vehicle combat with battle drones.'
    + '\n\n'
    + 'Looking back, the code is held together by hope and bad practices. The architecture is monolithic, '
    + 'the networking is naive, and many features were duct-taped on as I went. But the game actually ran — '
    + 'players could join, fight, build, and break things. It taught me the fundamentals of game scripting '
    + 'in Luau, persistent state management with DataStore2, and real-time replication with BridgeNet2. '
    + 'It\'s the definition of "you have to start somewhere."',
  tech: ['Luau', 'BridgeNet2', 'DataStore2'],
  status: 'DEPRECATED',
  logo: '/media/projects/project-gmod/logo/pgm-logo.jpg',
  image: '/media/projects/project-gmod/images/pgm_overview.png',
  images: [
    '/media/projects/project-gmod/images/pgm_overview.png',
    '/media/projects/project-gmod/images/pgm_sandbox.png',
    '/media/projects/project-gmod/images/pgm_model.png',
    '/media/projects/project-gmod/images/pgm-FFA.jpg',
    '/media/projects/project-gmod/images/pgm-FFA-awp-map.jpg',
    '/media/projects/project-gmod/images/pgm-battle-drone.jpg',
  ],
  video: '/media/projects/project-gmod/videos/pickaxe-showcase.mp4',
  stages: [
    {
      title: 'Sandbox & Core Mechanics',
      duration: 'Phase 1',
      desc: 'Built the sandbox foundation — player tools, physics objects, building system with weld/constraint mechanics, and a custom spawn menu. Everything powered by spaghetti Luau scripts.',
    },
    {
      title: 'Free For All Mode',
      duration: 'Phase 2',
      desc: 'Implemented FFA deathmatch with custom weapons (AWPs, pickaxes), multiple maps, kill tracking, and respawn system. Basic leaderboard and score display.',
    },
    {
      title: 'Vehicles & Custom Content',
      duration: 'Phase 2',
      desc: 'Added battle drones with mounted weapons, custom 3D models, player animations (running, tool equip), and a model preview system.',
    },
    {
      title: 'Persistence & Networking',
      duration: 'Phase 3',
      desc: 'Integrated DataStore2 for player data persistence and BridgeNet2 for real-time state sync. Set up basic admin tools and moderation commands via Cmdr.',
    },
  ],
  features: [
    'Free For All deathmatch with custom weapons and maps',
    'Sandbox mode with building tools and physics objects',
    'Battle drones with mounted weapons',
    'Custom 3D models and player animations',
    'Persistent player data via DataStore2',
    'Real-time state sync with BridgeNet2',
    'Custom spawn menu and admin tools',
  ],
  architecture: 'Monolithic Roblox game with a single DataModel structure. Luau scripts power all game logic, with BridgeNet2 handling client-server replication and DataStore2 for persistent player data. The "architecture" here is mostly learning how not to structure a game.',
  challenges: 'Everything. I had no experience with game architecture, no understanding of networking patterns, and no concept of code organization. The game worked in small demos but scaling to a full experience revealed every design flaw. Still, it shipped, it ran, and I learned more from this project than from any tutorial.',
  plans: 'None — this project is a time capsule of early development. It stays as a marker of how far things have come.',
});
