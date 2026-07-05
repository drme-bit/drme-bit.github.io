import { createProject } from './helpers';

export default createProject({
  id: 'nexagon',
  title: 'Nexagon — Game Servers Monitoring',
  url: 'https://www.blackvoxel.studio',
  repo: 'https://gitlab.com/nxgon',
  desc: 'Web-instrument made for admins to administrate and monitor game servers, with real-time metrics and alerts built in Rust, React, WebGPU and WASM.',
  fullDesc:
    'A comprehensive server administration dashboard that connects to game servers via WebSocket and displays real-time metrics including player count, '
    + 'CPU/RAM usage, map rotation, and event logs. The frontend is built with React and WebGPU for hardware-accelerated visualizations, '
    + 'while the backend is written in Rust for maximum performance and safety. WASM modules handle data parsing and compression client-side.',
tech: ['Rust', 'TypeScript', 'React', 'Vite', 'CI/CD', 'Docker', 'K8s', 'REST', 'gRPC(Tonic)', 'PostgreSQL(Neon)', 'Hashicorp Vault', 'RabbitMQ', 'Redis'],
  status: 'ACTIVE',
  logo: '/media/projects/nexagon/logos/nexagon_logo.svg',
  image: '/media/projects/nexagon/images/nexagon_main.png',
  images: [
    '/media/projects/nexagon/images/nexagon_main.png',
    '/media/projects/nexagon/images/nexagon_monitor.png',
    '/media/projects/nexagon/images/nexagon_createServer.png',
    '/media/projects/nexagon/images/nexagon_rcon.png',
    '/media/projects/nexagon/images/nexagon_result.png'
  ],
  video: '/media/projects/nexagon/videos/nexagon_demo.mov',
  stages: [
    {
      title: 'Backend Architecture & Protocol Design',
      duration: 'Week 1-2',
      desc: 'Designed the Rust backend with tokio async runtime for concurrent WebSocket connections. Implemented a custom binary protocol for efficient server-to-dashboard communication with minimal overhead.'
    },
    {
      title: 'Real-time Data Pipeline',
      duration: 'Week 3-4',
      desc: 'Built the data ingestion pipeline with WebSocket connections to game servers. Implemented metrics aggregation, event logging, and alert threshold detection. Created WASM modules for client-side data parsing and decompression.'
    },
    {
      title: 'Frontend Dashboard',
      duration: 'Week 5-7',
      desc: 'Developed the React frontend with WebGPU-accelerated visualizations for real-time metrics. Built the server management interface with player lists, map rotation controls, and command execution panel.'
    },
    {
      title: 'Alert System & Notifications',
      duration: 'Week 8',
      desc: 'Implemented configurable alert thresholds for server metrics (CPU, RAM, player count). Built notification system with in-dashboard alerts and optional webhook integrations for Discord and Slack.'
    },
    {
      title: 'Testing & Deployment',
      duration: 'Week 9',
      desc: 'Conducted load testing with simulated server farms. Deployed using Docker with CI/CD pipeline via GitLab. Set up monitoring and logging infrastructure with Prometheus and Grafana.'
    }
  ],
  features: [
    'Real-time server metrics with WebSocket streaming',
    'WebGPU-accelerated data visualizations',
    'WASM-powered client-side data processing',
    'Configurable alert thresholds with multi-channel notifications',
    'Multi-server management dashboard',
    'Player list with moderation actions',
    'Map rotation and server command execution',
    'Historical metrics with time-range queries',
    'Discord/Slack webhook integration',
    'Docker deployment with CI/CD'
  ],
  architecture: 'Rust backend using tokio async runtime with WebSocket endpoints for real-time communication. React frontend with WebGPU for hardware-accelerated chart rendering. WASM modules (compiled from Rust) handle data parsing and decompression client-side. PostgreSQL for historical metrics storage. Docker containers orchestrated via docker-compose with Prometheus monitoring.',
  challenges: 'Handling WebSocket reconnection gracefully under network interruptions was critical for production reliability. WebGPU API limitations required creative fallbacks for browsers without support. Optimizing WASM binary size while maintaining parsing performance needed careful profiling and dead-code elimination.',
  plans: 'Add Kubernetes support for horizontal scaling, implement custom dashboard widgets with drag-and-drop, add SSO integration with OAuth2 providers, and build a public API for third-party integrations. Explore eBPF for deeper server metrics collection.'
});
