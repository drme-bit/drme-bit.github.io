interface KnowledgeEntry {
  keywords: string[];
  priority?: number;
  answer: string;
}

const KNOWLEDGE: KnowledgeEntry[] = [
  {
    keywords: ['what is this', 'what is this site', 'what is this website', 'this site', 'about this site', 'tell me about this', 'portfolio', ''],
    priority: 1,
    answer:
      "This is Vyacheslav Tkachyk's personal site — built with Next.js, React, Tailwind, GSAP and Lenis. It features a live 3D terrain background, a scroll-driven PROJECTS portal, an experience timeline, and an AI chat behind the Ask button.",
  },
  {
    keywords: ['who made', 'who built', 'who created', 'creator', 'author', 'vyacheslav', 'tkachyk', 'tkachik', 'your name', 'developer', 'about you'],
    priority: 2,
    answer:
      "Vyacheslav Tkachyk, also known as drme-bit. Full-stack developer into web tech, game servers, and 3D visuals. This site is his playground.",
  },
  {
    keywords: ['skills', 'technologies', 'tech stack', 'what can you do', 'languages', 'stack', 'know', 'proficient', 'experienced with'],
    answer:
      "Vyacheslav works with React, TypeScript, JavaScript, Node.js, Three.js, R3F, Rust, Python, Go, Java, C/C++/C#, SCSS, PostgreSQL, Redis, Docker, Git, Luau, Linux, WebGPU and OpenGL.",
  },
  {
    keywords: ['projects', 'work', 'what have you built', 'what did you make', 'showcase', 'portfolio projects'],
    answer:
      "Three featured projects: 1) Nexagon — game server monitoring platform built with Rust, React and WebGPU (also his diploma thesis). 2) BloxingBad — PvP combat systems on Roblox. 3) GMod × Roblox — a Garry's Mod-style sandbox toybox. He also does freelance — Roblox experiences, bots, backend APIs, and custom full-stack solutions.",
  },
  {
    keywords: ['experience', 'job', 'work history', 'career', 'background', 'professional', 'employment'],
    answer:
      "Timeline highlights: freelance development since 2021 — Roblox experiences with 2,000+ daily players, Discord/Telegram bots, and backend systems. A banking app simulation backend (REST accounts, transactions, transfers) as a team project. Nexagon (2026) as his bachelor's thesis in Software Engineering.",
  },
  {
    keywords: ['contact', 'email', 'reach', 'get in touch', 'social', 'hire', 'message'],
    answer:
      "You can reach Vyacheslav via email at vacheslavtkachik@gmail.com, on LinkedIn, or on his Discord server — all linked in the contacts section of this site, which also has a contact form. He's open to freelance and collaboration.",
  },
  {
    keywords: ['education', 'study', 'studying', 'university', 'college', 'degree', 'bachelor', 'learn', 'diploma'],
    answer:
      "Vyacheslav earned a Professional Junior Bachelor's degree in Software Engineering in 2026. His diploma project was Nexagon — a game server monitoring platform built with Rust, React and WebGPU.",
  },
  {
    keywords: ['location', 'where are you', 'based', 'live', 'country', 'timezone'],
    answer:
      "Based in Odesa, Ukraine (GMT+3), working remotely as a freelance developer.",
  },
  {
    keywords: ['globe', '3d globe', 'skills globe', 'sphere', '3d skills', 'terrain', 'background'],
    answer:
      "The old skills globe is gone — the background is now a live 3D terrain rendered with Three.js and react-three-fiber, with drifting noise, a starfield, and beacons. It even pauses itself while the PROJECTS portal covers the screen.",
  },
  {
    keywords: ['timeline', 'experience timeline', 'scroll timeline', 'beam', 'rail'],
    answer:
      "The Experience section is a scroll-driven timeline: a glowing beam fills as you scroll, sticky year titles ride along, and a times rail on the right tracks where you are. Click any period to jump to it.",
  },
  {
    keywords: ['terminal', 'hero', 'whoami', 'crt', 'scanlines'],
    answer:
      "The hero section is terminal-inspired: avatar, shimmer name, a flipping role board, resume button, live GitHub stats, floating project photos, and social links. It sets the whole hacker aesthetic.",
  },
  {
    keywords: ['companion cube', 'mascot', 'who are you', 'what are you', 'cube'],
    answer:
      "I'm a Companion Cube — a legendary artifact. My job is to answer questions about this site. Hit the Ask button in the navbar to open this chat — no floating cube anymore, I moved in here.",
  },
  {
    keywords: ['chat', 'ask', 'ai assistant', 'how to open', 'talk to you'],
    answer:
      "This chat! Open it with the Ask button in the navbar (top right). You get about 10 questions per day, and you can pick the model in the chat header. I answer from the site knowledge plus an AI backend when it's configured.",
  },
  {
    keywords: ['aperture', 'portal', 'glados', 'cake', 'aperture science'],
    priority: 3,
    answer:
      "Ah, a person of culture! I'm a Companion Cube from Aperture Science — legendary artifact, heart-shaped face, full of sarcasm. The cake is a lie, but the design is real.",
  },
  {
    keywords: ['design', 'theme', 'dark mode', 'style', 'aesthetic', 'color scheme', 'ui', 'ux'],
    answer:
      "The site uses a dark terminal-inspired design system with Geist fonts, accent sky (#7dd3fc), hairline borders and 6px radii, following Vercel/Linear/Geist language. It features sticky-scroll sections, a dot-grid overlay, and a custom arrow cursor.",
  },
  {
    keywords: ['animations', 'effects', 'particles', 'three.js', 'webgl', '3d', 'r3f', 'react-three'],
    answer:
      "Heavy use of Three.js via react-three-fiber: the live 3D terrain with drifting noise, starfield and beacons. Plus GSAP scroll choreography, a scroll-driven SVG camera flight into the PROJECTS section, Lenis smooth scrolling, and FLIP animations. All budgeted per-frame for Safari.",
  },
  {
    keywords: ['search', 'search bar', 'magnifying glass', 'search this site', 'command', 'palette'],
    answer:
      "The search in the navbar is a real command palette — hit it or press Cmd/Ctrl+K, type a section, page or skill, and jump straight there. It also scrolls its own list while the page stays put.",
  },
  {
    keywords: ['navigation', 'menu', 'drawer', 'sections', 'how to navigate'],
    answer:
      "Use the navbar pill at the top — groups open dropdowns with featured cards — or the menu sheet on mobile. Sections on the home page: About, Experience, Projects, Blog, Reviews, Contacts.",
  },
  {
    keywords: ['status', 'available', 'freelance', 'open to work', 'hiring', 'resume'],
    answer:
      "Vyacheslav is currently available for freelance work! Check the hero section for his status and a downloadable resume button.",
  },
  {
    keywords: ['github', 'source code', 'repository', 'repo', 'open source'],
    answer:
      "The source code for this portfolio is on GitHub at github.com/drme-bit/drme-bit.github.io. Project repos are linked on the project pages.",
  },
];

function findAnswer(query: string): string | null {
  if (!query) return null;
  const lower = query.toLowerCase();

  let best: KnowledgeEntry | null = null;
  let bestScore = 0;

  for (const entry of KNOWLEDGE) {
    let score = 0;
    for (const kw of entry.keywords) {
      if (lower.includes(kw)) {
        score += kw.length;
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
