import { FiCode, FiMonitor } from 'react-icons/fi';

export const PROJECTS = [
  {
  id: 'nexagon',

  title: 'Nexagon — Distributed Game Infrastructure Platform',

  url: 'https://www.blackvoxel.studio',

  repo: 'https://gitlab.com/nxgon',

  desc:
    'A production-oriented platform for centralized game server management, infrastructure monitoring and secure remote administration built around a distributed microservice architecture.',

  fullDesc:
    'Nexagon is a modern distributed platform designed to simplify the management of dedicated game server infrastructure. '
    + 'Instead of relying on multiple disconnected tools for monitoring, administration, authentication and deployment, '
    + 'Nexagon provides a unified ecosystem where administrators can monitor infrastructure in real time, manage organizations, '
    + 'deploy monitoring agents, execute remote commands, inspect audit logs and control multiple game servers from a single interface.\n\n'

    + 'The platform is built around a scalable Rust microservice architecture where every business domain is isolated into independent services communicating through gRPC. '
    + 'The frontend is implemented as several React applications, while lightweight monitoring agents continuously collect infrastructure telemetry from remote servers.\n\n'

    + 'Security is treated as a first-class concern throughout the entire system. '
    + 'Authentication is implemented using JWT access and refresh tokens, passwords are protected with Argon2id, '
    + 'sessions are managed through Redis, secrets are stored in HashiCorp Vault, and organizations are isolated using a fine-grained permission model supporting over thirty individual permissions.\n\n'

    + 'Beyond administration features, the project also demonstrates modern DevOps practices including Docker containerization, Kubernetes deployments, GitOps workflows with ArgoCD, automated CI/CD pipelines through Jenkins, centralized logging, distributed service communication and production-ready deployment strategies.',

  tech: [
    'Rust',
    'Tokio',
    'Axum',
    'React',
    'TypeScript',
    'Vite',
    'gRPC',
    'Protocol Buffers',
    'PostgreSQL',
    'SQLx',
    'Redis',
    'RabbitMQ',
    'Docker',
    'Kubernetes',
    'HashiCorp Vault',
    'Jenkins',
    'ArgoCD',
    'GitLab CI/CD'
  ],

  status: 'ACTIVE',

  image: '/projects_media/nexagon/slides/nexagon_main.png',

  images: [
      '/projects_media/nexagon/slides/nexagon_main.png'
  ],

  video: '/projects_media/nexagon/video/nexagon_demo.mov',
  presentation: {
    mode: 'compact',
  },
  facts: [
    { label: 'Role', value: 'Distributed platform' },
    { label: 'Focus', value: 'Infrastructure ops + telemetry' },
    { label: 'Model', value: 'Microservices + gRPC' },
  ],
  stages: [

{
title: 'Architecture & Domain Design',
duration: 'Phase 1',

desc:
'Designed the entire platform around Domain-Driven Design principles by separating business capabilities into independent microservices. '
+ 'Defined service boundaries, communication contracts, entity relationships, RBAC model, multi-tenancy support and database architecture before implementation.'
},

{
title: 'Core Backend',
duration: 'Phase 2',

desc:
'Implemented the backend ecosystem entirely in Rust using asynchronous Tokio runtime. '
+ 'Developed API Gateway, Authentication, Users, Organizations, Agents, Metrics, Notifications and Database services communicating through gRPC with Protocol Buffers.'
},

{
title: 'Monitoring Agent',
duration: 'Phase 3',

desc:
'Developed a lightweight cross-platform monitoring agent capable of securely connecting to the platform, '
+ 'streaming infrastructure telemetry, executing remote management commands, caching data during network interruptions and automatically reconnecting after failures.'
},

{
title: 'Workspace Applications',
duration: 'Phase 4',

desc:
'Built multiple React applications including the administrative workspace, authentication portal and public website. '
+ 'Implemented dashboards, organization management, server management, activity feeds, security settings and responsive user experience.'
},

{
title: 'Infrastructure & DevOps',
duration: 'Phase 5',

desc:
'Containerized every service with Docker, implemented automated build pipelines with Jenkins, GitOps deployment through ArgoCD and Kubernetes orchestration. '
+ 'Integrated HashiCorp Vault for secret management and Redis for distributed session storage.'
},

{
title: 'Testing & Optimization',
duration: 'Phase 6',

desc:
'Optimized inter-service communication, asynchronous processing and database performance. '
+ 'Implemented audit logging, permission validation, secure authentication flows and resilience against service failures.'
}

],
features: [

'Distributed Rust microservice architecture',

'Centralized game server administration',

'Cross-platform monitoring agent',

'Real-time infrastructure telemetry',

'CPU, RAM, Network and Player monitoring',

'Organization management',

'Multi-tenant infrastructure',

'Fine-grained RBAC authorization',

'JWT Authentication',

'Refresh token rotation',

'Argon2 password hashing',

'Redis session storage',

'HashiCorp Vault secret management',

'Remote server management',

'RCON command execution',

'Audit logging',

'Activity tracking',

'Notification service',

'gRPC internal communication',

'REST public APIs',

'RabbitMQ asynchronous messaging',

'Docker containerization',

'Kubernetes deployment',

'GitOps deployment strategy',

'CI/CD automation',

'Scalable PostgreSQL architecture'

],
architecture:

'Nexagon follows a production-oriented distributed architecture where each business domain is implemented as an independent Rust microservice. '
+ 'External clients communicate exclusively through an API Gateway responsible for authentication, authorization, request routing and rate limiting. '

+ 'Core backend services include Authentication, Users, Organizations, Agents, Metrics, Notifications and Database Service. '

+ 'Frontend applications interact with the platform via REST APIs while internal service communication relies on strongly typed gRPC interfaces generated from Protocol Buffers. '

+ 'Redis provides distributed caching and session storage, RabbitMQ enables asynchronous event processing, PostgreSQL stores relational data and historical metrics, while HashiCorp Vault securely manages secrets and credentials.'

+ 'Every component is containerized with Docker and deployed onto Kubernetes using GitOps principles implemented through ArgoCD and automated CI/CD pipelines.',
challenges:

'The largest engineering challenge was designing a platform that remains scalable while separating every business capability into independent services without sacrificing developer experience. '

+ 'Another significant challenge involved implementing a reliable monitoring agent capable of maintaining long-lived connections, handling temporary network failures, securely executing remote commands and continuously streaming telemetry.'

+ 'Building a flexible RBAC system supporting organization-level permissions required designing a permission model beyond traditional role-based access control.'

+ 'On the infrastructure side, creating an automated deployment pipeline with Docker, Kubernetes, Jenkins, ArgoCD and Vault demanded careful orchestration of service discovery, secrets management, configuration synchronization and deployment automation.',
plans:

'The platform continues evolving toward a complete infrastructure management ecosystem. Planned features include Prometheus integration, Grafana dashboards, OpenTelemetry tracing, Kubernetes autoscaling, distributed job scheduling, automatic game server deployment templates, plugin SDK for custom game integrations, public REST and gRPC SDKs, OAuth2/SSO authentication providers, WebSocket live updates and advanced analytics powered by historical infrastructure metrics.',
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        type: 'text',
        variant: 'lead',
        body: [
          'Nexagon is a production-oriented platform for centralized game server management, infrastructure monitoring, and secure remote administration.',
          'It is structured as a distributed system rather than a single dashboard, which makes the page a better fit for compact technical blocks instead of long narrative sections.',
        ],
      },
      {
        id: 'summary',
        label: 'Summary',
        type: 'stats',
        variant: 'compact',
        items: [
          { label: 'Backend', value: 'Rust microservices', note: 'Independent domains' },
          { label: 'Transport', value: 'gRPC + REST', note: 'Internal and external APIs' },
          { label: 'State', value: 'PostgreSQL + Redis', note: 'Data + cache layer' },
          { label: 'Ops', value: 'Docker + Kubernetes', note: 'Containerized deployment' },
        ],
      },
      {
        id: 'domains',
        label: 'Core Domains',
        type: 'grid',
        variant: 'dense',
        items: [
          {
            title: 'Authentication',
            body: 'JWT access and refresh flow, Argon2id password hashing, Redis-backed sessions, and secure gateway routing.',
            meta: 'identity layer',
          },
          {
            title: 'Monitoring',
            body: 'Agents stream infrastructure telemetry, handle reconnects, and keep the platform updated with live operational state.',
            meta: 'telemetry layer',
          },
          {
            title: 'Workspace',
            body: 'React applications for administrators: dashboards, organization management, server views, feeds, and settings.',
            meta: 'operator layer',
          },
          {
            title: 'Delivery',
            body: 'Docker, Jenkins, and ArgoCD provide the deployment path, while Vault and Kubernetes keep secrets and orchestration aligned.',
            meta: 'release layer',
          },
        ],
      },
      {
        id: 'composition',
        label: 'Composition',
        type: 'split',
        variant: 'balanced',
        columns: [
          {
            title: 'What the platform replaces',
            body: 'A scattered toolchain of monitoring panels, admin endpoints, and deployment scripts gets replaced by a single platform with clear service boundaries.',
          },
        ],
      },
      {
        id: 'snapshot',
        label: 'Architecture Snapshot',
        type: 'grid',
        variant: 'dense',
        items: [
          {
            title: 'Architecture',
            body: 'Microservices',
            meta: 'Domain-separated services',
          },
          {
            title: 'Backend',
            body: 'Rust + Tokio + Axum',
            meta: 'Async service layer',
          },
          {
            title: 'Frontend',
            body: 'React + TypeScript',
            meta: 'Workspace applications',
          },
          {
            title: 'Communication',
            body: 'REST • gRPC • RabbitMQ',
            meta: 'External and internal traffic',
          },
          {
            title: 'Infrastructure',
            body: 'Docker • Kubernetes',
            meta: 'Container orchestration',
          },
          {
            title: 'Security',
            body: 'JWT • Argon2 • Vault',
            meta: 'Auth + secrets',
          },
          {
            title: 'Database',
            body: 'PostgreSQL + Redis',
            meta: 'Persistent data + cache',
          },
          {
            title: 'Deployment',
            body: 'GitOps • Jenkins • ArgoCD',
            meta: 'Automated delivery',
          },
        ],
      },
      {
        id: 'scale',
        label: 'Project Scale',
        type: 'stats',
        variant: 'compact',
        items: [
          { label: 'Backend services', value: '8+', note: 'API Gateway + domains' },
          { label: 'Frontend apps', value: '3', note: 'Workspace + portal + public site' },
          { label: 'Monitoring agent', value: '1', note: 'Live telemetry collector' },
          { label: 'Database tables', value: '13', note: 'Core relational model' },
          { label: 'RBAC permissions', value: '30+', note: 'Fine-grained access model' },
          { label: 'CI/CD', value: 'Automated', note: 'Build, deploy, verify' },
          { label: 'Orchestration', value: 'Kubernetes', note: 'Runtime platform' },
          { label: 'Telemetry', value: 'Real-time', note: 'Infrastructure signals' },
        ],
      },
      {
        id: 'quote',
        label: 'Principle',
        type: 'quote',
        variant: 'accent',
        body: 'The product is designed around the idea that infrastructure should feel like a single system, not a pile of tools glued together.',
        byline: 'Nexagon design principle',
      },
      {
        id: 'next',
        label: 'Next',
        type: 'callout',
        variant: 'accent',
        calloutLabel: 'planned work',
        body: 'The next iteration focuses on observability, live dashboards, and better self-service workflows for operators.',
      },
      {
        id: 'architecture-details',
        label: 'Architecture Details',
        type: 'cards',
        variant: 'split',
        cards: [
          {
            title: 'Platform Composition',
            icon: FiCode,
            body: 'Nexagon follows a production-oriented distributed architecture where each business domain is implemented as an independent Rust microservice. External clients communicate exclusively through an API Gateway responsible for authentication, authorization, request routing and rate limiting.',
          },
          {
            title: 'Operational Pipeline',
            icon: FiMonitor,
            body: 'Containerized services are deployed with Docker and Kubernetes, while Jenkins and ArgoCD automate the delivery path. Redis handles distributed caching and session storage, PostgreSQL stores relational data, and Vault secures secrets and credentials.',
          },
        ],
      },
    ],
  },
  {
    id: 'roblox-systems',
    title: 'Freelance Roblox Developer',
    url: '#',
    desc: 'Custom Roblox systems for live communities: moderation tooling, gameplay systems, monetization logic, and persistence for servers serving 2000+ daily players.',
    fullDesc:
      'Self-employed developer building production systems for Roblox communities. '
      + 'Work centered on moderation tooling, command-driven admin panels, vehicle systems, inventory and economy systems, '
      + 'and long-lived persistence layers that keep player state consistent across sessions. '
      + 'The largest projects focused on live communities with roughly 2000+ daily active players, '
      + 'where stability, latency, and exploit resistance mattered as much as feature delivery. '
      + 'Technologies include Luau, TypeScript via roblox-ts, third-party networking and persistence frameworks, and Rojo for syncing with Git and GitHub.',
    tech: ['Luau', 'TypeScript', 'roblox-ts', 'Rojo', 'Networking frameworks', 'Persistence frameworks'],
    status: 'ACTIVE',
    image: null,
    images: [],
    video: '/projects_media/roblox_freelance/video/roblox_demo.mp4',
    presentation: {
      mode: 'compact',
    },
    facts: [
      { label: 'Role', value: 'Freelance Roblox systems developer' },
      { label: 'Focus', value: 'Moderation, economy, vehicles, anti-cheat' },
      { label: 'Scale', value: '2000+ daily players' },
    ],
    sections: [
      {
        id: 'overview',
        label: 'Overview',
        type: 'text',
        variant: 'lead',
        body: [
          'Freelance work for Roblox communities that needed more than scripted gameplay toys. The projects combined live moderation tools, persistent player systems, and operational controls for production servers.',
          'The goal was to keep the codebase practical for server operators while still supporting custom gameplay rules, monetization, and security checks under Roblox constraints.',
        ],
      },
      {
        id: 'scope',
        label: 'Scope',
        type: 'grid',
        variant: 'dense',
        items: [
          {
            title: 'Admin Panel',
            body: 'Real-time moderation UI with permission tiers, player lookups, command execution, and operator-friendly workflows.',
            meta: 'live operations',
          },
          {
            title: 'Economy',
            body: 'Currency handling, shops, transaction logging, and persistence rules designed to survive reconnects and server resets.',
            meta: 'monetization layer',
          },
          {
            title: 'Vehicles',
            body: 'Custom vehicle behavior with handling logic, damage states, fuel systems, and storage interactions.',
            meta: 'gameplay systems',
          },
          {
            title: 'Anti-Cheat',
            body: 'Server-side validation, anomaly checks, and automated penalties for exploit patterns seen in live communities.',
            meta: 'security layer',
          },
        ],
      },
      {
        id: 'stack',
        label: 'Stack & Runtime',
        type: 'split',
        variant: 'balanced',
        columns: [
          {
            title: 'Client and server code',
            body: 'Luau handled the Roblox runtime side, while roblox-ts was used where stronger structure and reuse helped larger systems stay maintainable.',
          },
          {
            title: 'Data and sync',
            body: 'RemoteEvents and RemoteFunctions connected client and server state, while third-party persistence frameworks handled durable records for inventory, economy, moderation, and progression data.',
          },
        ],
      },
      {
        id: 'scale',
        label: 'Scale',
        type: 'stats',
        variant: 'compact',
        items: [
          { label: 'Daily players', value: '2000+', note: 'Active community load' },
          { label: 'Core systems', value: '4+', note: 'Admin, economy, vehicles, anti-cheat' },
          { label: 'Persistence', value: 'External frameworks', note: 'Cross-session storage' },
          { label: 'Runtime', value: 'Luau', note: 'Roblox server/client layer' },
        ],
      },
      {
        id: 'constraints',
        label: 'Constraints',
        type: 'cards',
        variant: 'split',
        cards: [
          {
            title: 'Platform limits',
            body: 'Roblox imposes strict memory, networking, and execution constraints, so every system had to be lean, predictable, and resilient under load.',
          },
          {
            title: 'Exploit pressure',
            body: 'Anti-cheat rules had to evolve quickly because the exploit surface changes often in public Roblox communities.',
          },
        ],
      },
      {
        id: 'result',
        label: 'Result',
        type: 'callout',
        variant: 'accent',
        calloutLabel: 'delivery outcome',
        body: 'The final result was a set of reusable Roblox systems that kept live servers manageable, preserved player state, and supported ongoing community growth without adding operator overhead.',
      },
    ],
    stages: [
      {
        title: 'Admin Panel Framework',
        duration: 'Project 1',
        desc: 'Built a command-oriented admin panel with real-time moderation, permission tiers, player inspection, and operator actions exposed through a practical Roblox GUI layer.'
      },
      {
        title: 'Vehicle Systems',
        duration: 'Project 2',
        desc: 'Developed vehicle systems with custom handling, damage states, fuel use, repair loops, and inventory-backed storage and retrieval.'
      },
      {
        title: 'Economy & Inventory',
        duration: 'Project 3',
        desc: 'Created persistent inventory and economy systems with item categories, stacking, trade mechanics, currency management, shop flows, and framework-backed transaction logging.'
      },
      {
        title: 'Anti-Cheat & Security',
        duration: 'Ongoing',
        desc: 'Implemented server-side validation, anomaly detection, and automated ban workflows, then updated the rules as exploit methods changed.'
      },
      {
        title: 'Performance Optimization',
        duration: 'Ongoing',
        desc: 'Optimized Luau execution with memoization, object pooling, batched updates, and lightweight networking patterns to keep live servers stable.'
      }
    ],
    features: [
      'Real-time moderation panel with permission tiers',
      'Player lookup and command execution tools',
      'Custom vehicle handling and damage states',
      'Persistent inventory and economy logic',
      'Shop flows with transaction logging',
      'Server-side anti-cheat validation',
      'Framework-backed persistent storage',
      'Custom GUI systems for Roblox',
      'Operator workflows for live communities',
      'Performance-focused networking and update batching'
    ],
    architecture: 'The codebase was organized around self-contained runtime domains such as admin, vehicles, economy, inventory, and security. Client and server sync used Roblox RemoteEvents and RemoteFunctions, while roblox-ts helped keep larger systems readable and easier to reuse. Persistence was handled through third-party persistence frameworks for durable player state and moderation data, with Rojo used to keep the codebase aligned with Git and GitHub.',
    challenges: 'Roblox sandbox limits made memory, networking, and execution budgets tight, so the implementation had to stay lean. The anti-cheat layer also needed regular updates because exploit patterns changed quickly in public communities.',
    plans: 'A next step would be a shared library of reusable Roblox systems, plus a web dashboard for live analytics and moderation across multiple communities.'
  }
];

export function getProjectById(id) {
  return PROJECTS.find(p => p.id === id);
}

export function getProjectIndex(id) {
  return PROJECTS.findIndex(p => p.id === id);
}
