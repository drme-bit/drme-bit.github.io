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
      "This is Vyacheslav Tkachik's personal site — built with React, Three.js, R3F, and SCSS. It features a 3D skills globe, terminal-style hero, scrolling timeline, and a Companion Cube mascot.",
  },
  {
    keywords: ['who made', 'who built', 'who created', 'creator', 'author', 'vyacheslav', 'tkachik', 'your name', 'developer', 'about you'],
    priority: 2,
    answer:
      "Vyacheslav Tkachik, also known as drme-bit. Full-stack developer into web tech, game servers, and 3D visuals. Born in 2006. This site is his playground.",
  },
  {
    keywords: ['skills', 'technologies', 'tech stack', 'what can you do', 'languages', 'stack', 'know', 'proficient', 'experienced with'],
    answer:
      "Vyacheslav works with React, TypeScript, Three.js, R3F, SCSS, Rust, WebGPU, Luau, roblox-ts, MySQL, Python, and C/C++/C#. The 3D globe on this site knows the main ones.",
  },
  {
    keywords: ['projects', 'work', 'what have you built', 'what did you make', 'showcase', 'portfolio projects'],
    answer:
      "Three featured projects: 1) drme-bit.github.io — this very portfolio with 3D globe and terminal UI. 2) Nexagon — game server monitoring dashboard built with Rust, React, and WebGPU. 3) Freelance Roblox developer — admin panels, vehicle systems, anti-cheat for communities with 2000+ daily players. Check the system registry section!",
  },
  {
    keywords: ['experience', 'job', 'work history', 'career', 'background', 'professional', 'employment'],
    answer:
      "Three entries on the timeline: 1) Freelance Roblox Developer (2023–present) — custom game systems for Roblox. 2) Nexagon diploma projects (2026) — bachelor's in Software Engineering. 3) Bot Developer (2023–present) — freelance automation and bots.",
  },
  {
    keywords: ['contact', 'email', 'reach', 'get in touch', 'social', 'hire', 'message'],
    answer:
      "You can reach Vyacheslav via email at vacheslavtkachik@gmail.com, or check out his GitHub at github.com/drme-bit. There's also a contact form in the contacts section of this site. He's open to freelance and collaboration.",
  },
  {
    keywords: ['education', 'study', 'studying', 'university', 'college', 'degree', 'bachelor', 'learn'],
    answer:
      "Vyacheslav earned his Bachelor's in Software Engineering in 2026. His diploma projects was Nexagon — a game server monitoring tool built with Rust, React, and much more.",
  },
  {
    keywords: ['location', 'where are you', 'based', 'live', 'country', 'timezone'],
    answer:
      "Currently based in Ukraine. Working remotely as a freelance developer. The terminal hero section on this site shows the location too.",
  },
  {
    keywords: ['globe', '3d globe', 'skills globe', 'sphere', '3d skills'],
    answer:
      "That's the interactive 3D skills globe in the skills section! Built with Three.js and react-three-fiber. It shows tech skills as orbiting nodes with connecting lines. Click a skill to highlight it. The globe even has a subtle float animation and pulse rings. I'm a bit jealous of it, honestly.",
  },
  {
    keywords: ['timeline', 'experience timeline', 'scroll timeline', 'head dot', 'golden dot'],
    answer:
      "The timeline in the Experience section has a sticky golden head dot that travels down as you scroll — like Git HEAD. Entries light up when the dot reaches them. On mobile the line shifts to the left. Pretty slick.",
  },
  {
    keywords: ['terminal', 'hero', 'terminal section', 'whoami', 'crt', 'scanlines'],
    answer:
      "The hero section features a terminal with CRT scanlines, a live clock, ambient particles floating upward, and a glowing pulse animation. There's a $ whoami greeting, location, and a 'resume' button. It sets the whole hacker aesthetic.",
  },
  {
    keywords: ['companion cube', 'mascot', 'who are you', 'what are you', 'cube'],
    answer:
      "I'm a Companion Cube — a legendary artifact. My job is to sit here, look cute with my heart-shaped face, and make sarcastic comments. Click me to chat! I can answer questions about this site or just entertain you with random tech facts.",
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
      "The site uses a dark terminal-inspired design system with monospace fonts, accent cyan (#5ec8d8), and subtle borders. It features sticky-scroll sections, a dot-grid overlay, and custom cursor trails. The overall vibe is 'hacker-chic meets Aperture Science.'",
  },
  {
    keywords: ['animations', 'effects', 'particles', 'three.js', 'webgl', '3d', 'r3f', 'react-three'],
    answer:
      "Heavy use of Three.js via react-three-fiber: the 3D skills globe with wireframe, particles, connecting lines, and float animation. Also ambient canvas particles in the hero, CRT scanlines, custom cursor trails, and FLIP modal animations in the projects section. All with rAF-based scroll updates for smoothness on mobile.",
  },
  {
    keywords: ['search', 'search bar', 'magnifying glass', 'search this site'],
    answer:
      "That search bar in the top right? Yeah, it doesn't actually search anything. It's just there to look cool. Try clicking it — I'll pop up and mock you for it. I told you it doesn't work!",
  },
  {
    keywords: ['navigation', 'menu', 'drawer', 'sections', 'how to navigate'],
    answer:
      "Use the Navbar at the top or the Drawer menu (hamburger icon) to jump between sections: Hero, About, Skills, Experience, Projects, Contacts. Each section has a terminal-style header with a number like [01], [02], etc.",
  },
  {
    keywords: ['status', 'available', 'freelance', 'open to work', 'hiring', 'resume'],
    answer:
      "Vyacheslav is currently available for freelance work! Check the hero section for his status — there's an 'available for work' indicator and a resume button (inactive for now, but the info is there).",
  },
  {
    keywords: ['github', 'source code', 'repository', 'repo', 'open source'],
    answer:
      "The source code for this portfolio is on GitHub at github.com/drme-bit/drme-bit.github.io. Other projects like Nexagon also have repos linked in the projects cards.",
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
