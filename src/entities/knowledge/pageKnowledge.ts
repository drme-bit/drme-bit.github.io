interface KnowledgeEntry {
  keywords: string[];
  priority?: number;
  answer: string;
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: [
      'what is this',
      'what is this site',
      'what is this website',
      'this site',
      'about this site',
      'tell me about this',
      'portfolio',
      '',
    ],
    priority: 1,
    answer:
      "This is Vyacheslav Tkachyk's personal portfolio — built with Next.js, React, TypeScript, Tailwind, SCSS, GSAP and Lenis. It has a scroll-driven projects section, an experience timeline, blog posts, a résumé page, and an Assistant in the right workspace panel.",
  },
  {
    keywords: [
      'who made',
      'who built',
      'who created',
      'creator',
      'author',
      'vyacheslav',
      'tkachyk',
      'tkachik',
      'drme-bit',
      'developer',
      'about you',
      'who is drme',
    ],
    priority: 2,
    answer:
      "Vyacheslav Tkachyk — also known as drme-bit and the brand Dr.ME — is a full-stack developer from Odesa, Ukraine. He works across web, backend, game-server tooling and 3D interfaces. He is the person behind this site; the Assistant is a separate AI helper.",
  },
  {
    keywords: [
      'mascot',
      'cat',
      'who are you',
      'what are you',
      'your name',
      'what is the assistant',
      'who is the assistant',
      'are you an ai',
      'are you a bot',
    ],
    priority: 3,
    answer:
      "I'm the Assistant — an AI helper embedded in Vyacheslav's portfolio. I'm not Vyacheslav, not Dr.ME, and not drme-bit. I answer questions about his work, projects, experience, writing and contact options, and I can link you to the relevant sections.",
  },
  {
    keywords: [
      'skills',
      'technologies',
      'tech stack',
      'what can you do',
      'languages',
      'stack',
      'know',
      'proficient',
      'experienced with',
    ],
    answer:
      "Vyacheslav works with TypeScript, JavaScript, Rust, Python, Luau, C/C++/C# and SCSS. Frontend: React, Next.js, Three.js, Vite, GSAP and Lenis. Backend and infrastructure: Node.js, REST, gRPC, WebSocket, PostgreSQL, Redis, Docker, Kubernetes, CI/CD, Linux and HashiCorp Vault. He also builds bots and game-server tooling.",
  },
  {
    keywords: [
      'projects',
      'work',
      'what have you built',
      'what did you make',
      'showcase',
      'portfolio projects',
      'nexagon',
      'bloxingbad',
      'gmod',
    ],
    answer:
      'Three featured projects: Nexagon — a game-server monitoring platform built with Rust, React, WebGPU and WASM, and his diploma thesis. BloxingBad — a competitive Roblox boxing game with combo combat and a Roact UI, currently on hold. Project: GMod — Roblox — an early Garry’s Mod-inspired sandbox with FFA, building tools and vehicles, now deprecated as a learning milestone.',
  },
  {
    keywords: [
      'experience',
      'job',
      'work history',
      'career',
      'background',
      'professional',
      'employment',
    ],
    answer:
      'Timeline highlights: freelance development since 2021 — Roblox experiences with 2,000+ daily players, Telegram/Discord bots, backend APIs and full-stack web apps. Backend work on a banking-app simulation (accounts, transactions, transfers, validation and tests) as a team project. Nexagon (2026) as his Professional Junior Bachelor thesis in Software Engineering.',
  },
  {
    keywords: ['contact', 'email', 'reach', 'get in touch', 'social', 'hire', 'message'],
    answer:
      "You can reach Vyacheslav at vacheslavtkachik@gmail.com, on LinkedIn, on Discord, or through the contact form in the Contact section. He's open to freelance work and interesting collaborations.",
  },
  {
    keywords: [
      'education',
      'study',
      'studying',
      'university',
      'college',
      'degree',
      'bachelor',
      'learn',
      'diploma',
    ],
    answer:
      "Vyacheslav completed a Professional Junior Bachelor's degree in Software Engineering in 2026. His diploma project was Nexagon — a game-server monitoring platform built with Rust, React, WebGPU and WASM.",
  },
  {
    keywords: ['location', 'where are you', 'based', 'live', 'country', 'timezone'],
    answer: 'Based in Odesa, Ukraine (GMT+3), working remotely and freelancing.',
  },
  {
    keywords: ['globe', '3d globe', 'skills globe', 'sphere', '3d skills', 'terrain', 'background'],
    answer:
      'The 3D globe and terrain experiments are no longer part of the site. Dark themes keep a restrained starfield that shifts subtly with pointer movement.',
  },
  {
    keywords: ['timeline', 'experience timeline', 'scroll timeline', 'beam', 'rail'],
    answer:
      'The Experience section is a scroll-driven timeline: a glowing beam fills as you scroll, sticky period titles ride along, and a time rail on the right tracks where you are.',
  },
  {
    keywords: ['terminal', 'hero', 'whoami', 'crt', 'scanlines'],
    answer:
      'The hero section is terminal-inspired: avatar, name treatment, a flipping role board, résumé button, GitHub stats, floating project imagery and social links.',
  },
  {
    keywords: [
      'chat',
      'ask',
      'assistant',
      'open the assistant',
      'open assistant',
      'how to open',
      'talk to you',
      'questions',
    ],
    answer:
      'Open the Assistant from the sparkle button in the right rail, the navbar, or the mobile menu. It streams answers, keeps a local conversation history, supports slash commands such as /projects, /experience and /help, and links directly to portfolio sections. The fair-use limit is 30 questions per rolling 24 hours.',
  },
  {
    keywords: ['guide', 'help', 'how to use', 'commands'],
    answer:
      'Ask about a project, relevant experience, availability, writing, or a technical topic. Type / to see commands: /projects, /experience, /about, /blog, /contact, /resume, /new, /stop, /copy and /help. Answers include links so you can verify the context on the portfolio.',
  },
  {
    keywords: [
      'design',
      'theme',
      'dark mode',
      'style',
      'aesthetic',
      'color scheme',
      'ui',
      'ux',
    ],
    answer:
      'The site uses a dark terminal-inspired design system with Geist fonts, a sky accent, hairline borders and compact radii, following a Vercel/Linear/Geist visual language. It has sticky-scroll sections, a dot-grid overlay and a custom cursor.',
  },
  {
    keywords: [
      'animations',
      'effects',
      'particles',
      'three.js',
      'webgl',
      '3d',
      'r3f',
      'react-three',
    ],
    answer:
      'Three.js via react-three-fiber powers a restrained 3D starfield on dark themes that gently follows pointer movement. The site also uses GSAP scroll choreography, a scroll-driven projects transition, Lenis smooth scrolling and FLIP animations.',
  },
  {
    keywords: ['search', 'search bar', 'magnifying glass', 'search this site', 'command', 'palette'],
    answer:
      'The search in the navbar is a command palette — open it or press Cmd/Ctrl+K, type a section, page or skill, and jump straight there.',
  },
  {
    keywords: ['navigation', 'menu', 'drawer', 'sections', 'how to navigate'],
    answer:
      'Use the navbar pill at the top — groups open dropdowns with featured cards — or the menu sheet on mobile. Home sections: About, Experience, Projects, Blog, Reviews and Contact. Separate pages: /resume, /projects/[id] and /blog/[slug].',
  },
  {
    keywords: ['status', 'available', 'freelance', 'open to work', 'hiring', 'resume'],
    answer:
      'Vyacheslav is open to freelance work and interesting projects. The hero shows his current availability and a downloadable résumé; the Contact section has the fastest ways to reach him.',
  },
  {
    keywords: ['reviews', 'testimonials', 'feedback', 'clients'],
    answer:
      'The Reviews section collects feedback from people he has worked with. It is linked from the home page navigation.',
  },
  {
    keywords: ['blog', 'writing', 'articles', 'posts'],
    answer:
      'The Blog section has technical notes and experiments, including building this portfolio, integrating a Node.js backend, replacing the globe visualization, and automating Discord orb quests. Each post has its own /blog/[slug] page.',
  },
  {
    keywords: ['github', 'source code', 'repository', 'repo', 'open source'],
    answer:
      'The portfolio source is on GitHub at github.com/drme-bit/drme-bit.github.io. Project repositories are linked from their individual project pages.',
  },
];

function findAnswer(query: string): string | null {
  if (!query) return null;
  const lower = query.toLowerCase();

  let best: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length;
      }
    }
    if (entry.priority) score *= entry.priority;
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  }

  return best?.answer || null;
}

export default findAnswer;
