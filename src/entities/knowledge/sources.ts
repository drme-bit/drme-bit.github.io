export interface KnowledgeSource {
  title: string;
  description: string;
  href: string;
}

const SOURCES = {
  projects: {
    title: 'Selected projects',
    description: 'Case studies and shipped work',
    href: '#projects',
  },
  nexagon: {
    title: 'Nexagon',
    description: 'Rust, React, WebGPU and WASM',
    href: '/projects/nexagon',
  },
  experience: {
    title: 'Experience',
    description: 'Timeline and areas of work',
    href: '#experience',
  },
  resume: {
    title: 'Résumé',
    description: 'A concise professional overview',
    href: '/resume',
  },
  writing: {
    title: 'Writing',
    description: 'Technical notes and experiments',
    href: '#blog',
  },
  contact: {
    title: 'Contact',
    description: 'Work together or start a conversation',
    href: '#contact',
  },
  about: {
    title: 'About Vyacheslav',
    description: 'Focus, principles and working style',
    href: '#about',
  },
} satisfies Record<string, KnowledgeSource>;

function includesAny(text: string, terms: readonly string[]) {
  return terms.some((term) => text.includes(term));
}

/**
 * Recommendations are derived from the visitor's request, never fabricated by
 * a model response. This keeps the assistant anchored in available content.
 */
export function getRelatedSources(question: string): KnowledgeSource[] {
  const text = question.toLowerCase();

  if (includesAny(text, ['nexagon', 'rust', 'webgpu', 'wasm'])) {
    return [SOURCES.nexagon, SOURCES.projects];
  }
  if (includesAny(text, ['experience', 'career', 'background', 'history', 'work history'])) {
    return [SOURCES.experience, SOURCES.projects];
  }
  if (includesAny(text, ['contact', 'hire', 'freelance', 'available', 'collaborat'])) {
    return [SOURCES.contact, SOURCES.resume];
  }
  if (includesAny(text, ['article', 'write', 'blog', 'post'])) {
    return [SOURCES.writing, SOURCES.projects];
  }
  if (includesAny(text, ['about', 'who', 'based', 'location', 'principles'])) {
    return [SOURCES.about, SOURCES.experience];
  }

  return [SOURCES.projects, SOURCES.contact];
}
