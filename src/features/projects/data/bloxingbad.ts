import { createProject } from './helpers';

export default createProject({
  id: 'bloxingbad',
  title: 'BloxingBad',
  url: 'https://github.com/BlackVoxel-Studio/BloxingBad',
  repo: 'https://github.com/BlackVoxel-Studio/BloxingBad',
  desc: 'A competitive boxing game on Roblox with combo-based combat, matchmaking, and a full UI built with Roact. Currently on hold.',
  fullDesc:
    'BloxingBad was an ambitious attempt to build a competitive boxing game on Roblox, featuring real-time '
    + 'PvP combat, combo chains, dodging mechanics, and a polished Roact-driven UI. '
    + 'The project was developed under the BlackVoxel Studio banner and represented a significant step up in '
    + 'code architecture compared to earlier Roblox work.'
    + '\n\n'
    + 'The dependency stack reflects a more structured approach:'
    + '\n'
    + '• Cmdr — in-game console and administrative commands with autocomplete\n'
    + '• Roact — component-based UI framework (React paradigm on Roblox)\n'
    + '• Promise — async patterns for clean networking and data flow\n'
    + '• TopbarPlus — consistent topbar icons and menus\n'
    + '• ByteNet — fast, type-safe networking library\n'
    + '• DataStore2 — persistent player data (rank, stats, unlocks)\n'
    + '\n'
    + 'Development was paused due to shifting priorities and the complexity of balancing real-time combat '
    + 'on the Roblox engine. The repository remains private as a reference for future Roblox projects.',
  tech: ['Luau', 'Cmdr', 'Roact', 'Promise', 'TopbarPlus', 'ByteNet', 'DataStore2'],
  status: 'PAUSED',
  logo: null,
  image: '/media/projects/bloxingbad/images/code-structure.png',
  images: [
    '/media/projects/bloxingbad/images/code-structure.png',
    '/media/projects/bloxingbad/images/jira-integration.png',
    '/media/projects/bloxingbad/images/map-ideas.png',
    '/media/projects/bloxingbad/images/map-reference.png',
  ],
  video: null,
  stages: [
    {
      title: 'Core Combat System',
      duration: 'Phase 1',
      desc: 'Implemented the boxing mechanics — punches, blocks, dodges, stamina management, and combo detection. Built on ByteNet for low-latency state replication.',
    },
    {
      title: 'UI & Match Flow',
      duration: 'Phase 2',
      desc: 'Designed the full UI layer with Roact components: main menu, character select, HUD, and post-match results. TopbarPlus for navigation menus.',
    },
    {
      title: 'Matchmaking & Persistence',
      duration: 'Phase 2',
      desc: 'Set up DataStore2 for player profiles, ELO tracking, and unlockable cosmetics. Cmdr-powered admin panel for testing and moderation.',
    },
    {
      title: 'Polish & Balancing',
      duration: 'Phase 3 (incomplete)',
      desc: 'Started balancing combat timings, network interpolation, and anti-cheat measures. Development was suspended before this phase was completed.',
    },
  ],
  features: [
    'Real-time PvP boxing with combo system',
    'Roact-driven UI (menus, HUD, match flow)',
    'Matchmaking with ELO-based ranking',
    'Player profiles with persistent stats and cosmetics',
    'In-game admin console via Cmdr',
    'Low-latency networking with ByteNet',
    'Topbar navigation with TopbarPlus',
  ],
  architecture: 'Roblox game built with Luau as the scripting language. The UI layer uses Roact (React-inspired component model) for reactive interfaces. ByteNet handles client-server networking with type safety and minimal latency. DataStore2 manages persistent player profiles and rankings. Cmdr provides the administrative command framework. TopbarPlus manages the topbar icon and menu system.',
  challenges: 'Real-time combat on Roblox is inherently tricky — network latency, character ragdoll inconsistencies, and the engine\'s physics limitations made precise hit detection and responsive dodging difficult to tune. Balancing the combo system so it felt skill-based rather than spammy required constant iteration. The project ultimately went on hold because the time needed to polish the combat to a competitive standard exceeded available bandwidth.',
  plans: 'The repository is preserved privately. If Roblox\'s physics and networking capabilities continue to improve, BloxingBad might see a revival. For now, it serves as a reference architecture for structured Roblox development.',
});
