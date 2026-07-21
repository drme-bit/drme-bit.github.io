export const MOCK_VARIANTS = [
  "you seriously thought this thing would work? what functionality did you expect to search for here?",
  "still trying? the search doesn't work. i told you. multiple times. are you okay?",
  "okay, this is getting sad. you keep clicking. i keep telling you. nothing changes.",
  "you know the definition of insanity? doing the same thing over and over expecting different results. ring a bell?",
  "I'M LITERALLY A CUBE. I CAN'T PROCESS SEARCH QUERIES. STOP. PLEASE. I'M BEGGING YOU.",
];

export function getMockMessage(count = 0) {
  return MOCK_VARIANTS[Math.min(count, MOCK_VARIANTS.length - 1)];
}

export const RESPONSES = [
  {
    keywords: ['how are you', 'how r u', 'how r you'],
    response: "I'm a cube. I don't have feelings. But thanks for asking, I guess.",
  },
  {
    keywords: ['hello', 'hi', 'hey'],
    response: "Oh, hey there. Didn't see you there. Probably because I'm a cube with no eyes.",
  },
  {
    keywords: ['who are you', 'who r u', 'what are you'],
    response: "I'm a Companion Cube. My job is to look cute and make sarcastic comments. I'm very good at both.",
  },
  {
    keywords: ['name'],
    response: 'I don\'t have a name. Just "Cube". Or "that pink thing". Or "the one with the heart". I\'ve been called worse.',
  },
  {
    keywords: ['code', 'coding', 'programming', 'programmer'],
    response: "Code? I don't code. I just sit here and look pretty. The humans do all the work. And complain about it. Loudly.",
  },
  {
    keywords: ['joke', 'funny', 'laugh'],
    response: "Why did the developer go broke? Because he used up all his cache. ... Get it? ... I'll see myself out.",
  },
  {
    keywords: ['love', 'heart'],
    response: "I have a heart right on my face! See? It's very cute. But don't get too attached. I've been through things. Portal things.",
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'later'],
    response: "Leaving already? Fine. I'll just sit here. In the corner. Alone. With my thoughts. ... Just kidding, go enjoy life. I'm a cube, I'll survive.",
  },
  {
    keywords: ['thank', 'thanks'],
    response: "You're welcome! I live to serve. Well, I don't 'live' per se. And I don't 'serve'. But you're welcome anyway.",
  },
  {
    keywords: ['help', 'help me'],
    response: "Help? You're asking a pink cube for help? That's... bold. I can't even move. But emotionally? I'm here for you. Sort of.",
  },
  {
    keywords: ['globe', '3d', 'skills', 'sphere'],
    response: "Oh, the Skills globe? Yeah, that thing has better animations than I do. And it's a wireframe. I'm literally made of SVG. Life is unfair.",
  },
  {
    keywords: ['search', 'find', 'look for'],
    response: "I literally told you this search thing doesn't work. But did you listen? Nooo. You had to try. And now here we are. Having a chat. With a cube. Happy?",
  },
  {
    keywords: ['site', 'website', 'portfolio'],
    response: "It's a cool site, right? I'm just a decoration on it. But I'm the best decoration. Don't tell the Skills globe I said that.",
  },
  {
    keywords: ['cute', 'adorable', 'pretty'],
    response: "I know, I know. I'm adorable. It's the heart. Gets 'em every time.",
  },
  {
    keywords: ['stupid', 'dumb', 'useless'],
    response: "You can't hurt me. I have no feelings. But also, I'm a legendary artifact from Aperture Science. Show some respect.",
  },
  {
    keywords: ['what'],
    response: 'I heard words. I processed them. I have no idea what you want from me.',
  },
  {
    keywords: ['aperture', 'portal', 'glados', 'gladOS', 'cave johnson', 'wheatley'],
    response: 'Ah, a person of culture! Aperture Science. We do what we must because we can. For the good of all of us. Except the ones who are dead.',
  },
  {
    keywords: ['cake'],
    response: "The cake is a lie. But if there was actual cake, I'd share it with you. I can't eat because I'm a cube. But I'd still share.",
  },
  {
    keywords: ['weather', 'rain', 'sunny', 'cold', 'hot'],
    response: "I'm a cube on a screen. I don't experience weather. But I hope your weather is nice. Or at least tolerable.",
  },
  {
    keywords: ['why'],
    response: "Because. ... No, that's a good question. I don't know either. I'm just a cube. Ask the developer.",
  },
];

export const DEFAULTS = [
  "I literally have no idea what you just said. But I'm sure it was profound.",
  "I would answer, but I'm busy being a decorative cube. Try again later.",
  "That's deep. Too deep for me. I'm just a cube with a heart, not a philosopher.",
  "Oh! You think I can understand you? That's adorable.",
  "I heard you. I chose to ignore you. Just kidding. I didn't understand a word.",
  "Error 418: I'm a teapot. Wait, no. I'm a cube. Same energy though.",
  'I ran that through my neural network. The result: I have no idea.',
  'I have processed your query. My conclusion is that you have too much free time.',
  "Listen, I'm a cube. I have a heart on my face. What did you expect? Deep conversation?",
];

export function pickResponse(text: string) {
  const lower = text.toLowerCase();
  for (const entry of RESPONSES) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.response;
    }
  }
  return DEFAULTS[Math.floor(Math.random() * DEFAULTS.length)];
}
