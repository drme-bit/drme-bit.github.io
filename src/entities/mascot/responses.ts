/* Lightweight offline fallback for the portfolio assistant. The hosted model
   gives richer answers; these replies keep the local experience useful and
   aligned with the source cards shown below each answer. */

export const RESPONSES = [
  {
    keywords: ['hello', 'hi', 'hey', 'how are you'],
    response: 'Hi — I can help you find a project, relevant experience, or a way to get in touch.',
  },
  {
    keywords: ['project', 'work', 'portfolio', 'case study'],
    response: 'The strongest starting points are the project case studies. I can narrow them down by product, backend, systems, or interface work.',
  },
  {
    keywords: ['nexagon', 'rust', 'webgpu', 'backend', 'system'],
    response: 'Nexagon is the best fit for systems-oriented work: it combines real-time server monitoring with Rust, React, and WebGPU.',
  },
  {
    keywords: ['experience', 'team', 'career', 'job'],
    response: 'The experience timeline gives the clearest view of roles, responsibilities, and the kinds of products Vyacheslav has worked on.',
  },
  {
    keywords: ['available', 'freelance', 'hire', 'contact', 'email'],
    response: 'Vyacheslav is open to selected collaborations. The contact section has the direct email and the best next step.',
  },
  {
    keywords: ['blog', 'article', 'write', 'writing'],
    response: 'The writing section collects short notes on architecture, backends, and the practical side of shipping software.',
  },
  {
    keywords: ['skill', 'stack', 'technology', 'react', 'typescript'],
    response: 'Rather than a list of tools, the project pages show the stack in context — what each technology was used for and why.',
  },
  {
    keywords: ['resume', 'cv'],
    response: 'The résumé has a concise overview of experience, education, and technical background.',
  },
];

export const DEFAULTS = [
  'I can help with projects, experience, writing, availability, or contact details. Try one of those directions.',
  'Could you make that a little more specific? For example: “Which project shows backend work?”',
  'I did not find a precise local answer, but the related portfolio links below are the best place to continue.',
];

/* Kept as a tiny compatibility surface for the existing mascot model.
   Unlike the former persona copy, repeated fallback questions stay useful. */
export const MOCK_VARIANTS = DEFAULTS;

export function getMockMessage(count = 0) {
  return MOCK_VARIANTS[Math.min(Math.max(0, count), MOCK_VARIANTS.length - 1)];
}

export function pickResponse(text: string) {
  const lower = text.toLowerCase();
  const match = RESPONSES.find((entry) => entry.keywords.some((keyword) => lower.includes(keyword)));
  return match?.response ?? DEFAULTS[Math.floor(Math.random() * DEFAULTS.length)];
}
