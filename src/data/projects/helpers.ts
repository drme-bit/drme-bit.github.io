export const STATUS = {
  ACTIVE: { icon: '●', cls: 'badge--active', label: 'active' },
  ARCHIVED: { icon: '◌', cls: 'badge--archived', label: 'archived' },
};

export const PRESENTATION = {
  patch: { cls: 'pp-page--patch', eyebrow: 'release notes', hint: 'structured like a patch breakdown' },
  classic: { cls: 'pp-page--classic', eyebrow: 'project profile', hint: 'structured like a case study' },
  compact: { cls: 'pp-page--compact', eyebrow: 'snapshot', hint: 'compressed and data-heavy' },
};

export function createProject(overrides: Record<string, any>) {
  return {
    id: '',
    title: '',
    url: '#',
    repo: '',
    desc: '',
    fullDesc: '',
    tech: [],
    status: 'ACTIVE',
    logo: null,
    image: null,
    images: [],
    video: null,
    stages: [],
    features: [],
    architecture: '',
    challenges: '',
    plans: '',
    presentation: { mode: 'classic' },
    facts: [],
    sections: [],
    ...overrides,
  };
}
